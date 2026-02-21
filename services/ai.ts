import Anthropic from "@anthropic-ai/sdk";
import { PatchOp } from "../types.ts";
import { TEMPLATES, PREDEFINED_ELEMENTS, type TemplateId } from "../lib/templates.ts";
import { getFullTemplateMockupML, FILL_IN_ONLY_INSTRUCTION } from "../lib/full-templates.ts";

const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

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

  const createMatch = text.match(/<response action="create">([\s\S]*?)<\/response>/);
  if (createMatch) {
    return { type: "create", data: createMatch[1].trim() };
  }

  const patchMatch = text.match(/<response action="patch">([\s\S]*?)<\/response>/);
  if (patchMatch) {
    const patchTags = patchMatch[1].match(/<patch>[\s\S]*?<\/patch>/g) || [];
    const ops: PatchOp[] = patchTags.map((p) => {
      const opType = (p.match(/type="([^"]+)"/) || [])[1] as PatchOp["type"];
      const target = (p.match(/target="([^"]+)"/) || [])[1];
      const valueMatch = p.match(/<value>([\s\S]*?)<\/value>/);
      const value = valueMatch ? valueMatch[1].trim() : undefined;
      return { type: opType, target, value };
    });
    return { type: "patch", data: ops };
  }

  if (text.includes("<mockup")) {
    const mockupOnly = text.match(/<mockup[\s\S]*<\/mockup>/);
    return { type: "create", data: mockupOnly ? mockupOnly[0] : text };
  }

  throw new Error("AI returned an unrecognizable format.");
}
