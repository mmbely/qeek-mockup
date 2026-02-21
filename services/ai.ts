import Anthropic from "@anthropic-ai/sdk";
import { PatchOp } from "../types.ts";
import { TEMPLATES, PREDEFINED_ELEMENTS, type TemplateId } from "../lib/templates.ts";
import { getFullTemplateMockupML, FILL_IN_ONLY_INSTRUCTION } from "../lib/full-templates.ts";

const CLAUDE_MODEL = "claude-haiku-4-5-20251001";
const PATCH_OP_TYPES = new Set<PatchOp["type"]>(["replace", "insertAfter", "insertBefore", "delete"]);

function extractPatchOps(patchBody: string): PatchOp[] {
  const parser = new DOMParser();
  const serializer = new XMLSerializer();
  const wrapped = `<root>${patchBody}</root>`;
  const doc = parser.parseFromString(wrapped, "application/xml");
  const parseError = doc.querySelector("parsererror");

  if (parseError) {
    const patchTags = patchBody.match(/<patch\b[\s\S]*?<\/patch>/g) || [];
    const opTags = patchBody.match(/<op\b[\s\S]*?\/>|<op\b[\s\S]*?<\/op>/g) || [];
    const candidates = patchTags.length ? patchTags : opTags;

    return candidates
      .map((fragment) => {
        const opType = (fragment.match(/type\s*=\s*["']([^"']+)["']/) || [])[1] as PatchOp["type"];
        const target = (fragment.match(/target\s*=\s*["']([^"']+)["']/) || [])[1];
        const valueMatch = fragment.match(/<value>([\s\S]*?)<\/value>/);
        const value = valueMatch ? valueMatch[1].trim() : undefined;
        if (!PATCH_OP_TYPES.has(opType) || !target) return null;
        return { type: opType, target, value };
      })
      .filter((op): op is PatchOp => Boolean(op));
  }

  const opsFromPatch = Array.from(doc.querySelectorAll("patch"))
    .map((patchEl) => {
      const opEl = patchEl.querySelector("op");
      const opType = ((opEl?.getAttribute("type") || patchEl.getAttribute("type")) as PatchOp["type"] | null);
      const target = opEl?.getAttribute("target") || patchEl.getAttribute("target");
      if (!opType || !PATCH_OP_TYPES.has(opType) || !target) return null;

      const valueEl = patchEl.querySelector("value");
      let value: string | undefined;
      if (valueEl) {
        value = Array.from(valueEl.childNodes).map((n) => serializer.serializeToString(n)).join("").trim();
        if (!value) {
          const textValue = valueEl.textContent?.trim();
          if (textValue) value = textValue;
        }
      }

      return { type: opType, target, value };
    })
    .filter((op): op is PatchOp => Boolean(op));

  const standaloneOps = Array.from(doc.querySelectorAll("op"))
    .filter((opEl) => opEl.parentElement?.tagName.toLowerCase() !== "patch")
    .map((opEl) => {
      const opType = opEl.getAttribute("type") as PatchOp["type"] | null;
      const target = opEl.getAttribute("target");
      if (!opType || !PATCH_OP_TYPES.has(opType) || !target) return null;

      let value: string | undefined;
      const siblingValue = opEl.nextElementSibling;
      if (siblingValue && siblingValue.tagName.toLowerCase() === "value") {
        value = Array.from(siblingValue.childNodes).map((n) => serializer.serializeToString(n)).join("").trim() || undefined;
      }

      return { type: opType, target, value };
    })
    .filter((op): op is PatchOp => Boolean(op));

  return [...opsFromPatch, ...standaloneOps];
}

function buildSystemPrompt(preferredTemplateId?: TemplateId): string {
  const templateList = TEMPLATES.map((t) => `- ${t.id}: ${t.promptHint}`).join("\n");
  const fullTemplateBlock = preferredTemplateId
    ? `

STRUCTURE TO USE — copy this exact MockupML; only change titles and content (do not add/remove sections or cards):

${getFullTemplateMockupML(preferredTemplateId)}

${FILL_IN_ONLY_INSTRUCTION}
`
    : `

LAYOUT & CLARITY: One section per block. One row for horizontal stat cards. No overlapping. Group related content in one card. Escape & as &amp; in text.
`;

  return `You are a UI designer. You output only MockupML (XML). No markdown, no commentary.

TEMPLATES (use ONLY these; all are mobile-responsive):
${templateList}
${preferredTemplateId ? `\nPREFERRED TEMPLATE: Use template "${preferredTemplateId}". For CREATE, output the STRUCTURE TO USE above with only titles and content filled from the user request.` : ""}

${PREDEFINED_ELEMENTS}
${fullTemplateBlock}

RULES:
1. Wrap every response in <response action="create">...</response> or <response action="patch">...</response>.
2. CREATE: Output the exact structure from STRUCTURE TO USE, with only mockup title=, section/card titles, and content (text, stat values, list items, button labels) changed per the user request. Same hierarchy, same number of sections/cards/rows.
3. PATCH: <patch><op type="replace|insertAfter|insertBefore|delete" target="selector"/><value>xml</value></patch>. Selectors: slot[name='main'], card[title='X'], section[title='Y'].
4. Valid XML only. No code blocks.`;
}

export async function callMockupAI(
  userInput: string,
  currentMockup?: string,
  preferredTemplateId?: TemplateId
): Promise<{ type: "create" | "patch"; data: string | PatchOp[] }> {
  const apiKey =
    (typeof import.meta !== "undefined" && (import.meta as { env?: { VITE_ANTHROPIC_API_KEY?: string } }).env?.VITE_ANTHROPIC_API_KEY) ||
    (typeof process !== "undefined" && process.env?.ANTHROPIC_API_KEY) ||
    "";
  if (!apiKey.trim()) {
    throw new Error(
      "ANTHROPIC_API_KEY is missing. In this Vite app the key is read from the browser, so add VITE_ANTHROPIC_API_KEY to .env or .env.local (do not commit real keys)."
    );
  }
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const userContent = currentMockup
    ? `CURRENT MOCKUP:\n${currentMockup}\n\nUSER REQUEST: ${userInput}`
    : userInput;

  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: buildSystemPrompt(preferredTemplateId),
    messages: [{ role: "user", content: userContent }],
    temperature: 0.1,
  });

  const text =
    message.content
      .filter((b): b is { type: "text"; text: string } => b.type === "text")
      .map((b) => b.text)
      .join("") || "";

  const createMatch = text.match(/<response\s+action=["']create["']>([\s\S]*?)<\/response>/);
  if (createMatch) {
    return { type: "create", data: createMatch[1].trim() };
  }

  const patchMatch = text.match(/<response\s+action=["']patch["']>([\s\S]*?)<\/response>/);
  if (patchMatch) {
    const ops = extractPatchOps(patchMatch[1]);
    if (ops.length === 0) return { type: "patch", data: [] };
    return { type: "patch", data: ops };
  }

  if (text.includes("<mockup")) {
    const mockupOnly = text.match(/<mockup[\s\S]*<\/mockup>/);
    return { type: "create", data: mockupOnly ? mockupOnly[0] : text };
  }

  throw new Error("AI returned an unrecognizable format.");
}
