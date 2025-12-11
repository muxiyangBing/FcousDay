import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-slate prose-headings:font-semibold prose-a:text-indigo-600 max-w-none ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({node, ...props}) => (
            <div className="overflow-x-auto my-4 rounded-lg border border-slate-200">
              <table className="min-w-full border-collapse divide-y divide-slate-200" {...props} />
            </div>
          ),
          thead: ({node, ...props}) => (
            <thead className="bg-slate-50" {...props} />
          ),
          tbody: ({node, ...props}) => (
            <tbody className="divide-y divide-slate-200 bg-white" {...props} />
          ),
          tr: ({node, ...props}) => (
            <tr className="transition-colors hover:bg-slate-50/50" {...props} />
          ),
          th: ({node, ...props}) => (
            <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-r border-slate-200 last:border-r-0" {...props} />
          ),
          td: ({node, ...props}) => (
            <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-200 last:border-r-0" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};