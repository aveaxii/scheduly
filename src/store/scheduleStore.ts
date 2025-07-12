import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addMinutes, format, isBefore, parse, differenceInMinutes } from 'date-fns';
import type { ScheduleState, TimeBlock, TimeWindow } from '../types/schedule';

const CONSTANTS = {
  LIGHTS_OFF_HARD_CAP: '00:30',
  WAKE_UP_TARGET: '08:00',
  STUDY_BLOCK_START: '08:30',
  LEAVE_HOME_TIME: '10:00',
  MIN_STUDY_BLOCK_LENGTH: 25,
  MIN_HYGIENE_BLOCK_LENGTH: 30,
  EVENING_LIGHTS_OFF_BUFFER: 15,
};

const WINDOW_LIMITS = {
  LONG: { maxAnki: 45, minTotal: 120 },
  MEDIUM: { maxAnki: 30, minTotal: 75 },
  SHORT: { maxAnki: 20, minTotal: 30 },
  'SLEEP-FIRST': { maxAnki: 0, minTotal: 0 },
};

interface ScheduleStore extends ScheduleState {
  // Actions
  setArrivalTime: (time: string) => void;
  setAnkiCards: (cards: number) => void;
  generateEveningSchedule: () => void;
  generateMorningSchedule: () => void;
  markBlockComplete: (blockId: string) => void;
  resetDay: () => void;
  
  // Computed
  getTimeWindow: (arrivalTime: string) => TimeWindow;
  getAvailableStudyTime: (arrivalTime: string) => number;
}

