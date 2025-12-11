import React, { useState } from 'react';
import { Wand2, Check, X, Loader2, Sparkles, AlignLeft, SpellCheck } from 'lucide-react';
import { improveText, streamContinueWriting } from '../services/geminiService';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';

interface AIPanelProps {
  currentText: string;
  onApply: (newText: string) => void;
  onClose: () => void;
  lang: Language;
}

export const AIPanel: React.FC<AIPanelProps> = ({ currentText, onApply, onClose, lang }) => {
  const t = getTranslation(lang);
  const [loading, setLoading] = useState(false);
  const [previewText, setPreviewText] = useState<string | null>(null);

  const handleAction = async (action: string) => {
    setLoading(true);
    setPreviewText(null);
    try {
      let prompt = "";
      switch (action) {
        case 'grammar':
          prompt = t.ai.promptGrammar;
          break;
        case 'summarize':
          prompt = t.ai.promptSummarize;
          break;
        case 'polish':
          prompt = t.ai.promptPolish;
          break;
        default:
          prompt = t.ai.promptGeneric;
      }
      
      const result = await improveText(currentText, prompt);
      setPreviewText(result);
    } catch (e) {
      console.error(e);
      // In a real app, show a toast
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    setPreviewText(""); 
    
    let addedText = "";
    
    try {
      // For continuation, we might want to hint the language in the system instruction in future updates, 
      // but Gemini usually detects context language well.
      await streamContinueWriting(currentText, (chunk) => {
        addedText += chunk;
        setPreviewText(addedText);
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-slate-200 rounded-t-2xl z-50 p-4 max-h-[80vh] flex flex-col animate-slide-up">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-indigo-600 font-semibold">
          <Sparkles size={20} />
          <span>{t.ai.title}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
          <X size={20} />
        </button>
      </div>

      {!previewText && !loading && (
        <div className="grid grid-cols-2 gap-3 mb-2">
          <button 
            onClick={() => handleAction('grammar')}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
          >
            <SpellCheck className="mb-2 text-indigo-500" />
            <span className="text-sm font-medium text-slate-700">{t.ai.fixGrammar}</span>
          </button>
          
          <button 
             onClick={() => handleAction('polish')}
             className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
          >
            <Wand2 className="mb-2 text-purple-500" />
            <span className="text-sm font-medium text-slate-700">{t.ai.polish}</span>
          </button>

          <button 
             onClick={() => handleAction('summarize')}
             className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
          >
            <AlignLeft className="mb-2 text-green-500" />
            <span className="text-sm font-medium text-slate-700">{t.ai.summarize}</span>
          </button>
          
          <button 
             onClick={handleContinue}
             className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
          >
            <Sparkles className="mb-2 text-amber-500" />
            <span className="text-sm font-medium text-slate-700">{t.ai.continue}</span>
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-8 text-slate-500">
          <Loader2 className="animate-spin mb-3 text-indigo-600" size={32} />
          <p className="text-sm">{t.ai.thinking}</p>
        </div>
      )}

      {previewText !== null && !loading && (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="text-xs font-bold text-slate-400 uppercase mb-2">{t.ai.preview}</div>
          <div className="flex-1 overflow-y-auto bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm font-mono whitespace-pre-wrap mb-4">
             {previewText}
          </div>
          <div className="flex gap-3">
             <button 
               onClick={() => setPreviewText(null)}
               className="flex-1 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
             >
               {t.ai.discard}
             </button>
             <button 
               onClick={() => onApply(previewText)}
               className="flex-1 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 flex items-center justify-center gap-2"
             >
               <Check size={18} />
               {t.ai.apply}
             </button>
          </div>
        </div>
      )}
    </div>
  );
};