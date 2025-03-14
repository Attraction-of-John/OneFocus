import { create } from 'zustand';
import { Todo } from '@/types/todo.interface';
import { subscribeWithSelector } from 'zustand/middleware';

const timerChannel = new BroadcastChannel('timer_channel');

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

const sendMessageToBackground = (state: any) => {
  if (!chrome.runtime?.id) return;

  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage({ type: 'TIMER_UPDATE', state }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('Timer update failed:', chrome.runtime.lastError);
        }
        resolve(response);
      });
    } catch (error) {
      console.warn('Failed to send message:', error);
      resolve(null);
    }
  });
};

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
        const newState = isRunning
          ? {
              isRunning,
              startTime: now,
              endTime: now + state.remainingTime * 1000,
              remainingTime: state.remainingTime,
            }
          : state.endTime
            ? {
                isRunning,
                startTime: null,
                endTime: null,
                remainingTime: Math.ceil((state.endTime - now) / 1000),
              }
            : { isRunning };

        setTimeout(() => {
          sendMessageToBackground(newState);
          timerChannel.postMessage({ type: 'TIMER_UPDATE', state: newState });
        }, 0);

        return newState;
      }),
    setStartTime: (startTime) => set({ startTime }),
    setEndTime: (endTime) => set({ endTime }),
    resetTimer: () =>
      set(() => {
        const newState = {
          remainingTime: 0,
          isRunning: false,
          isTimerStarted: false,
          startTime: null,
          endTime: null,
          currentTodo: null,
        };

        setTimeout(() => {
          sendMessageToBackground(newState);
          timerChannel.postMessage({ type: 'TIMER_UPDATE', state: newState });
        }, 0);

        return newState;
      }),
  })),
);

timerChannel.onmessage = (event) => {
  if (event.data.type === 'TIMER_UPDATE') {
    useTimerStore.setState(event.data.state);
  }
};

if (typeof chrome !== 'undefined' && chrome.storage?.local && chrome.runtime?.id) {
  const loadTimerState = async () => {
    try {
      const result = await chrome.storage.local.get(['timerState']);
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
