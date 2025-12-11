import React, { useState, useEffect } from 'react';
import { Ruler, Scale, TrendingUp, Calendar, Percent, Info } from 'lucide-react';
import { getHealthRecords, saveHealthRecord } from '../services/storageService';
import { HealthMap, HealthRecord, Language } from '../types';
import { getTranslation } from '../utils/translations';

interface BodyTrackerProps {
  lang: Language;
}

// Improved Visual Model Component with Value Display
const BodyModel = ({ onPartClick, data, t }: { onPartClick: (part: string) => void, data?: any, t: any }) => {
  const highlightColor = "#6366f1"; // Indigo-500
  const baseColor = "#e2e8f0"; // Slate-200
  const strokeColor = "#94a3b8"; // Slate-400

  const getFill = (key: string) => data?.[key] ? highlightColor : baseColor;
  
  // Helper to format text with value
  const getLabel = (name: string, key: string) => {
    const val = data?.[key];
    return val ? `${name} ${val}cm` : name;
  };

  return (
    <div className="relative h-[480px] w-full flex items-center justify-center">
      <svg viewBox="0 0 300 600" className="h-full drop-shadow-xl" style={{ filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.08))' }}>
        
        {/* Definition Cache */}
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- Body Silhouette --- */}
        <g stroke={strokeColor} strokeWidth="2" fill="#f8fafc">
            {/* Head & Neck */}
            <path d="M130,70 C130,40 140,30 150,30 C160,30 170,40 170,70 C170,90 165,100 165,110 L135,110 C135,100 130,90 130,70 Z" />
            
            {/* Body, Arms, Hands, Legs */}
            <path d="
              M135,110 L165,110  
              C195,115 210,120 220,135 
              C230,150 230,160 235,220 
              C236,230 245,235 245,245 
              C245,255 230,260 225,250 
              L220,230 
              C215,180 200,180 200,180 
              L200,240 
              C200,280 210,300 210,350 
              L205,480 
              C205,500 185,500 180,480 
              L175,370 
              L150,350 
              L125,370 
              L120,480 
              C115,500 95,500 95,480 
              L90,350 
              C90,300 100,280 100,240 
              L100,180 
              C100,180 85,180 80,230 
              L75,250 
              C70,260 55,255 55,245 
              C55,235 64,230 65,220 
              C70,160 70,150 80,135 
              C90,120 105,115 135,110 
              Z" 
            />
        </g>

        {/* --- Interaction Points & Labels --- */}
        
        {/* Neck */}
        <g className="cursor-pointer group" onClick={() => onPartClick('neck')}>
           <line x1="200" y1="90" x2="165" y2="90" stroke={strokeColor} strokeDasharray="4" opacity="0.5" />
           <circle cx="150" cy="90" r="8" fill={getFill('neck')} stroke="white" strokeWidth="2" className="transition-all group-hover:r-10" />
           <text x="210" y="95" fontSize="14" fill="#64748b" fontWeight="bold" textAnchor="start">{getLabel(t.body.neck, 'neck')}</text>
        </g>

        {/* Chest */}
        <g className="cursor-pointer group" onClick={() => onPartClick('chest')}>
           <line x1="100" y1="150" x2="150" y2="150" stroke={strokeColor} strokeDasharray="4" opacity="0.5" />
           <circle cx="150" cy="150" r="8" fill={getFill('chest')} stroke="white" strokeWidth="2" className="transition-all group-hover:r-10" />
           <text x="90" y="155" fontSize="14" fill="#64748b" fontWeight="bold" textAnchor="end">{getLabel(t.body.chest, 'chest')}</text>
        </g>

        {/* Arm (Left) */}
        <g className="cursor-pointer group" onClick={() => onPartClick('arm')}>
           <line x1="220" y1="170" x2="250" y2="170" stroke={strokeColor} strokeDasharray="4" opacity="0.5" />
           <circle cx="220" cy="170" r="8" fill={getFill('arm')} stroke="white" strokeWidth="2" className="transition-all group-hover:r-10" />
           <text x="260" y="175" fontSize="14" fill="#64748b" fontWeight="bold" textAnchor="start">{getLabel(t.body.arm, 'arm')}</text>
        </g>
        
        {/* Waist */}
        <g className="cursor-pointer group" onClick={() => onPartClick('waist')}>
           <line x1="100" y1="230" x2="150" y2="230" stroke={strokeColor} strokeDasharray="4" opacity="0.5" />
           <circle cx="150" cy="230" r="8" fill={getFill('waist')} stroke="white" strokeWidth="2" className="transition-all group-hover:r-10" />
           <text x="90" y="235" fontSize="14" fill="#64748b" fontWeight="bold" textAnchor="end">{getLabel(t.body.waist, 'waist')}</text>
        </g>

        {/* Hips */}
        <g className="cursor-pointer group" onClick={() => onPartClick('hips')}>
           <line x1="200" y1="270" x2="250" y2="270" stroke={strokeColor} strokeDasharray="4" opacity="0.5" />
           <circle cx="150" cy="270" r="8" fill={getFill('hips')} stroke="white" strokeWidth="2" className="transition-all group-hover:r-10" />
           <text x="260" y="275" fontSize="14" fill="#64748b" fontWeight="bold" textAnchor="start">{getLabel(t.body.hips, 'hips')}</text>
        </g>

        {/* Thigh (Right) */}
        <g className="cursor-pointer group" onClick={() => onPartClick('thigh')}>
           <line x1="50" y1="360" x2="120" y2="360" stroke={strokeColor} strokeDasharray="4" opacity="0.5" />
           <circle cx="120" cy="360" r="8" fill={getFill('thigh')} stroke="white" strokeWidth="2" className="transition-all group-hover:r-10" />
           <text x="40" y="365" fontSize="14" fill="#64748b" fontWeight="bold" textAnchor="start">{getLabel(t.body.thigh, 'thigh')}</text>
        </g>

      </svg>
    </div>
  );
};

