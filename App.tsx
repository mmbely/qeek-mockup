import React, { useState, useEffect, useRef } from 'react';
import { Message, MockupState } from './types.ts';
import { parseMockupML, applyPatch, formatXml } from './lib/mockup-logic.ts';
import { callMockupAI } from './services/ai.ts';
import MockupRenderer from './components/MockupRenderer.tsx';
import { TEMPLATES, type TemplateId } from './lib/templates.ts';
import { Monitor, Tablet, Smartphone, Code, LayoutTemplate, Maximize2, X } from 'lucide-react';
import { TemplateThumbnail } from './components/TemplateThumbnail';

type DeviceView = 'desktop' | 'tablet' | 'mobile';

const VIEW_WIDTHS: Record<DeviceView, string> = {
  desktop: 'w-full max-w-7xl',
  tablet: 'w-[768px]',
  mobile: 'w-[375px]',
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [mockup, setMockup] = useState<MockupState>({ xml: '', history: [] });
  const [inputText, setInputText] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId | ''>('appShell');
  const [deviceView, setDeviceView] = useState<DeviceView>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const result = await callMockupAI(userMessage.content, mockup.xml, selectedTemplateId || undefined);
      
      let nextXml = mockup.xml;
      let assistantText = "";

      if (result.type === 'create') {
        nextXml = result.data as string;
        assistantText = "I've created a new mockup for you.";
      } else {
        nextXml = applyPatch(mockup.xml, result.data as any[]);
        assistantText =
          nextXml !== mockup.xml
            ? "I've updated the mockup with your changes."
            : "I couldn't apply that update to the current mockup. Try naming a specific section or card title to edit.";
      }

      if (nextXml !== mockup.xml) {
        setMockup(prev => ({
          xml: nextXml,
          history: [...prev.history, nextXml]
        }));
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error while generating the mockup.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const examples = [
    "Build a user profile dashboard with analytics.",
    "Create a checkout form with shipping info.",
    "Add a 'Delete User' button to the current view.",
    "Make this a mobile dashboard mockup."
  ];

  const ast = parseMockupML(mockup.xml);

  const PreviewContent = ({ deviceView: view }: { deviceView: DeviceView }) => (
    <>
      {showCode ? (
        <div className="bg-slate-900 text-indigo-300 p-6 rounded-xl font-mono text-sm overflow-auto h-full min-h-0 shadow-2xl border border-slate-800">
          <pre>{formatXml(mockup.xml)}</pre>
        </div>
      ) : (
        ast ? <MockupRenderer node={ast} deviceView={view} /> : <div className="text-red-500 font-bold bg-white dark:bg-slate-800 p-4 rounded-xl shadow">Could not render mockup structure. Please try another prompt.</div>
      )}
    </>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors overflow-hidden">
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-900 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold italic shadow-lg">M</div>
          <h1 className="font-bold text-lg tracking-tight">MockupML <span className="text-indigo-600">AI</span></h1>
        </div>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Toggle theme">
          {isDarkMode ? '🌙' : '☀️'}
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className="w-full md:w-[400px] border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {messages.length === 0 && (
               <div className="flex flex-col items-center justify-center h-full text-center space-y-6 px-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 text-3xl">✨</div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">Start Designing</h3>
                    <p className="text-sm text-slate-500">Ask the AI to generate a professional UI mockup.</p>
                  </div>
                  <div className="grid gap-2 w-full">
                    {examples.map((ex, i) => (
                      <button key={i} onClick={() => setInputText(ex)} className="text-left text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">{ex}</button>
                    ))}
                  </div>
               </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && <div className="text-xs text-slate-500 italic px-4 animate-pulse">AI is thinking...</div>}
          </div>
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">Layout template</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-all text-left ${selectedTemplateId === t.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                  title={`${t.name}: ${t.description}`}
                >
                  <TemplateThumbnail templateId={t.id} />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{t.shortLabel}</span>
                </button>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Describe your UI..."
                className="flex-1 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm"
              />
              <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg disabled:opacity-50 transition-opacity">Send</button>
            </form>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden">
          {!mockup.xml ? (
            <div className="flex-1 flex items-center justify-center opacity-30 text-xl font-bold uppercase tracking-widest pointer-events-none">Preview Area</div>
          ) : (
            <>
              <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    {(['desktop', 'tablet', 'mobile'] as const).map((view) => (
                      <button
                        key={view}
                        type="button"
                        onClick={() => setDeviceView(view)}
                        className={`p-1.5 rounded-md transition-colors ${deviceView === view ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        title={view === 'desktop' ? 'Desktop' : view === 'tablet' ? 'Tablet' : 'Mobile'}
                        aria-label={view}
                      >
                        {view === 'desktop' && <Monitor className="w-4 h-4" />}
                        {view === 'tablet' && <Tablet className="w-4 h-4" />}
                        {view === 'mobile' && <Smartphone className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-2 hidden sm:inline">
                    {deviceView === 'desktop' ? 'Desktop' : deviceView === 'tablet' ? 'Tablet' : 'Mobile'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(true)}
                    className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Full screen"
                    aria-label="Full screen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setShowCode(false)}
                      className={`p-1.5 rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium ${!showCode ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      <LayoutTemplate className="w-4 h-4" /> Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCode(true)}
                      className={`p-1.5 rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium ${showCode ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      <Code className="w-4 h-4" /> Code
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 md:p-6 flex justify-center">
                <div className={`${showCode ? 'w-full max-w-4xl' : VIEW_WIDTHS[deviceView]} transition-all duration-300 flex-shrink-0 ${showCode ? '' : 'bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[400px] overflow-y-auto'} min-h-0`}>
                  <PreviewContent deviceView={deviceView} />
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {mockup.xml && isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setIsFullscreen(false)}>
          <div className={`${VIEW_WIDTHS[deviceView]} max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col`} onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 right-0 flex justify-end p-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <button type="button" onClick={() => setIsFullscreen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500" aria-label="Close fullscreen">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
              <PreviewContent deviceView={deviceView} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
