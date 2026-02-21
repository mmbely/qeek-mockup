import React, { useId } from 'react';
import { ASTNode, TemplateKind } from '../types.ts';
import {
  Menu, User, Bell, Settings, LayoutDashboard, FileText, Users, Search,
  MoreHorizontal, Info, AlertTriangle, CheckSquare, Plus, BarChart3, Image as ImageIcon,
  MapPin, Calendar, Layers,
} from 'lucide-react';

type DeviceView = 'desktop' | 'tablet' | 'mobile';

interface RendererProps {
  node: ASTNode;
  deviceView?: DeviceView;
}

const NodeRenderer: React.FC<RendererProps> = ({ node, deviceView: appDeviceView }) => {
  const { tag, attributes, children, textContent } = node;
  const chartGradId = useId().replace(/:/g, '-');

  if (tag === 'text_node') return <>{textContent}</>;

  const isVisualChild = (n: ASTNode) => n.tag !== 'slot' && n.tag !== 'col' && n.tag !== 'item';
  const renderChildren = (filter: (n: ASTNode) => boolean = isVisualChild) =>
    children.filter(filter).map((child, idx) => <NodeRenderer key={idx} node={child} />);

  switch (tag) {
    case 'mockup': {
      const template = attributes.template as TemplateKind;
      const title = attributes.title;
      const view = appDeviceView ?? (attributes.deviceHint as DeviceView) ?? 'desktop';
      const slots = children.filter(c => c.tag === 'slot');
      const getSlot = (name: string) => slots.find(s => s.attributes.name === name);
      const deviceStyles = view === 'mobile' ? 'w-full max-w-[375px]' : view === 'tablet' ? 'w-full max-w-[768px]' : 'w-full max-w-7xl';

      const slot = (name: string) => getSlot(name) && <NodeRenderer node={getSlot(name)!} />;

      if (template === 'appShell') {
        return (
          <div data-view={view} className={`flex flex-col lg:flex-row min-h-full bg-slate-50 dark:bg-slate-950 ${deviceStyles} mx-auto overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl`}>
            <aside className="w-full lg:w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden lg:flex flex-col">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 font-bold text-xl tracking-tight text-indigo-600">MockupML</div>
              <nav className="flex-1 p-4 space-y-1">
                {[{ icon: LayoutDashboard, label: 'Dashboard' }, { icon: FileText, label: 'Projects' }, { icon: Users, label: 'Team' }, { icon: Settings, label: 'Settings' }].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                    <item.icon className="w-4 h-4" />{item.label}
                  </div>
                ))}
              </nav>
            </aside>
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
              <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <Menu className="w-5 h-5 text-slate-500 lg:hidden flex-shrink-0" />
                  {slot('header')}
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <Bell className="w-5 h-5" />
                  <User className="w-5 h-5" />
                </div>
              </header>
              <main className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-5xl mx-auto space-y-6">{slot('main')}</div>
              </main>
            </div>
          </div>
        );
      }

      if (template === 'dashboard') {
        return (
          <div data-view={view} className={`min-h-full bg-slate-50 dark:bg-slate-950 p-6 ${deviceStyles} mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden`}>
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-wrap justify-between items-end gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title || 'Dashboard'}</h1>
                  {slot('header')}
                </div>
                <div className="flex gap-2">
                  <button type="button" className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                    <Settings className="w-4 h-4 text-slate-500" />
                  </button>
                  <button type="button" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium shadow-sm">New Action</button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className={getSlot('right') ? 'lg:col-span-8' : 'lg:col-span-12'}>
                  <div className="space-y-6">{slot('main')}</div>
                </div>
                {getSlot('right') && (
                  <div className="lg:col-span-4 space-y-6">{slot('right')}</div>
                )}
              </div>
            </div>
          </div>
        );
      }

      if (template === 'masterDetail') {
        return (
          <div data-view={view} className={`flex flex-col lg:flex-row min-h-full bg-white dark:bg-slate-900 ${deviceStyles} mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden`}>
            <div className="w-full lg:w-80 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <div className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-400">Search...</div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">{slot('list')}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-slate-950">
              <div className="max-w-3xl mx-auto space-y-6">{slot('detail')}</div>
            </div>
          </div>
        );
      }

      if (template === 'singleColumn') {
        return (
          <div data-view={view} className={`min-h-full bg-white dark:bg-slate-900 ${deviceStyles} mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden`}>
            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">{slot('header')}</div>
            <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">{slot('main')}</div>
          </div>
        );
      }

      if (template === 'threeColumn') {
        return (
          <div data-view={view} className={`min-h-full bg-slate-50 dark:bg-slate-950 p-6 ${deviceStyles} mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
              <div className="lg:col-span-2 space-y-4">{slot('left')}</div>
              <div className="lg:col-span-7 space-y-6">
                {slot('header')}
                {slot('main')}
              </div>
              <div className="lg:col-span-3 space-y-4">{slot('right')}</div>
            </div>
          </div>
        );
      }

      if (template === 'landing') {
        return (
          <div data-view={view} className={`min-h-full bg-white dark:bg-slate-900 ${deviceStyles} mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden`}>
            <nav className="h-20 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 md:px-8">
              <div className="font-bold text-xl text-indigo-600">Brand</div>
              <div className="flex gap-6 md:gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
                <span>Features</span><span>Pricing</span><span>About</span>
                <button type="button" className="px-5 py-2 bg-indigo-600 text-white rounded-full">Get Started</button>
              </div>
            </nav>
            <div className="py-12 md:py-20 px-6 md:px-8 text-center max-w-4xl mx-auto space-y-8">{slot('hero')}</div>
            <div className="py-12 md:py-20 px-6 md:px-8 bg-slate-50 dark:bg-slate-800/50">
              <div className="max-w-6xl mx-auto space-y-8">{slot('sections')}</div>
            </div>
            <footer className="py-12 px-8 border-t border-slate-100 dark:border-slate-800 text-center text-slate-400 text-sm">
              {slot('footer')}
              <div className="mt-8">© 2026 MockupML. All rights reserved.</div>
            </footer>
          </div>
        );
      }

      return (
        <div className={`bg-white dark:bg-slate-900 rounded-2xl overflow-hidden mx-auto ${deviceStyles} border border-slate-200 dark:border-slate-800 shadow-xl p-6`}>
          {title && <div className="text-lg font-bold text-slate-900 dark:text-white mb-4">{title}</div>}
          <div className="space-y-6">{slots.map((s, i) => <NodeRenderer key={i} node={s} />)}</div>
        </div>
      );
    }
    case 'slot': return <div className="space-y-6 w-full">{renderChildren()}</div>;
    case 'section': return (
      <section className="mb-8">
        {attributes.title && (
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">{attributes.title}</h3>
        )}
        <div className="space-y-4">{renderChildren()}</div>
      </section>
    );
    case 'card': return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        {attributes.title && (
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
            <span className="font-medium text-sm text-slate-700 dark:text-slate-300">{attributes.title}</span>
            <MoreHorizontal className="w-4 h-4 text-slate-400" />
          </div>
        )}
        <div className="p-4 space-y-4">{renderChildren()}</div>
      </div>
    );
    case 'row': return (
      <div className="flex flex-wrap gap-4">
        {children.filter(isVisualChild).map((child, i) => (
          <div key={i} className="flex-1 min-w-[200px]"><NodeRenderer node={child} /></div>
        ))}
      </div>
    );
    case 'h1': return <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{renderChildren()}</h1>;
    case 'text': return <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{renderChildren()}</p>;
    case 'button': return (
      <button type="button" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
        {attributes.label || renderChildren()}
      </button>
    );
    case 'input': return (
      <div className="space-y-1.5">
        {attributes.label && <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{attributes.label}</label>}
        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-400 italic">
          {attributes.placeholder || 'Enter value...'}
        </div>
      </div>
    );
    case 'stat': return (
      <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{attributes.label}</div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">{attributes.value}</div>
      </div>
    );
    case 'divider': return <hr className="border-slate-200 dark:border-slate-700" />;
    case 'note': {
      const tones: Record<string, string> = {
        info: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
        warn: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
        todo: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
      };
      const Icons: Record<string, React.ComponentType<{ className?: string }>> = { info: Info, warn: AlertTriangle, todo: CheckSquare };
      const tone = (attributes.tone as string) || 'info';
      const Icon = Icons[tone] || Info;
      return (
        <div className={`p-3 rounded-lg border flex gap-3 items-start text-sm ${tones[tone] || tones.info}`}>
          <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>{renderChildren()}</div>
        </div>
      );
    }
    case 'h2': return <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{renderChildren()}</h2>;
    case 'badge': return (
      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full text-[10px] font-bold uppercase tracking-tight">
        {attributes.label || renderChildren()}
      </span>
    );
    case 'spacer': {
      const size = attributes.size === 'lg' ? 'h-6' : attributes.size === 'md' ? 'h-4' : attributes.size === 'sm' ? 'h-2' : 'h-1';
      return <div className={size} />;
    }
    case 'placeholder': {
      const kind = (attributes.kind || 'chart').toLowerCase();
      const icons: Record<string, React.ComponentType<{ className?: string }>> = {
        chart: BarChart3, image: ImageIcon, map: MapPin, timeline: Layers, calendar: Calendar, avatar: User, icon: Layers,
      };
      const Icon = icons[kind] || BarChart3;
      const label = { chart: 'Chart', image: 'Image', map: 'Map', timeline: 'Timeline', calendar: 'Calendar', avatar: 'Avatar', icon: 'Icon' }[kind] || kind;
      return (
        <div className="w-full aspect-video bg-slate-100 dark:bg-slate-900 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 text-slate-400 min-h-[120px]">
          <Icon className="w-8 h-8" />
          <span className="text-xs font-medium uppercase tracking-widest">{label} placeholder</span>
        </div>
      );
    }
    case 'list': return (
      <div className="space-y-2">
        {attributes.title && <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{attributes.title}</h4>}
        <div className="divide-y divide-slate-100 dark:divide-slate-700 border border-slate-100 dark:border-slate-700 rounded-lg overflow-hidden">
          {children.filter(c => c.tag === 'item').map((item, i) => (
            <div key={i} className="p-3 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <span className="text-sm text-slate-700 dark:text-slate-300">{item.attributes.title}</span>
              <span className="text-xs text-slate-400">{item.attributes.meta}</span>
            </div>
          ))}
        </div>
      </div>
    );
    case 'item': return null;
    case 'table': {
      const cols = children.filter(c => c.tag === 'col');
      return (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-widest font-bold">
              <tr>
                {cols.map((col, i) => (
                  <th key={i} className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">{col.attributes.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {[1, 2, 3].map((_, r) => (
                <tr key={r}>
                  {cols.map((_, c) => (
                    <td key={c} className="px-4 py-3 text-slate-400 dark:text-slate-500 italic">Data...</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'col': return null;
    case 'tabs': return (
      <div className="flex border-b border-slate-200 dark:border-slate-700 gap-6">
        {children.filter(c => c.tag === 'tab').map((tab, i) => (
          <div key={i} className={`pb-2 text-sm font-medium cursor-pointer ${i === 0 ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600' : 'text-slate-500 dark:text-slate-400'}`}>
            {tab.attributes.label}
          </div>
        ))}
      </div>
    );
    case 'tab': return null;
    case 'trend': {
      const dir = (attributes.direction || 'flat') as 'up' | 'down' | 'flat';
      const config = {
        up: { color: 'text-emerald-500', iconRotate: '-rotate-45' },
        down: { color: 'text-rose-500', iconRotate: 'rotate-45' },
        flat: { color: 'text-slate-400', iconRotate: '' },
      }[dir] || { color: 'text-slate-400', iconRotate: '' };
      return (
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
          <div className="flex-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{attributes.label}</div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{attributes.value}</div>
          </div>
          <div className={`flex items-center gap-1 text-xs font-bold ${config.color}`}>
            <Plus className={`w-3 h-3 ${config.iconRotate}`} />
            {dir !== 'flat' && '12%'}
          </div>
        </div>
      );
    }
    case 'chart': {
      const type = ((attributes.type || 'bar') as string).toLowerCase();
      const title = attributes.title as string | undefined;
      const chartColors = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];
      const isBar = type === 'bar';
      const isLine = type === 'line' || type === 'trend';
      const isPie = type === 'pie';
      const isArea = type === 'area';
      const isMini = type === 'mini' || type === 'sparkline';

      if (isMini) {
        const pts = [30, 45, 40, 60, 55, 75, 70, 85, 80, 65];
        const w = 100; const h = 30;
        const pathD = pts.map((y, i) => `${i === 0 ? 'M' : 'L'} ${(i / (pts.length - 1)) * w} ${h - (y / 100) * h}`).join(' ');
        return (
          <div className="flex items-center gap-2">
            <svg className="w-16 h-8 text-indigo-500 flex-shrink-0" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
              <path d={pathD} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {title && <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{title}</span>}
          </div>
        );
      }

      return (
        <div className="space-y-3">
          {title && <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</h4>}
          <div className={`bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-center ${isPie ? 'aspect-square max-h-[200px]' : 'aspect-[16/9] min-h-[140px]'}`}>
            {isBar && (
              <div className="w-full h-full flex items-end gap-1.5 pb-6">
                {[40, 70, 45, 90, 65, 80, 50, 60].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-indigo-500/30 hover:bg-indigo-500/50 border-t-2 border-indigo-500 rounded-t min-h-[4px] transition-colors" style={{ height: `${height}%` }} />
                    <span className="text-[9px] text-slate-400 dark:text-slate-500">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][i]}</span>
                  </div>
                ))}
              </div>
            )}
            {isLine && (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 60" preserveAspectRatio="none">
                <path d="M0,50 L12,45 L25,48 L37,35 L50,28 L62,32 L75,22 L87,18 L100,15" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {isArea && (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 60" preserveAspectRatio="none">
                <path d="M0,50 L12,45 L25,48 L37,35 L50,28 L62,32 L75,22 L87,18 L100,15 L100,60 L0,60 Z" fill={`url(#${chartGradId})`} stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id={chartGradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            )}
            {isPie && (
              <svg className="w-full h-full max-w-[180px] max-h-[180px]" viewBox="0 0 100 100">
                {[
                  { pct: 40, start: 0 },
                  { pct: 30, start: 40 },
                  { pct: 20, start: 70 },
                  { pct: 10, start: 90 },
                ].map((seg, i) => {
                  const r = 45;
                  const cx = 50; const cy = 50;
                  const a1 = (seg.start / 100) * 2 * Math.PI - Math.PI / 2;
                  const a2 = ((seg.start + seg.pct) / 100) * 2 * Math.PI - Math.PI / 2;
                  const x1 = cx + r * Math.cos(a1); const y1 = cy + r * Math.sin(a1);
                  const x2 = cx + r * Math.cos(a2); const y2 = cy + r * Math.sin(a2);
                  const large = seg.pct > 50 ? 1 : 0;
                  const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
                  return <path key={i} d={d} fill={chartColors[i]} opacity={0.9} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />;
                })}
              </svg>
            )}
            {!isBar && !isLine && !isArea && !isPie && (
              <div className="w-full h-full flex items-end gap-1.5 pb-6">
                {[40, 70, 45, 90, 65, 80].map((h, i) => (
                  <div key={i} className="flex-1 bg-indigo-500/30 border-t-2 border-indigo-500 rounded-t min-h-[4px]" style={{ height: `${h}%` }} />
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
    case 'select': return (
      <div className="space-y-1.5">
        {attributes.label && <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{attributes.label}</label>}
        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 flex justify-between items-center">
          <span>{children.find(c => c.tag === 'option')?.attributes?.label || 'Select option...'}</span>
          <Plus className="w-4 h-4 rotate-45" />
        </div>
      </div>
    );
    case 'option': return null;
    default: return <div className="text-rose-500 text-xs italic">&lt;{tag}&gt; {renderChildren()}</div>;
  }
};

export default NodeRenderer;