import React from 'react';
import { 
  Bold, Italic, Heading1, Heading2, List, 
  ListTodo, Quote, Code, Link, Image, Table
} from 'lucide-react';

interface MarkdownToolbarProps {
  onInsert: (prefix: string, suffix?: string) => void;
}

export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({ onInsert }) => {
  const tools = [
    { icon: <Heading1 size={18} />, label: 'H1', prefix: '# ', suffix: '' },
    { icon: <Heading2 size={18} />, label: 'H2', prefix: '## ', suffix: '' },
    { icon: <Bold size={18} />, label: 'Bold', prefix: '**', suffix: '**' },
    { icon: <Italic size={18} />, label: 'Italic', prefix: '_', suffix: '_' },
    { icon: <List size={18} />, label: 'List', prefix: '- ', suffix: '' },
    { icon: <ListTodo size={18} />, label: 'Task', prefix: '- [ ] ', suffix: '' },
    { icon: <Quote size={18} />, label: 'Quote', prefix: '> ', suffix: '' },
    { icon: <Code size={18} />, label: 'Code', prefix: '`', suffix: '`' },
    { 
      icon: <Table size={18} />, 
      label: 'Table', 
      prefix: '\n| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n', 
      suffix: '' 
    },
    { icon: <Link size={18} />, label: 'Link', prefix: '[', suffix: '](url)' },
    { icon: <Image size={18} />, label: 'Image', prefix: '![alt](', suffix: ')' },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto p-2 bg-slate-50 border-b border-slate-200 no-scrollbar touch-pan-x select-none">
      {tools.map((tool, index) => (
        <button
          key={index}
          onMouseDown={(e) => {
             e.preventDefault(); // Prevents focus loss from textarea
             onInsert(tool.prefix, tool.suffix);
          }}
          className="p-2 text-slate-500 hover:bg-white hover:text-indigo-600 rounded-lg transition-colors min-w-[40px] flex items-center justify-center active:scale-95 active:bg-indigo-50"
          title={tool.label}
          type="button"
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
};