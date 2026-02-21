/**
 * Full MockupML templates — canonical layouts (Material Dashboard / CoreUI style).
 * Fixed structure: no overlapping, clear sections, one row for stats.
 * AI should COPY this structure and only change titles and content (text, stat values, list items).
 */
import type { TemplateId } from "./templates.ts";

/** appShell: header + sidebar (empty, chrome is fixed) + main. Default for "nav left + header top". */
const APP_SHELL = `<mockup template="appShell" title="Dashboard">
  <slot name="header"><h1>Dashboard</h1></slot>
  <slot name="sidebar"></slot>
  <slot name="main">
    <section title="Overview">
      <row>
        <card title="Key metric 1"><stat label="LABEL" value="0"/></card>
        <card title="Key metric 2"><stat label="LABEL" value="0"/></card>
        <card title="Key metric 3"><stat label="LABEL" value="0"/></card>
      </row>
    </section>
    <section title="Chart">
      <card title="Chart">
        <chart type="bar" title="Overview"/>
      </card>
    </section>
    <section title="Table">
      <card title="Data">
        <table title=""><col label="Col 1"/><col label="Col 2"/></table>
      </card>
    </section>
    <section title="Activity">
      <card title="Recent">
        <list title=""><item title="Item" meta=""/></list>
      </card>
    </section>
  </slot>
</mockup>`;

/** dashboard: header + main (wider) + right sidebar. */
const DASHBOARD = `<mockup template="dashboard" title="Dashboard">
  <slot name="header"><h1>Dashboard</h1></slot>
  <slot name="main">
    <section title="Overview">
      <row>
        <card title=""><stat label="METRIC" value="0"/></card>
        <card title=""><stat label="METRIC" value="0"/></card>
        <card title=""><stat label="METRIC" value="0"/></card>
      </row>
    </section>
    <section title="Chart">
      <card title=""><chart type="line" title="Trend"/></card>
    </section>
    <section title="Table">
      <card title=""><table title=""><col label="A"/><col label="B"/></table></card>
    </section>
  </slot>
  <slot name="right">
    <section title="Insights">
      <card title=""><note tone="info">Note text.</note></card>
    </section>
    <section title="Actions">
      <card title=""><button label="Action"/></card>
    </section>
  </slot>
</mockup>`;

/** singleColumn: header + main only. */
const SINGLE_COLUMN = `<mockup template="singleColumn" title="Page">
  <slot name="header"><h1>Page title</h1></slot>
  <slot name="main">
    <section title="Section">
      <card title=""><text>Content.</text></card>
    </section>
    <section title="More">
      <card title=""><button label="Button"/></card>
    </section>
  </slot>
</mockup>`;

/** masterDetail: list + detail. */
const MASTER_DETAIL = `<mockup template="masterDetail" title="List">
  <slot name="header"><h1>List</h1></slot>
  <slot name="list">
    <list title="Items">
      <item title="Item 1" meta=""/>
      <item title="Item 2" meta=""/>
    </list>
  </slot>
  <slot name="detail">
    <section title="Detail">
      <card title=""><h2>Title</h2><text>Content.</text></card>
    </section>
  </slot>
</mockup>`;

/** threeColumn: left + main + right. */
const THREE_COLUMN = `<mockup template="threeColumn" title="Dashboard">
  <slot name="header"><h1>Dashboard</h1></slot>
  <slot name="left">
    <section title="Nav"><list title=""><item title="Link" meta=""/></list></section>
  </slot>
  <slot name="main">
    <section title="Content"><card title=""><stat label="Metric" value="0"/></card></section>
  </slot>
  <slot name="right">
    <section title="Side"><card title=""><note tone="info">Info.</note></card></section>
  </slot>
</mockup>`;

/** landing: hero + sections + footer. */
const LANDING = `<mockup template="landing" title="Landing">
  <slot name="hero">
    <section title="">
      <h1>Headline</h1>
      <text>Tagline.</text>
      <button label="Get started"/>
    </section>
  </slot>
  <slot name="sections">
    <section title="Features">
      <row>
        <card title=""><h2>Feature</h2><text>Description.</text></card>
        <card title=""><h2>Feature</h2><text>Description.</text></card>
      </row>
    </section>
  </slot>
  <slot name="footer"><text>Footer links.</text></slot>
</mockup>`;

const FULL_TEMPLATES: Record<TemplateId, string> = {
  appShell: APP_SHELL,
  dashboard: DASHBOARD,
  singleColumn: SINGLE_COLUMN,
  masterDetail: MASTER_DETAIL,
  threeColumn: THREE_COLUMN,
  landing: LANDING,
};

export function getFullTemplateMockupML(templateId: TemplateId): string {
  return FULL_TEMPLATES[templateId] ?? APP_SHELL;
}

export const FILL_IN_ONLY_INSTRUCTION = `
LAYOUT RULES (Material Dashboard / CoreUI style — keep layouts clean):
- Copy the STRUCTURE TO USE exactly. Same sections, same cards, same rows. Do not add or remove sections/cards/rows.
- Only change: mockup title=, section title=, card title=, text content, stat label= and value=, list item title= and meta=, table col label=, button label=, note text. Replace placeholder content with the user's topic (e.g. SEO, Analytics, Profile).
- One section per block. One row for horizontal stat cards. No overlapping. Use spacer only between sections if needed.
- Escape ampersands in text as &amp; (e.g. R&amp;D).
`.trim();
