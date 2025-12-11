export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export enum ViewMode {
  LIST = 'LIST',
  EDITOR = 'EDITOR',
}

export enum EditorTab {
  WRITE = 'WRITE',
  PREVIEW = 'PREVIEW',
  SPLIT = 'SPLIT', // For larger screens
}

export interface AIState {
  isLoading: boolean;
  error: string | null;
  suggestion: string | null;
}

// Habit Tracker Types
export interface HabitRecord {
  date: string; // YYYY-MM-DD
  startTime: number; // Timestamp
  endTime: number; // Timestamp
  durationMinutes: number;
  note?: string; // Daily focus content/log
}

export type HabitMap = Record<string, HabitRecord>;

// Body Tracker Types
export interface BodyDimensions {
  neck?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arm?: number;
  thigh?: number;
}

export interface HealthRecord {
  date: string; // YYYY-MM-DD
  gender?: 'male' | 'female'; // Required for Body Fat Calc
  height?: number; // cm
  weight?: number; // kg
  bodyFat?: number; // % (Auto-calculated)
  dimensions?: BodyDimensions;
}

export type HealthMap = Record<string, HealthRecord>;

export enum AppModule {
  HABITS = 'HABITS',
  NOTES = 'NOTES',
  BODY = 'BODY',
}

export type Language = 'zh-CN' | 'en-US';