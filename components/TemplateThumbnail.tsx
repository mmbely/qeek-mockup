import React from 'react';
import type { TemplateId } from '../lib/templates.ts';

export function TemplateThumbnail({ templateId }: { templateId: TemplateId }) {
  switch (templateId) {
    case 'appShell':
      return (
        <div className="w-10 h-7 flex rounded overflow-hidden border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800">
          <div className="w-2.5 bg-slate-300 dark:bg-slate-600" />
          <div className="flex-1 flex flex-col">
            <div className="h-1 bg-slate-300 dark:bg-slate-600" />
            <div className="flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      );
    case 'dashboard':
      return (
        <div className="w-10 h-7 flex rounded overflow-hidden border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800">
          <div className="flex-1 flex flex-col">
            <div className="h-1 bg-slate-300 dark:bg-slate-600" />
            <div className="flex-1 flex">
              <div className="flex-1 bg-slate-200 dark:bg-slate-700" />
              <div className="w-1.5 bg-slate-300 dark:bg-slate-600" />
            </div>
          </div>
        </div>
      );
    case 'singleColumn':
      return (
        <div className="w-10 h-7 flex flex-col rounded overflow-hidden border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800">
          <div className="h-1 bg-slate-300 dark:bg-slate-600" />
          <div className="flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>
      );
    case 'masterDetail':
      return (
        <div className="w-10 h-7 flex rounded overflow-hidden border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800">
          <div className="w-2.5 bg-slate-300 dark:bg-slate-600" />
          <div className="flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>
      );
    case 'threeColumn':
      return (
        <div className="w-10 h-7 flex rounded overflow-hidden border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800">
          <div className="w-1.5 bg-slate-300 dark:bg-slate-600" />
          <div className="flex-1 bg-slate-200 dark:bg-slate-700" />
          <div className="w-1.5 bg-slate-300 dark:bg-slate-600" />
        </div>
      );
    case 'landing':
      return (
        <div className="w-10 h-7 flex flex-col rounded overflow-hidden border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800">
          <div className="h-1.5 bg-indigo-400 dark:bg-indigo-600" />
          <div className="flex-1 bg-slate-200 dark:bg-slate-700" />
          <div className="h-1 bg-slate-300 dark:bg-slate-600" />
        </div>
      );
    default:
      return <div className="w-10 h-7 rounded border border-slate-300 dark:border-slate-600 bg-slate-200 dark:bg-slate-700" />;
  }
}
