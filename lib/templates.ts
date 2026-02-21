/**
 * Classic app templates. All are responsive: mobile = single column / stacked.
 * Use ONLY these template ids in MockupML.
 */
export const TEMPLATES = [
  { id: 'appShell', shortLabel: 'Nav + content', name: 'Header + 2 col (nav + content)', description: 'Left sidebar nav, main content area. Classic dashboard/admin.', slots: ['header', 'sidebar', 'main'], promptHint: 'appShell: header (top bar), sidebar (left nav), main (content).' },
  { id: 'dashboard', shortLabel: 'Content + sidebar', name: 'Header + 2 col (content + sidebar)', description: 'Main content wider, right sidebar. Analytics, feeds.', slots: ['header', 'main', 'right'], promptHint: 'dashboard: header, main (primary content), right (sidebar).' },
  { id: 'singleColumn', shortLabel: 'Header + content', name: 'Header + content', description: 'Single column. Landing, article, simple app.', slots: ['header', 'main'], promptHint: 'singleColumn: header, main (full-width content).' },
  { id: 'masterDetail', shortLabel: 'List + detail', name: 'Header + list + detail', description: 'List on left (or top on mobile), detail pane. Inbox, settings.', slots: ['header', 'list', 'detail'], promptHint: 'masterDetail: header, list (items), detail (selected item).' },
  { id: 'threeColumn', shortLabel: '3 column', name: 'Header + 3 column', description: 'Left + center + right. Mail-style or complex dashboards.', slots: ['header', 'left', 'main', 'right'], promptHint: 'threeColumn: header, left, main, right.' },
  { id: 'landing', shortLabel: 'Landing', name: 'Landing (hero + sections + footer)', description: 'Marketing page. Hero, sections, footer.', slots: ['hero', 'sections', 'footer'], promptHint: 'landing: hero (top CTA), sections (content blocks), footer.' },
] as const;

export type TemplateId = (typeof TEMPLATES)[number]['id'];

export const TEMPLATE_IDS = TEMPLATES.map((t) => t.id);

/**
 * Predefined elements the AI must use. No arbitrary HTML.
 */
export const PREDEFINED_ELEMENTS = `
ELEMENTS (use only these):
- Structure: section (title="..."), card (title="..."), row (horizontal group, stacks on mobile)
- Text: h1, h2, text
- Data: stat (label, value), trend (label, value, direction="up|down|flat"), list (title) + item (title, meta), table (title) + col (label)
- Charts: chart (type="bar|line|pie|area|mini", title="...") for bar chart, trend/line graph, pie chart, area chart, or mini sparkline. Prefer <chart type="bar"> or <chart type="line"> over placeholder when showing metrics over time.
- UI: button (label), input (placeholder), select + option (label), tabs + tab (label)
- Feedback: note (tone="info|warn|todo")
- Layout: badge (label), divider, spacer (size="xs|sm|md|lg"), placeholder (kind="chart|image|avatar|...")
`.trim();

export function getTemplateById(id: string) {
  return TEMPLATES.find((t) => t.id === id);
}
