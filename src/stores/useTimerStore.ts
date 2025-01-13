import { create } from 'zustand';
import { Todo } from '@/types/todo.interface';

interface TimerStore {
  isTimerMode: boolean;
  isTimerStarted: boolean;
  currentTodo: Todo | null;
  currentTime: number;
  isRunning: boolean;
  setTimerMode: (isTimerMode: boolean) => void;
  setTimerStarted: (isStarted: boolean) => void;
  setCurrentTodo: (todo: Todo | null) => void;
  setCurrentTime: (time: number) => void;
  setIsRunning: (isRunning: boolean) => void;
  resetTimer: () => void;
}

export const useTimerStore = create<TimerStore>((set) => ({
  isTimerMode: false,
  isTimerStarted: false,
  currentTodo: null,
  currentTime: 0,
  isRunning: false,
  setTimerMode: (isTimerMode) => set({ isTimerMode }),
  setTimerStarted: (isTimerStarted) => set({ isTimerStarted }),
  setCurrentTodo: (todo) =>
    set({
      currentTodo: todo,
      currentTime: todo ? todo.allottedTime * 60 : 3600,
    }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setIsRunning: (isRunning) => set({ isRunning }),
  resetTimer: () => set({ currentTime: 0, isRunning: false, isTimerStarted: false }),
}));
