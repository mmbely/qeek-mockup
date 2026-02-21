export type DeviceHint = 'mobile' | 'tablet' | 'desktop';
export type TemplateKind = 'appShell' | 'masterDetail' | 'dashboard' | 'singleColumn' | 'threeColumn' | 'landing';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface MockupState {
  xml: string;
  history: string[];
}

export interface ASTNode {
  tag: string;
  attributes: Record<string, string>;
  children: ASTNode[];
  textContent?: string;
}

export type PatchOpType = 'replace' | 'insertAfter' | 'insertBefore' | 'delete';

export interface PatchOp {
  type: PatchOpType;
  target: string;
  value?: string;
}