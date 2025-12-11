import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Trophy, Play, Square, Timer, History, BarChart3, ArrowLeft, Search, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { getHabits, saveHabit, startSession, endSession, getActiveSessionStart, updateHabitNote, getValidHabitStats } from '../services/storageService';
import { HabitMap, HabitRecord, Language } from '../types';
import { getTranslation } from '../utils/translations';

interface HabitTrackerProps {
  lang: Language;
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({ lang }) => {
  const t = getTranslation(lang);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [habits, setHabits] = useState<HabitMap>({});
  const [viewMode, setViewMode] = useState<'CALENDAR' | 'STATS' | 'JOURNAL'>('CALENDAR');
  
  // Journal State
  // anchorDate determines the "Top" date of the list. Defaults to Today.
  const [journalAnchorDate, setJournalAnchorDate] = useState(new Date()); 
  const [displayCount, setDisplayCount] = useState(14); // Initial number of days to show

  // Timer State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);

  // Load Data
  useEffect(() => {
    setHabits(getHabits());
    
    // Check for active session (persistence)
    const activeStart = getActiveSessionStart();
    if (activeStart) {
      setSessionStartTime(activeStart);
      setIsTimerRunning(true);
      // Calculate initial elapsed
      setElapsedSeconds(Math.floor((Date.now() - activeStart) / 1000));
    }
  }, []);

  // Timer Logic
  useEffect(() => {
    if (isTimerRunning && sessionStartTime) {
      timerIntervalRef.current = window.setInterval(() => {
        const now = Date.now();
        setElapsedSeconds(Math.floor((now - sessionStartTime) / 1000));
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, sessionStartTime]);

  // Actions
  const handleStartTimer = () => {
    const start = startSession();
    setSessionStartTime(start);
    setIsTimerRunning(true);
    setElapsedSeconds(0);
  };

  const handleStopTimer = () => {
    const start = endSession();
    if (start) {
      const end = Date.now();
      const durationMinutes = Math.max(1, Math.floor((end - start) / 1000 / 60)); // Minimum 1 minute
      const dateStr = new Date().toISOString().split('T')[0];

      // Merge with existing record for the day if it exists
      const existing = habits[dateStr];
      const newDuration = existing ? existing.durationMinutes + durationMinutes : durationMinutes;
      
      const newRecord: HabitRecord = {
        date: dateStr,
        startTime: existing ? existing.startTime : start, // Keep original start
        endTime: end,
        durationMinutes: newDuration,
        note: existing?.note || '' // Preserve existing note
      };

      const updatedHabits = saveHabit(newRecord);
      setHabits(updatedHabits);
    }
    setIsTimerRunning(false);
    setSessionStartTime(null);
    setElapsedSeconds(0);
  };

  const handleNoteChange = (date: string, note: string) => {
     const updated = updateHabitNote(date, note);
     setHabits(updated);
  };

  // Helper: Format Seconds to HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Helper: Format Duration (e.g. "45m" or "1.5h")
  const formatDuration = (mins: number) => {
    if (mins >= 60) {
      return `${(mins / 60).toFixed(1)}h`;
    }
    return `${mins}m`;
  };

  // Stats Calculations (Using only valid records > 0 mins)
  const validRecords = getValidHabitStats();
  const totalRecords = validRecords.length;
  const totalMinutes = validRecords.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // --- JOURNAL VIEW RENDERER ---
  if (viewMode === 'JOURNAL') {
    // Generate dates list based on anchor date
    const datesToRender = [];
    const anchor = new Date(journalAnchorDate);
    
    // Create list of dates: Anchor down to Anchor - displayCount
    for (let i = 0; i < displayCount; i++) {
        const d = new Date(anchor);
        d.setDate(anchor.getDate() - i);
        datesToRender.push(d);
    }

    const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.value) {
            setJournalAnchorDate(new Date(e.target.value));
            setDisplayCount(14); // Reset count on jump
        }
    };

    return (
        <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
             {/* Header */}
             <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 h-16 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setViewMode('CALENDAR')}
                      className="p-2 hover:bg-slate-100 rounded-full text-slate-600"
                    >
                      <ArrowLeft size={24} />
                    </button>
                    <h2 className="font-bold text-lg text-slate-800">{t.habit.journalTitle}</h2>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer">
                            <CalendarIcon size={16} className="text-slate-500" />
                            <span className="text-sm font-bold text-slate-700">
                                {journalAnchorDate.toLocaleDateString(lang, { month: 'short', day: 'numeric' })}
                            </span>
                            <ChevronDown size={14} className="text-slate-400" />
                        </div>
                        {/* Hidden native date picker covering the custom UI */}
                        <input 
                            type="date"
                            value={journalAnchorDate.toISOString().split('T')[0]}
                            onChange={handleDateSelect}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                    </div>
                </div>
             </div>
    
             {/* Timeline List */}
             <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                {datesToRender.map((dateObj) => {
                    const dateStr = dateObj.toISOString().split('T')[0];
                    const record = habits[dateStr];
                    const isToday = dateStr === new Date().toISOString().split('T')[0];
                    const hasNote = record?.note && record.note.length > 0;
                    const hasFocus = record && record.durationMinutes > 0;

                    return (
                        <div key={dateStr} className="flex gap-4 group">
                            {/* Date Column (Left) */}
                            <div className="w-16 flex flex-col items-center pt-2 shrink-0">
                                <div className={`text-lg font-bold leading-none ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>
                                    {dateObj.getDate()}
                                </div>
                                <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                                    {dateObj.toLocaleDateString(lang, { month: 'short' })}
                                </div>
                                <div className={`mt-2 w-0.5 flex-1 ${hasNote || hasFocus ? 'bg-indigo-100' : 'bg-slate-100'} group-last:hidden rounded-full min-h-[40px]`}></div>
                            </div>

                            {/* Content Column (Right) */}
                            <div className="flex-1 pb-4">
                                <div className={`bg-slate-50 border border-slate-200 rounded-2xl p-4 transition-all focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 focus-within:bg-white ${isToday ? 'shadow-md border-indigo-100 bg-white' : ''}`}>
                                    {/* Optional Header inside card if focus time exists */}
                                    {hasFocus && (
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Timer size={10} />
                                                {formatDuration(record.durationMinutes)}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <textarea
                                        value={record?.note || ''}
                                        onChange={(e) => handleNoteChange(dateStr, e.target.value)}
                                        placeholder={isToday ? t.habit.journalPlaceholder : "..."}
                                        className="w-full bg-transparent border-none outline-none resize-none text-sm text-slate-700 leading-relaxed min-h-[3rem]"
                                        style={{ fieldSizing: 'content' } as any}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
                
                <button 
                    onClick={() => setDisplayCount(prev => prev + 14)}
                    className="w-full py-4 text-sm text-slate-400 font-medium hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors border border-dashed border-slate-200"
                >
                    {lang === 'zh-CN' ? '加载更多历史' : 'Load More History'}
                </button>
             </div>
        </div>
    );
  }

  // --- STATS VIEW RENDERER ---
  if (viewMode === 'STATS') {
    const sortedRecords = Object.values(habits).sort((a, b) => a.date.localeCompare(b.date));
    const maxDuration = sortedRecords.length > 0 ? Math.max(...sortedRecords.map(r => r.durationMinutes)) : 0;
    
    return (
      <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-300">
         <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center gap-4 shadow-sm z-10">
            <button 
              onClick={() => setViewMode('CALENDAR')}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-600"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="font-bold text-lg text-slate-800">{t.habit.statsTitle}</h2>
         </div>

         <div className="flex-1 overflow-y-auto p-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="bg-indigo-600 text-white p-5 rounded-2xl shadow-lg shadow-indigo-200">
                  <div className="text-indigo-200 text-xs font-bold uppercase mb-1">{t.habit.totalTime}</div>
                  <div className="text-3xl font-bold">{totalHours}<span className="text-lg opacity-60 font-normal">h</span></div>
               </div>
               <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-slate-400 text-xs font-bold uppercase mb-1">{t.habit.totalDays}</div>
                  <div className="text-3xl font-bold text-slate-800">{totalRecords}</div>
               </div>
            </div>

            {/* Chart Area */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-20">
               <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold">
                  <BarChart3 size={20} className="text-indigo-500" />
                  <h3>{t.habit.timeline}</h3>
               </div>
               
               {sortedRecords.length === 0 ? (
                 <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
                   {t.habit.noData}
                 </div>
               ) : (
                 <div className="relative h-64 w-full overflow-x-auto no-scrollbar">
                    <div className="flex items-end gap-3 h-full pb-8 min-w-fit px-2">
                       {sortedRecords.map((record) => {
                          const heightPercent = maxDuration > 0 ? (record.durationMinutes / maxDuration) * 100 : 0;
                          const safeHeight = Math.max(heightPercent, 5); 
                          
                          return (
                            <div key={record.date} className="flex flex-col items-center gap-2 group min-w-[40px]">
                               <div className="text-[10px] font-bold text-slate-500 mb-1 opacity-100 transition-opacity">
                                  {formatDuration(record.durationMinutes)}
                               </div>
                               
                               <div 
                                 style={{ height: `${safeHeight}%` }} 
                                 className="w-8 bg-indigo-500 rounded-t-lg opacity-80 group-hover:opacity-100 transition-all shadow-[0_4px_10px_rgba(99,102,241,0.3)]"
                               ></div>
                               
                               <div className="absolute bottom-0 text-[10px] text-slate-400 font-medium rotate-0 whitespace-nowrap">
                                  {record.date.slice(5).replace('-', '/')}
                               </div>
                            </div>
                          );
                       })}
                    </div>
                 </div>
               )}
            </div>
         </div>
      </div>
    );
  }

  // --- CALENDAR VIEW (DEFAULT) ---

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); 
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); 
  const todayStr = new Date().toISOString().split('T')[0];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Render Calendar Grid
  const renderCalendarDays = () => {
    const days = [];
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-16 w-full" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const record = habits[dateStr];
      const isToday = dateStr === todayStr;

      days.push(
        <div
          key={day}
          className={`
            h-16 w-full flex flex-col items-center justify-start pt-2 relative rounded-xl transition-all
            ${isToday ? 'bg-indigo-50 border border-indigo-200 shadow-sm' : 'border border-transparent'}
          `}
        >
          <span className={`text-sm font-semibold ${isToday ? 'text-indigo-600' : 'text-slate-600'}`}>
            {day}
          </span>
          
          {record ? (
             <div className="mt-1 flex flex-col items-center animate-in zoom-in duration-300">
               {record.durationMinutes > 0 && (
                   <div className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full mb-0.5">
                     {formatDuration(record.durationMinutes)}
                   </div>
               )}
               {(record.note && record.note.length > 0) && (
                   <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
               )}
             </div>
          ) : (
            isToday && !isTimerRunning && <span className="text-[10px] text-slate-300 mt-2">--</span>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
       
       {/* 1. Timer / Action Section (Compact) */}
       <div className="bg-white p-4 pb-6 shadow-sm rounded-b-3xl z-10 relative">
          <div className="flex items-center justify-between mb-4">
             <div>
                <h1 className="text-xl font-bold text-slate-800">{t.habit.title}</h1>
                <p className="text-slate-500 text-xs">{t.habit.subtitle}</p>
             </div>
             <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${isTimerRunning ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-indigo-100 text-indigo-600'}`}>
                <Timer size={16} />
             </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            {/* Main Timer Display */}
            <div className="text-5xl font-mono font-bold text-slate-800 tracking-tighter mb-5 tabular-nums">
               {formatTime(elapsedSeconds)}
            </div>

            {/* Action Button */}
            {!isTimerRunning ? (
              <button 
                onClick={handleStartTimer}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-base font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Play fill="currentColor" size={20} />
                {t.habit.start}
              </button>
            ) : (
              <button 
                onClick={handleStopTimer}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-base font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Square fill="currentColor" size={20} />
                {t.habit.stop}
              </button>
            )}
          </div>
       </div>

       {/* 2. Mini Stats Row (Interactive) */}
       <div className="px-4 py-4 grid grid-cols-2 gap-3">
          {/* Clickable Days Card -> Link to Journal */}
          <button 
             onClick={() => {
                 setJournalAnchorDate(new Date()); // Reset to today when clicking stats
                 setViewMode('JOURNAL');
             }}
             className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 hover:shadow-md hover:border-indigo-200 transition-all active:scale-95 text-left group"
          >
             <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors flex items-center justify-center shrink-0">
               <Trophy size={16} />
             </div>
             <div className="min-w-0">
               <div className="text-[10px] text-slate-400 font-bold uppercase group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                 {t.habit.days} <ChevronRight size={10} />
               </div>
               <div className="text-lg font-bold text-slate-800">{totalRecords}</div>
             </div>
          </button>
          
          {/* Clickable Hours Card -> Link to Stats */}
          <button 
            onClick={() => setViewMode('STATS')}
            className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 hover:shadow-md hover:border-indigo-200 transition-all active:scale-95 text-left group"
          >
             <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center shrink-0">
               <History size={16} />
             </div>
             <div className="min-w-0">
               <div className="text-[10px] text-slate-400 font-bold uppercase group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                 {t.habit.hoursBtn} <ChevronRight size={10} />
               </div>
               <div className="text-lg font-bold text-slate-800">{totalHours}h</div>
             </div>
          </button>
       </div>

       {/* 3. Calendar Section */}
       <div className="flex-1 bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.03)] px-4 pt-4 pb-24 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600">
               <ChevronLeft size={18} />
            </button>
            <h2 className="text-base font-bold text-slate-800">
              {currentDate.toLocaleDateString(lang, { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600">
               <ChevronRight size={18} />
            </button>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto">
             <div className="grid grid-cols-7 mb-1">
                {lang === 'zh-CN' 
                   ? ['日', '一', '二', '三', '四', '五', '六'].map((day, i) => (
                      <div key={i} className="text-center text-[10px] font-bold text-slate-300 py-1">{day}</div>
                   ))
                   : ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="text-center text-[10px] font-bold text-slate-300 py-1">{day}</div>
                   ))
                }
             </div>
             <div className="grid grid-cols-7 gap-1">
                {renderCalendarDays()}
             </div>
          </div>
       </div>
    </div>
  );
};