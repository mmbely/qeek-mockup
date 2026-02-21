
import { ASTNode, PatchOp } from '../types.ts';

/**
 * Validates MockupML tags to ensure security and schema compliance.
 */
const ALLOWED_TAGS = new Set([
  'mockup', 'slot', 'section', 'card', 'note', 'text', 'h1', 'h2', 'row',
  'button', 'input', 'select', 'option', 'tabs', 'tab', 'list', 'item',
  'table', 'col', 'stat', 'trend', 'badge', 'divider', 'spacer', 'placeholder', 'chart'
]);

/**
 * Basic XML Parser using Browser DOMParser.
 * Converts XML string to our AST format.
 */
function escapeXmlAmpersands(xml: string): string {
  return xml.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;');
}

export function parseMockupML(xml: string): ASTNode | null {
  if (!xml) return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(escapeXmlAmpersands(xml), 'application/xml');
  
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    console.error('XML Parsing Error:', parseError.textContent);
    return null;
  }

  const root = doc.documentElement;
  if (!root || root.tagName.toLowerCase() !== 'mockup') {
    return null;
  }

  return elementToAST(root);
}

function elementToAST(el: Element): ASTNode {
  const attributes: Record<string, string> = {};
  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i];
    attributes[attr.name] = attr.value;
  }

  const children: ASTNode[] = [];
  el.childNodes.forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const childEl = node as Element;
      if (ALLOWED_TAGS.has(childEl.tagName.toLowerCase())) {
        children.push(elementToAST(childEl));
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        children.push({
          tag: 'text_node',
          attributes: {},
          children: [],
          textContent: text
        });
      }
    }
  });

  return {
    tag: el.tagName.toLowerCase(),
    attributes,
    children
  };
}

/**
 * Applies a list of patch operations to the current XML.
 */
export function applyPatch(currentXml: string, patches: PatchOp[]): string {
  if (!currentXml || !Array.isArray(patches) || patches.length === 0) return currentXml || '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(escapeXmlAmpersands(currentXml), 'application/xml');
  const docParseError = doc.querySelector('parsererror');
  if (docParseError) {
    console.error('Current XML parse error while applying patch:', docParseError.textContent);
    return currentXml;
  }
  const serializer = new XMLSerializer();

  patches.forEach(patch => {
    try {
      if (!patch?.target) {
        console.warn('Skipping patch with empty target.');
        return;
      }
      const targetEl = doc.querySelector(patch.target);
      if (!targetEl) {
        console.warn(`Patch target not found: ${patch.target}`);
        return;
      }

      if (patch.type === 'delete') {
        targetEl.remove();
        return;
      }

      if (patch.value === undefined) return;

      // Parse the value fragment
      const fragmentDoc = parser.parseFromString(`<dummy>${escapeXmlAmpersands(patch.value)}</dummy>`, 'application/xml');
      const fragmentParseError = fragmentDoc.querySelector('parsererror');
      if (fragmentParseError) {
        console.warn('Skipping patch with invalid XML value:', fragmentParseError.textContent);
        return;
      }
      const fragmentNodes = Array.from(fragmentDoc.documentElement.childNodes);

      switch (patch.type) {
        case 'replace':
          fragmentNodes.forEach(node => targetEl.parentNode?.insertBefore(node.cloneNode(true), targetEl));
          targetEl.remove();
          break;
        case 'insertBefore':
          fragmentNodes.forEach(node => targetEl.parentNode?.insertBefore(node.cloneNode(true), targetEl));
          break;
        case 'insertAfter':
          fragmentNodes.forEach(node => targetEl.parentNode?.insertBefore(node.cloneNode(true), targetEl.nextSibling));
          break;
      }
    } catch (err) {
      console.error('Error applying patch:', err);
    }
  });

  return serializer.serializeToString(doc);
}

/**
 * Clean up XML for display or storage.
 */
export function formatXml(xml: string): string {
  if (!xml) return '';
  let formatted = '';
  let indent = '';
  xml.split(/>\s*</).forEach(node => {
    if (node.match(/^\/\w/)) indent = indent.substring(2);
    formatted += indent + '<' + node + '>\n';
    if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('input') && !node.startsWith('divider') && !node.startsWith('spacer') && !node.startsWith('col') && !node.startsWith('placeholder')) indent += '  ';
  });
  return formatted.startsWith('<') ? formatted.substring(0, formatted.length - 1) : '<' + formatted.substring(1, formatted.length - 1);
}
