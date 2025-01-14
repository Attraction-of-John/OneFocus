import { create } from 'zustand';
import { Todo } from '@/types/todo.interface';
import { subscribeWithSelector } from 'zustand/middleware';

interface TimerStore {
  isTimerMode: boolean;
  isTimerStarted: boolean;
  currentTodo: Todo | null;
  remainingTime: number;
  isRunning: boolean;
  startTime: number | null;
  endTime: number | null;
  setTimerMode: (isTimerMode: boolean) => void;
  setTimerStarted: (isStarted: boolean) => void;
  setCurrentTodo: (todo: Todo | null) => void;
  setRemainingTime: (time: number) => void;
  setIsRunning: (isRunning: boolean) => void;
  setStartTime: (time: number | null) => void;
  setEndTime: (time: number | null) => void;
  resetTimer: () => void;
}

export const useTimerStore = create<TimerStore>()(
  subscribeWithSelector((set) => ({
    isTimerMode: false,
    isTimerStarted: false,
    currentTodo: null,
    remainingTime: 0,
    isRunning: false,
    startTime: null,
    endTime: null,
    setTimerMode: (isTimerMode) => set({ isTimerMode }),
    setTimerStarted: (isTimerStarted) => set({ isTimerStarted }),
    setCurrentTodo: (todo) =>
      set({
        currentTodo: todo,
        remainingTime: todo ? todo.allottedTime * 60 : 3600,
      }),
    setRemainingTime: (remainingTime) => set({ remainingTime }),
    setIsRunning: (isRunning) =>
      set((state) => {
        const now = Date.now();
        if (isRunning) {
          return {
            isRunning,
            startTime: now,
            endTime: now + state.remainingTime * 1000,
            remainingTime: state.remainingTime,
          };
        }
        if (state.endTime) {
          return {
            isRunning,
            startTime: null,
            endTime: null,
            remainingTime: Math.ceil((state.endTime - now) / 1000),
          };
        }
        return { isRunning };
      }),
    setStartTime: (startTime) => set({ startTime }),
    setEndTime: (endTime) => set({ endTime }),
    resetTimer: () =>
      set({
        remainingTime: 0,
        isRunning: false,
        isTimerStarted: false,
        startTime: null,
        endTime: null,
      }),
  })),
);

if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
  const loadTimerState = async () => {
    try {
      const result = await new Promise<{ timerState: TimerStore }>((resolve) => {
        chrome.storage.sync.get(['timerState'], (result) => resolve(result as { timerState: TimerStore }));
      });

      if (result.timerState) {
        const { endTime, isRunning } = result.timerState;

        if (isRunning && endTime) {
          const now = Date.now();
          if (now < endTime) {
            const remainingTime = Math.ceil((endTime - now) / 1000);
            useTimerStore.setState({
              ...result.timerState,
              remainingTime,
            });
          } else {
            useTimerStore.setState({
              ...result.timerState,
              isRunning: false,
              remainingTime: 0,
            });
          }
        } else {
          useTimerStore.setState(result.timerState);
        }
      }
    } catch (error) {
      console.error('Timer state load error:', error);
    }
  };

  loadTimerState();
}

useTimerStore.subscribe(
  (state) => state,
  (timerState) => {
    chrome.storage.sync.set({ timerState });
  },
);