export const BodyTracker: React.FC<BodyTrackerProps> = ({ lang }) => {
  const t = getTranslation(lang);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [records, setRecords] = useState<HealthMap>({});
  const [activeTab, setActiveTab] = useState<'INPUT' | 'STATS'>('INPUT');
  
  // Input Modal State
  const [showDimInput, setShowDimInput] = useState<string | null>(null);
  const [tempDimValue, setTempDimValue] = useState('');

  useEffect(() => {
    setRecords(getHealthRecords());
  }, []);

  const dateStr = currentDate.toISOString().split('T')[0];
  const currentRecord = records[dateStr] || { date: dateStr, gender: 'male' };

  const handleSaveField = (field: keyof HealthRecord, value: any) => {
    const updated = saveHealthRecord({ ...currentRecord, date: dateStr, [field]: value });
    setRecords(updated);
  };

  const handleSaveDimension = (part: string, value: number) => {
    const updated = saveHealthRecord({
      ...currentRecord,
      date: dateStr,
      dimensions: { ...(currentRecord.dimensions || {}), [part]: value }
    });
    setRecords(updated);
  };

  const openDimInput = (part: string) => {
    setShowDimInput(part);
    const val = currentRecord.dimensions?.[part as keyof typeof currentRecord.dimensions];
    setTempDimValue(val ? String(val) : '');
  };

  // --- STATS HELPER ---
  const getWeeklyData = () => {
    // Group records by week number
    const weeks: Record<string, { weekLabel: string, bodyFat: number[], height: number[], dims: any[], weight: number[] }> = {};
    
    Object.values(records).sort((a,b) => a.date.localeCompare(b.date)).forEach(rec => {
        const d = new Date(rec.date);
        // Calculate Week Number ISO 8601
        const weekNum = Math.ceil((((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 86400000) + new Date(d.getFullYear(), 0, 1).getDay() + 1) / 7);
        const key = `${d.getFullYear()}-W${weekNum}`;
        
        if (!weeks[key]) {
            weeks[key] = { weekLabel: `W${weekNum}`, bodyFat: [], height: [], dims: [], weight: [] };
        }
        if (rec.bodyFat) weeks[key].bodyFat.push(rec.bodyFat);
        if (rec.height) weeks[key].height.push(rec.height);
        if (rec.weight) weeks[key].weight.push(rec.weight);
        if (rec.dimensions) weeks[key].dims.push(rec.dimensions);
    });

    // Average or take last value for week
    return Object.entries(weeks).slice(-8).map(([key, data]) => ({
        label: data.weekLabel,
        // For BF/Weight, take average of the week
        bodyFat: data.bodyFat.length ? parseFloat((data.bodyFat.reduce((a,b)=>a+b,0)/data.bodyFat.length).toFixed(1)) : 0,
        weight: data.weight.length ? parseFloat((data.weight.reduce((a,b)=>a+b,0)/data.weight.length).toFixed(1)) : 0,
        height: data.height.length ? data.height[data.height.length - 1] : 0,
        waist: data.dims.length && data.dims[data.dims.length-1].waist ? data.dims[data.dims.length-1].waist : 0,
    }));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in">
        {/* Header */}
        <div className="bg-white px-4 py-4 shadow-sm border-b border-slate-200 z-10 sticky top-0">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">{t.body.title}</h1>
                    <p className="text-xs text-slate-500">{t.body.subtitle}</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('INPUT')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${activeTab === 'INPUT' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                    >
                        {t.body.input}
                    </button>
                    <button 
                        onClick={() => setActiveTab('STATS')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${activeTab === 'STATS' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                    >
                        {t.body.stats}
                    </button>
                </div>
            </div>

            {activeTab === 'INPUT' && (
                <div className="flex items-center gap-3">
                   <div className="flex items-center justify-center bg-slate-50 rounded-lg p-2 border border-slate-100 flex-1">
                      <Calendar size={16} className="text-slate-400 mr-2" />
                      {/* Browser date inputs always use YYYY-MM-DD for value, but display locally. 
                          If previous display was weird, ensuring clean dateStr usually fixes it. */}
                      <input 
                         type="date"
                         value={dateStr}
                         onChange={(e) => e.target.value && setCurrentDate(new Date(e.target.value))}
                         className="bg-transparent text-sm font-bold text-slate-700 outline-none w-full"
                      />
                   </div>
                   {/* Gender Toggle */}
                   <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button 
                           onClick={() => handleSaveField('gender', 'male')}
                           className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${currentRecord.gender !== 'female' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                        >
                            {t.body.male}
                        </button>
                        <button 
                           onClick={() => handleSaveField('gender', 'female')}
                           className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${currentRecord.gender === 'female' ? 'bg-white shadow text-pink-600' : 'text-slate-500'}`}
                        >
                            {t.body.female}
                        </button>
                   </div>
                </div>
            )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 pb-24">
            {activeTab === 'INPUT' ? (
                <div className="space-y-6">
                    {/* Basic Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                             <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
                                 <Scale size={14} className="text-indigo-500" /> {t.body.weight}
                             </div>
                             <input 
                                type="number" 
                                placeholder="0.0" 
                                className="text-2xl font-bold text-slate-800 outline-none w-full"
                                value={currentRecord.weight || ''}
                                onChange={(e) => handleSaveField('weight', parseFloat(e.target.value))}
                             />
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                             <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
                                 <Ruler size={14} className="text-blue-500" /> {t.body.height}
                             </div>
                             <input 
                                type="number" 
                                placeholder="0" 
                                className="text-2xl font-bold text-slate-800 outline-none w-full"
                                value={currentRecord.height || ''}
                                onChange={(e) => handleSaveField('height', parseFloat(e.target.value))}
                             />
                        </div>
                        
                        {/* Body Fat Display (Auto Calculated) */}
                        <div className="col-span-2 bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden">
                             <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase z-10">
                                 <Percent size={14} className="text-emerald-500" /> {t.body.bodyFat}
                             </div>
                             <div className="text-2xl font-bold text-slate-800 z-10 flex items-center justify-between">
                                 {currentRecord.bodyFat ? currentRecord.bodyFat + '%' : '--'}
                                 {currentRecord.bodyFat && (
                                     <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Auto</span>
                                 )}
                             </div>
                             {/* Info hint */}
                             {!currentRecord.bodyFat && (
                                 <div className="text-[10px] text-slate-400 mt-1 leading-tight">{t.body.calcNote}</div>
                             )}
                        </div>
                    </div>

                    {/* Dimensions Model */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
                        <h3 className="text-center text-sm font-bold text-slate-400 uppercase mb-4 tracking-wider">{t.body.modelInstruction}</h3>
                        <BodyModel 
                            onPartClick={openDimInput} 
                            data={currentRecord.dimensions}
                            t={t}
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Weekly Trends */}
                     
                     <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Scale size={18} className="text-indigo-500" /> {t.body.weight}
                        </h3>
                        <div className="h-40 flex items-end justify-between gap-2">
                            {getWeeklyData().map((w, i) => (
                                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                                    <div className="w-full bg-indigo-100 rounded-t-lg relative group" style={{ height: `${w.weight > 0 ? (w.weight / 150) * 100 : 0}%` }}>
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-600 opacity-0 group-hover:opacity-100">{w.weight}</div>
                                    </div>
                                    <span className="text-[10px] text-slate-400">{w.label}</span>
                                </div>
                            ))}
                        </div>
                     </div>

                     <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Percent size={18} className="text-emerald-500" /> {t.body.bodyFat}
                        </h3>
                        <div className="h-40 flex items-end justify-between gap-2">
                            {getWeeklyData().map((w, i) => (
                                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                                    <div className="w-full bg-emerald-100 rounded-t-lg relative group" style={{ height: `${w.bodyFat > 0 ? (w.bodyFat / 40) * 100 : 0}%` }}>
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-600 opacity-0 group-hover:opacity-100">{w.bodyFat}%</div>
                                    </div>
                                    <span className="text-[10px] text-slate-400">{w.label}</span>
                                </div>
                            ))}
                        </div>
                     </div>
                     
                     <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <TrendingUp size={18} className="text-blue-500" /> {t.body.waist}
                        </h3>
                        <div className="h-40 flex items-end justify-between gap-2">
                            {getWeeklyData().map((w, i) => (
                                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                                    <div className="w-full bg-blue-100 rounded-t-lg relative group" style={{ height: `${w.waist > 0 ? (w.waist / 120) * 100 : 0}%` }}>
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-600 opacity-0 group-hover:opacity-100">{w.waist}</div>
                                    </div>
                                    <span className="text-[10px] text-slate-400">{w.label}</span>
                                </div>
                            ))}
                        </div>
                     </div>
                </div>
            )}
        </div>

        {/* Input Popover/Modal */}
        {showDimInput && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs animate-in zoom-in-95">
                    {/* Localized Title if possible, else key */}
                    <h3 className="text-lg font-bold text-slate-800 mb-4 capitalize">
                        {t.body[showDimInput as keyof typeof t.body] || showDimInput}
                    </h3>
                    <div className="flex items-center gap-2 border-b-2 border-indigo-100 pb-2 mb-6">
                        <input 
                            autoFocus
                            type="number"
                            value={tempDimValue}
                            onChange={(e) => setTempDimValue(e.target.value)}
                            className="text-3xl font-bold text-slate-800 outline-none w-full"
                            placeholder="0"
                        />
                        <span className="text-sm font-bold text-slate-400">cm</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setShowDimInput(null)} 
                            className="py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                        >
                            {t.common.cancel}
                        </button>
                        <button 
                            onClick={() => {
                                handleSaveDimension(showDimInput, parseFloat(tempDimValue));
                                setShowDimInput(null);
                            }}
                            className="py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
                        >
                            {t.body.save}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};