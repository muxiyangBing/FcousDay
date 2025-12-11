import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  PenLine, 
  Trash2, 
  Sparkles,
  FileText,
  Image as ImageIcon,
  FileDown,
  Share2,
  CalendarCheck,
  Eye,
  Menu,
  Languages,
  Activity
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { Note, ViewMode, EditorTab, AppModule, Language } from './types';
import { getNotes, saveNote, deleteNote, createNote } from './services/storageService';
import { MarkdownViewer } from './components/MarkdownViewer';
import { AIPanel } from './components/AIPanel';
import { MarkdownToolbar } from './components/MarkdownToolbar';
import { HabitTracker } from './components/HabitTracker';
import { BodyTracker } from './components/BodyTracker';
import { getTranslation } from './utils/translations';

// Utility component for sticky headers
const Header = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => (
  <header className={`sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between shadow-sm ${className}`}>
    {children}
  </header>
);

const App: React.FC = () => {
  // Language State
  const [language, setLanguage] = useState<Language>('zh-CN');
  const t = getTranslation(language);

  // Module State: Default to HABITS as requested
  const [currentModule, setCurrentModule] = useState<AppModule>(AppModule.HABITS);

  // Notes State
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LIST);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [editorTab, setEditorTab] = useState<EditorTab>(EditorTab.WRITE);
  const [showAI, setShowAI] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  // Load Preferences
  useEffect(() => {
    const savedLang = localStorage.getItem('markease_lang') as Language;
    if (savedLang) setLanguage(savedLang);
    setNotes(getNotes());
  }, []);

  // Save Language
  const toggleLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('markease_lang', lang);
    setShowLangMenu(false);
  };

  // Save Note Effect
  useEffect(() => {
    if (activeNote) {
      setIsSaving(true);
      const timer = setTimeout(() => {
        saveNote(activeNote);
        setNotes(prev => prev.map(n => n.id === activeNote.id ? activeNote : n));
        setIsSaving(false);
      }, 500); // Debounce save
      return () => clearTimeout(timer);
    }
  }, [activeNote]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = () => {
        setShowExportMenu(false);
        setShowLangMenu(false);
    };
    if (showExportMenu || showLangMenu) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [showExportMenu, showLangMenu]);

  // Handlers
  const handleCreateNote = () => {
    const newNote = createNote(t.notes.newNoteTitle, t.notes.newNoteContent);
    saveNote(newNote);
    setNotes([newNote, ...notes]);
    setActiveNote(newNote);
    setViewMode(ViewMode.EDITOR);
    setEditorTab(EditorTab.WRITE);
  };

  const handleOpenNote = (note: Note) => {
    setActiveNote(note);
    setViewMode(ViewMode.EDITOR);
    setEditorTab(EditorTab.WRITE);
  };

  const handleDeleteNote = () => {
    if (activeNote && window.confirm(t.common.confirmDelete)) {
      deleteNote(activeNote.id);
      setNotes(notes.filter(n => n.id !== activeNote.id));
      setActiveNote(null);
      setViewMode(ViewMode.LIST);
    }
  };

  const handleUpdateTitle = (title: string) => {
    if (activeNote) {
      setActiveNote({ ...activeNote, title, updatedAt: Date.now() });
    }
  };

  const handleUpdateContent = (content: string) => {
    if (activeNote) {
      setActiveNote({ ...activeNote, content, updatedAt: Date.now() });
    }
  };

  const handleInsertMarkdown = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current || !activeNote) return;
    const textarea = textareaRef.current;
    
    // Get selections
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = activeNote.content;
    
    const before = content.substring(0, start);
    const selected = content.substring(start, end);
    const after = content.substring(end);
    
    const newContent = before + prefix + selected + suffix + after;
    
    handleUpdateContent(newContent);
    
    requestAnimationFrame(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            const cursorStart = start + prefix.length;
            const cursorEnd = end + prefix.length;
            textareaRef.current.setSelectionRange(cursorStart, cursorEnd);
        }
    });
  };

  const handleAIApply = (newText: string) => {
    if (activeNote) {
      const isAppend = newText.length < activeNote.content.length && activeNote.content.length > 100;
      if (isAppend) {
          handleUpdateContent(activeNote.content + "\n" + newText);
      } else {
           handleUpdateContent(newText);
      }
      setShowAI(false);
    }
  };
  
  // Download Markdown
  const handleDownloadMarkdown = () => {
    if (!activeNote) return;
    const blob = new Blob([activeNote.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export as Image
  const handleExportImage = async () => {
    if (!activeNote) return;
    
    const isMobile = window.innerWidth < 768;
    const wasInWriteMode = editorTab === EditorTab.WRITE;
    
    if (isMobile && wasInWriteMode) {
        setEditorTab(EditorTab.PREVIEW);
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    if (exportRef.current) {
        try {
            const element = exportRef.current;
            const contentWidth = element.scrollWidth;
            const contentHeight = element.scrollHeight;
            const padding = 24; 

            const dataUrl = await toPng(element, { 
                cacheBust: true, 
                backgroundColor: '#ffffff',
                width: contentWidth + (padding * 2), 
                height: contentHeight + (padding * 2),
                style: { 
                  margin: `${padding}px`,
                  width: `${contentWidth}px`,
                  height: `${contentHeight}px`,
                  overflow: 'hidden', 
                },
                quality: 1.0,
                pixelRatio: 2 
            });

            const link = document.createElement('a');
            link.download = `${activeNote.title.replace(/\s+/g, '_') || 'note'}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Export image failed', err);
            alert('Failed to export image. Please try again.');
        }
    }

    if (isMobile && wasInWriteMode) {
        setEditorTab(EditorTab.WRITE);
    }
  };

  // --- RENDER HELPERS ---

  // Navigation Bar Component
  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe-bottom z-40 flex justify-around items-center h-16 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
       {/* 1. Habits (First) */}
       <button 
         onClick={() => setCurrentModule(AppModule.HABITS)}
         className={`flex flex-col items-center gap-1 w-full h-full justify-center ${currentModule === AppModule.HABITS ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
       >
         <CalendarCheck size={22} className={currentModule === AppModule.HABITS ? 'fill-indigo-100' : ''} />
         <span className="text-[10px] font-bold">{t.nav.habits}</span>
       </button>
       
       {/* 2. Notes (Second) */}
       <button 
         onClick={() => setCurrentModule(AppModule.NOTES)}
         className={`flex flex-col items-center gap-1 w-full h-full justify-center ${currentModule === AppModule.NOTES ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
       >
         <FileText size={22} className={currentModule === AppModule.NOTES ? 'fill-indigo-100' : ''} />
         <span className="text-[10px] font-bold">{t.nav.notes}</span>
       </button>
       
       {/* 3. Body (Third - New) */}
       <button 
         onClick={() => setCurrentModule(AppModule.BODY)}
         className={`flex flex-col items-center gap-1 w-full h-full justify-center ${currentModule === AppModule.BODY ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
       >
         <Activity size={22} className={currentModule === AppModule.BODY ? 'fill-indigo-100' : ''} />
         <span className="text-[10px] font-bold">{t.nav.body}</span>
       </button>
    </div>
  );

  // --- MAIN RENDER LOGIC ---

  // 1. HABIT TRACKER MODULE
  if (currentModule === AppModule.HABITS) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
         <HabitTracker lang={language} />
         <div className="h-20" /> {/* Spacer for Nav */}
         <BottomNav />
      </div>
    );
  }
  
  // 2. BODY TRACKER MODULE
  if (currentModule === AppModule.BODY) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
           <BodyTracker lang={language} />
           <div className="h-20" /> {/* Spacer for Nav */}
           <BottomNav />
        </div>
      );
  }

  // 3. NOTES MODULE - List View
  if (viewMode === ViewMode.LIST) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header>
          <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <PenLine size={18} />
            </div>
            {t.notes.appTitle}
          </div>
          
          <div className="flex items-center gap-2">
              <div className="text-xs text-slate-500 font-medium bg-slate-200 px-2 py-1 rounded-full">
                {notes.length} {t.notes.countSuffix}
              </div>
              
              {/* Language Switcher */}
              <div className="relative">
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     setShowLangMenu(!showLangMenu);
                   }}
                   className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                 >
                   <Languages size={20} />
                 </button>
                 {showLangMenu && (
                   <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                      <button onClick={() => toggleLanguage('zh-CN')} className={`w-full text-left px-4 py-3 hover:bg-slate-50 text-sm ${language === 'zh-CN' ? 'text-indigo-600 font-bold' : 'text-slate-700'}`}>简体中文</button>
                      <button onClick={() => toggleLanguage('en-US')} className={`w-full text-left px-4 py-3 hover:bg-slate-50 text-sm ${language === 'en-US' ? 'text-indigo-600 font-bold' : 'text-slate-700'}`}>English</button>
                   </div>
                 )}
              </div>
          </div>
        </Header>

        <main className="flex-1 p-4 overflow-y-auto pb-24">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 mt-10">
              <FileText size={64} className="mb-4 opacity-20" />
              <p>{t.notes.emptyState}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => handleOpenNote(note)}
                  className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-300 transition-all text-left group"
                >
                  <h3 className="font-semibold text-slate-800 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                    {note.title || t.notes.newNoteTitle}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-3 font-mono text-xs leading-relaxed">
                    {note.content}
                  </p>
                  <div className="mt-4 text-xs text-slate-400">
                    {new Date(note.updatedAt).toLocaleDateString(language)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </main>

        <div className="fixed bottom-20 right-6 z-40">
          <button
            onClick={handleCreateNote}
            className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          >
            <Plus size={28} />
          </button>
        </div>
        
        <BottomNav />
      </div>
    );
  }

  // 4. NOTES MODULE - Editor View
  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden relative">
      <Header>
        <div className="flex items-center gap-2 flex-1">
          <button onClick={() => setViewMode(ViewMode.LIST)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
            <ChevronLeft size={24} />
          </button>
          <input
            type="text"
            value={activeNote?.title || ''}
            onChange={(e) => handleUpdateTitle(e.target.value)}
            className="font-bold text-lg text-slate-800 bg-transparent outline-none w-full placeholder:text-slate-400"
            placeholder={t.notes.titlePlaceholder}
          />
        </div>
        <div className="flex items-center gap-1">
          <div className="text-xs text-slate-400 mr-2 hidden sm:block">
            {isSaving ? t.common.saving : t.common.saved}
          </div>
          
          <div className="relative">
             <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setShowExportMenu(!showExportMenu);
                }} 
                className={`p-2 rounded-full text-slate-600 transition-colors ${showExportMenu ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100'}`}
             >
                <Share2 size={20} />
             </button>
             
             {showExportMenu && (
                 <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                     <button 
                        onClick={() => {
                            handleDownloadMarkdown();
                            setShowExportMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-2 text-sm text-slate-700"
                     >
                         <FileDown size={16} />
                         <span>{t.notes.saveAsMarkdown}</span>
                     </button>
                     <button 
                        onClick={() => {
                            handleExportImage();
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-2 text-sm text-slate-700"
                     >
                         <ImageIcon size={16} />
                         <span>{t.notes.exportImage}</span>
                     </button>
                 </div>
             )}
          </div>

          <button onClick={handleDeleteNote} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full">
            <Trash2 size={20} />
          </button>
        </div>
      </Header>

      {/* Editor / Preview Area */}
      <main className="flex-1 overflow-hidden relative flex">
        {/* Editor Pane */}
        <div className={`flex-1 h-full flex flex-col ${editorTab === EditorTab.PREVIEW ? 'hidden md:flex' : 'flex'}`}>
           <MarkdownToolbar onInsert={handleInsertMarkdown} />
           
           <textarea
             ref={textareaRef}
             value={activeNote?.content || ''}
             onChange={(e) => handleUpdateContent(e.target.value)}
             className="flex-1 w-full p-4 md:p-8 resize-none outline-none font-mono text-sm md:text-base leading-relaxed text-slate-800 bg-white"
             placeholder={t.notes.newNoteContent}
             spellCheck={false}
           />
        </div>

        {/* Preview Pane */}
        <div 
          className={`
            flex-1 h-full overflow-y-auto bg-slate-50 border-l border-slate-200 p-4 md:p-8 
            ${editorTab === EditorTab.WRITE ? 'hidden md:block' : 'block'}
            md:block
          `}
        >
          <div ref={exportRef} className="bg-white md:bg-transparent inline-block min-w-full">
             <MarkdownViewer content={activeNote?.content || ''} />
          </div>
        </div>
      </main>

      {/* Bottom Editor Toolbar */}
      <div className="border-t border-slate-200 bg-white p-2 flex justify-between items-center md:hidden safe-area-bottom">
         <div className="flex bg-slate-100 rounded-lg p-1">
            <button 
              onClick={() => setEditorTab(EditorTab.WRITE)}
              className={`p-2 rounded-md flex items-center gap-2 ${editorTab === EditorTab.WRITE ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
            >
              <PenLine size={18} />
              <span className="text-xs font-medium">{t.notes.edit}</span>
            </button>
            <button 
              onClick={() => setEditorTab(EditorTab.PREVIEW)}
              className={`p-2 rounded-md flex items-center gap-2 ${editorTab === EditorTab.PREVIEW ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
            >
              <Eye size={18} />
              <span className="text-xs font-medium">{t.notes.preview}</span>
            </button>
         </div>

         <button 
           onClick={() => setShowAI(true)}
           className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95"
         >
           <Sparkles size={16} />
           <span className="text-sm font-bold">{t.notes.aiAssist}</span>
         </button>
      </div>

      <div className="hidden md:block absolute bottom-8 right-8">
        <button 
           onClick={() => setShowAI(true)}
           className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-105"
         >
           <Sparkles size={18} />
           <span className="font-bold">{t.notes.aiAssist}</span>
         </button>
      </div>

      {showAI && activeNote && (
        <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-end md:items-center md:justify-center">
          <div className="w-full md:w-[600px] md:relative">
             <AIPanel 
               currentText={activeNote.content} 
               onApply={handleAIApply}
               onClose={() => setShowAI(false)}
               lang={language}
             />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;