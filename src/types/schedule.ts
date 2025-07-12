export type TimeWindow = 'LONG' | 'MEDIUM' | 'SHORT' | 'SLEEP-FIRST';

export type StudyActivity = 'ANKI_DUE' | 'ACTIVE_LISTENING' | 'PASSIVE_LISTENING';

export type SchedulePhase = 'MORNING' | 'EVENING' | 'SLEEP';

export interface TimeBlock {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  activity: StudyActivity | 'HYGIENE' | 'SLEEP' | 'WAKE_UP' | 'PREP';
  isOptional: boolean;
}

export interface ScheduleState {
  currentPhase: SchedulePhase;
  arrivalTimeHome: string | null;
  timeWindow: TimeWindow | null;
  todayBlocks: TimeBlock[];
  ankiCardsRemaining: number;
  isAwake: boolean;
  lastUpdated: Date;
}

export interface ScheduleConstants {
  LIGHTS_OFF_HARD_CAP: string; // '00:30'
  WAKE_UP_TARGET: string; // '08:00'
  STUDY_BLOCK_START: string; // '08:30'
  LEAVE_HOME_TIME: string; // '10:00'
  MIN_STUDY_BLOCK_LENGTH: number; // 25 minutes
  MIN_HYGIENE_BLOCK_LENGTH: number; // 30 minutes
  EVENING_LIGHTS_OFF_BUFFER: number; // 15 minutes
}

export interface WindowLimits {
  LONG: { maxAnki: number; minTotal: number };
  MEDIUM: { maxAnki: number; minTotal: number };
  SHORT: { maxAnki: number; minTotal: number };
  'SLEEP-FIRST': { maxAnki: number; minTotal: number };
}
