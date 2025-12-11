import { Note, HabitMap, HabitRecord, HealthMap, HealthRecord } from '../types';

const STORAGE_KEY = 'markease_notes';
const HABIT_KEY = 'markease_habits_v2'; 
const HEALTH_KEY = 'markease_health_v1';
const SESSION_KEY = 'markease_active_session'; 

// --- NOTES ---

export const getNotes = (): Note[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load notes", e);
    return [];
  }
};

export const saveNote = (note: Note): void => {
  const notes = getNotes();
  const existingIndex = notes.findIndex((n) => n.id === note.id);
  
  if (existingIndex >= 0) {
    notes[existingIndex] = note;
  } else {
    notes.unshift(note);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

export const deleteNote = (id: string): void => {
  const notes = getNotes().filter((n) => n.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

export const createNote = (initialTitle = 'Untitled Note', initialContent = '# New Note\n\nStart writing...'): Note => {
  return {
    id: crypto.randomUUID(),
    title: initialTitle,
    content: initialContent,
    updatedAt: Date.now(),
  };
};

// --- HABIT TRACKER ---

export const getHabits = (): HabitMap => {
  try {
    const data = localStorage.getItem(HABIT_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Failed to load habits", e);
    return {};
  }
};

/**
 * Returns only records that have actual focus time > 0
 */
export const getValidHabitStats = (): HabitRecord[] => {
  const habits = getHabits();
  return Object.values(habits).filter(r => r.durationMinutes > 0);
};

export const saveHabit = (record: HabitRecord): HabitMap => {
  const habits = getHabits();
  habits[record.date] = record;
  localStorage.setItem(HABIT_KEY, JSON.stringify(habits));
  return habits;
};

export const updateHabitNote = (date: string, note: string): HabitMap => {
  const habits = getHabits();
  if (!habits[date]) {
    // Create a zero-duration record if it doesn't exist
    habits[date] = {
      date,
      startTime: 0,
      endTime: 0,
      durationMinutes: 0,
      note
    };
  } else {
    habits[date].note = note;
  }
  localStorage.setItem(HABIT_KEY, JSON.stringify(habits));
  return habits;
};

// --- BODY/HEALTH TRACKER ---

export const getHealthRecords = (): HealthMap => {
  try {
    const data = localStorage.getItem(HEALTH_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Failed to load health records", e);
    return {};
  }
};

// Helper: US Navy Body Fat Calculator
const calculateBodyFat = (gender: string, height: number, neck: number, waist: number, hip: number): number | undefined => {
  if (!height || !neck || !waist) return undefined;
  
  try {
    let bf = 0;
    // Log10 based formulas (Height, Neck, Waist, Hip in cm)
    if (gender === 'female') {
      if (!hip) return undefined;
      // 495 / (1.29579 - 0.35004 * log10(Waist + Hip - Neck) + 0.22100 * log10(Height)) - 450
      bf = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
    } else {
      // Male default
      // 495 / (1.0324 - 0.19077 * log10(Waist - Neck) + 0.15456 * log10(Height)) - 450
      // Ensure waist > neck to avoid error
      if (waist <= neck) return undefined;
      bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    }
    
    // Sanity check
    if (!isNaN(bf) && bf > 2 && bf < 70) {
      return parseFloat(bf.toFixed(1));
    }
    return undefined;
  } catch (e) {
    return undefined;
  }
};

export const saveHealthRecord = (record: HealthRecord): HealthMap => {
  const records = getHealthRecords();
  const existing = records[record.date];
  
  // 1. Merge Data
  const mergedRecord: HealthRecord = {
    ...(existing || {}),
    ...record,
    dimensions: {
      ...(existing?.dimensions || {}),
      ...(record.dimensions || {})
    }
  };

  // 2. Auto-Calculate Body Fat if possible
  // Use current record gender or fallback to existing or default 'male'
  const gender = mergedRecord.gender || 'male';
  mergedRecord.gender = gender; // Ensure gender is consistent

  const height = mergedRecord.height;
  const neck = mergedRecord.dimensions?.neck;
  const waist = mergedRecord.dimensions?.waist;
  const hip = mergedRecord.dimensions?.hips;

  if (height && neck && waist) {
     const calculatedBF = calculateBodyFat(gender, height, neck, waist, hip || 0);
     if (calculatedBF !== undefined) {
         mergedRecord.bodyFat = calculatedBF;
     }
  }
  
  records[record.date] = mergedRecord;
  localStorage.setItem(HEALTH_KEY, JSON.stringify(records));
  return records;
};

// --- ACTIVE SESSION (TIMER) ---

export const getActiveSessionStart = (): number | null => {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? parseInt(data, 10) : null;
};

export const startSession = (): number => {
  const now = Date.now();
  localStorage.setItem(SESSION_KEY, now.toString());
  return now;
};

export const endSession = (): number | null => {
  const start = getActiveSessionStart();
  localStorage.removeItem(SESSION_KEY);
  return start;
};