export const useScheduleStore = create<ScheduleStore>()(persist(
  (set, get) => ({
    // Initial state
    currentPhase: 'MORNING',
    arrivalTimeHome: null,
    timeWindow: null,
    todayBlocks: [],
    ankiCardsRemaining: 0,
    isAwake: false,
    lastUpdated: new Date(),

    // Actions
    setArrivalTime: (time: string) => {
      const timeWindow = get().getTimeWindow(time);
      set({ 
        arrivalTimeHome: time, 
        timeWindow,
        currentPhase: 'EVENING',
        lastUpdated: new Date() 
      });
      get().generateEveningSchedule();
    },

    setAnkiCards: (cards: number) => {
      set({ ankiCardsRemaining: cards, lastUpdated: new Date() });
    },

    getTimeWindow: (arrivalTime: string): TimeWindow => {
      const arrival = parse(arrivalTime, 'HH:mm', new Date());
      const cutoff2130 = parse('21:30', 'HH:mm', new Date());
      const cutoff2230 = parse('22:30', 'HH:mm', new Date());
      const cutoff2315 = parse('23:15', 'HH:mm', new Date());

      if (isBefore(arrival, cutoff2130) || arrival.getTime() === cutoff2130.getTime()) {
        return 'LONG';
      } else if (isBefore(arrival, cutoff2230)) {
        return 'MEDIUM';
      } else if (isBefore(arrival, cutoff2315)) {
        return 'SHORT';
      } else {
        return 'SLEEP-FIRST';
      }
    },

    getAvailableStudyTime: (arrivalTime: string): number => {
      const arrival = parse(arrivalTime, 'HH:mm', new Date());
      const lightsOff = parse(CONSTANTS.LIGHTS_OFF_HARD_CAP, 'HH:mm', new Date());
      
      // Handle next day for lights off
      if (lightsOff.getHours() < 12) {
        lightsOff.setDate(lightsOff.getDate() + 1);
      }
      
      const totalMinutes = differenceInMinutes(lightsOff, arrival);
      return Math.max(0, totalMinutes - CONSTANTS.EVENING_LIGHTS_OFF_BUFFER - CONSTANTS.MIN_HYGIENE_BLOCK_LENGTH);
    },

    generateEveningSchedule: () => {
      const { arrivalTimeHome, timeWindow, ankiCardsRemaining } = get();
      if (!arrivalTimeHome || !timeWindow) return;

      const blocks: TimeBlock[] = [];
      const arrivalTime = parse(arrivalTimeHome, 'HH:mm', new Date());
      let currentTime = arrivalTime;

      // Hygiene block (always first)
      const hygieneEnd = addMinutes(currentTime, CONSTANTS.MIN_HYGIENE_BLOCK_LENGTH);
      blocks.push({
        id: 'hygiene-evening',
        name: 'Hygiene + Passive Listening',
        startTime: format(currentTime, 'HH:mm'),
        endTime: format(hygieneEnd, 'HH:mm'),
        duration: CONSTANTS.MIN_HYGIENE_BLOCK_LENGTH,
        activity: 'HYGIENE',
        isOptional: false,
      });
      currentTime = hygieneEnd;

      const availableStudy = get().getAvailableStudyTime(arrivalTimeHome);
      
      if (availableStudy >= CONSTANTS.MIN_STUDY_BLOCK_LENGTH && timeWindow !== 'SLEEP-FIRST') {
        const limits = WINDOW_LIMITS[timeWindow];
        
        // ANKI block
        if (ankiCardsRemaining > 0) {
          const ankiTime = Math.min(limits.maxAnki, Math.ceil(ankiCardsRemaining * 1.5)); // 1.5 min per card estimate
          const ankiEnd = addMinutes(currentTime, ankiTime);
          
          blocks.push({
            id: 'anki-evening',
            name: `Anki (${ankiCardsRemaining} cards)`,
            startTime: format(currentTime, 'HH:mm'),
            endTime: format(ankiEnd, 'HH:mm'),
            duration: ankiTime,
            activity: 'ANKI_DUE',
            isOptional: false,
          });
          currentTime = ankiEnd;
        }

        // Active listening cycles
        const remainingTime = get().getAvailableStudyTime(arrivalTimeHome) - (currentTime.getTime() - arrivalTime.getTime()) / 60000;
        if (remainingTime >= 30) {
          const cycles = Math.floor(remainingTime / 30);
          for (let i = 0; i < cycles; i++) {
            const cycleEnd = addMinutes(currentTime, 25);
            blocks.push({
              id: `active-${i}`,
              name: `Active Listening Cycle ${i + 1}`,
              startTime: format(currentTime, 'HH:mm'),
              endTime: format(cycleEnd, 'HH:mm'),
              duration: 25,
              activity: 'ACTIVE_LISTENING',
              isOptional: false,
            });
            currentTime = addMinutes(cycleEnd, 5); // 5 min break
          }
        }

        // Passive listening until lights off
        const lightsOffTime = parse(CONSTANTS.LIGHTS_OFF_HARD_CAP, 'HH:mm', new Date());
        if (lightsOffTime.getHours() < 12) {
          lightsOffTime.setDate(lightsOffTime.getDate() + 1);
        }
        const bufferTime = addMinutes(lightsOffTime, -CONSTANTS.EVENING_LIGHTS_OFF_BUFFER);
        
        if (isBefore(currentTime, bufferTime)) {
          blocks.push({
            id: 'passive-evening',
            name: 'Passive Listening',
            startTime: format(currentTime, 'HH:mm'),
            endTime: format(bufferTime, 'HH:mm'),
            duration: differenceInMinutes(bufferTime, currentTime),
            activity: 'PASSIVE_LISTENING',
            isOptional: true,
          });
        }
      }

      // Sleep block
      const sleepStart = parse(CONSTANTS.LIGHTS_OFF_HARD_CAP, 'HH:mm', new Date());
      if (sleepStart.getHours() < 12) {
        sleepStart.setDate(sleepStart.getDate() + 1);
      }
      const sleepEnd = parse(CONSTANTS.WAKE_UP_TARGET, 'HH:mm', new Date());
      sleepEnd.setDate(sleepEnd.getDate() + 1);
      
      blocks.push({
        id: 'sleep',
        name: 'Sleep (5 cycles)',
        startTime: format(sleepStart, 'HH:mm'),
        endTime: format(sleepEnd, 'HH:mm'),
        duration: differenceInMinutes(sleepEnd, sleepStart),
        activity: 'SLEEP',
        isOptional: false,
      });

      set({ todayBlocks: blocks, lastUpdated: new Date() });
    },

    generateMorningSchedule: () => {
      const blocks: TimeBlock[] = [];
      const wakeTime = parse(CONSTANTS.WAKE_UP_TARGET, 'HH:mm', new Date());
      let currentTime = wakeTime;

      // Wake up block
      const hydrateEnd = addMinutes(currentTime, 15);
      blocks.push({
        id: 'wake-hydrate',
        name: 'Wake + Hydrate',
        startTime: format(currentTime, 'HH:mm'),
        endTime: format(hydrateEnd, 'HH:mm'),
        duration: 15,
        activity: 'WAKE_UP',
        isOptional: false,
      });
      currentTime = hydrateEnd;

      // Breakfast + passive listening
      const breakfastEnd = addMinutes(currentTime, 15);
      blocks.push({
        id: 'breakfast',
        name: 'Breakfast + Passive Listening',
        startTime: format(currentTime, 'HH:mm'),
        endTime: format(breakfastEnd, 'HH:mm'),
        duration: 15,
        activity: 'PASSIVE_LISTENING',
        isOptional: false,
      });
      currentTime = breakfastEnd;

      // Study block
      const studyEnd = parse('09:55', 'HH:mm', new Date());
      const studyDuration = differenceInMinutes(studyEnd, currentTime);
      blocks.push({
        id: 'morning-study',
        name: 'Morning Study Block',
        startTime: format(currentTime, 'HH:mm'),
        endTime: format(studyEnd, 'HH:mm'),
        duration: studyDuration,
        activity: 'ANKI_DUE',
        isOptional: false,
      });
      currentTime = studyEnd;

      // Prep and leave
      const leaveTime = parse(CONSTANTS.LEAVE_HOME_TIME, 'HH:mm', new Date());
      blocks.push({
        id: 'prep-leave',
        name: 'Prep & Leave',
        startTime: format(currentTime, 'HH:mm'),
        endTime: format(leaveTime, 'HH:mm'),
        duration: differenceInMinutes(leaveTime, currentTime),
        activity: 'PREP',
        isOptional: false,
      });

      set({ 
        todayBlocks: blocks, 
        currentPhase: 'MORNING',
        isAwake: true,
        lastUpdated: new Date() 
      });
    },

    markBlockComplete: (blockId: string) => {
      const { todayBlocks } = get();
      const updatedBlocks = todayBlocks.map(block => 
        block.id === blockId ? { ...block, isOptional: true } : block
      );
      set({ todayBlocks: updatedBlocks, lastUpdated: new Date() });
    },

    resetDay: () => {
      set({
        currentPhase: 'MORNING',
        arrivalTimeHome: null,
        timeWindow: null,
        todayBlocks: [],
        isAwake: false,
        lastUpdated: new Date(),
      });
    },
  }),
  {
    name: 'schedule-storage',
  }
));
