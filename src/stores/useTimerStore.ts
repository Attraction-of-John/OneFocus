import { create } from 'zustand';
import { Todo } from '@/types/todo.interface';
import { subscribeWithSelector } from 'zustand/middleware';

// 상수 정의
const TIMER_STATE_KEY = 'timerState';

// 다른 탭과의 타이머 상태 동기화를 위한 BroadcastChannel
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

/**
 * 타이머 상태를 로컬 스토리지 및 백그라운드로 저장
 */
const saveTimerState = (state: Partial<TimerStore>) => {
  // 브로드캐스트 채널을 통해 다른 탭에 알림
  timerChannel.postMessage({ type: 'TIMER_UPDATE', state });

  // Chrome 확장 프로그램이 사용 가능한 경우 스토리지 및 백그라운드에 저장
  if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
    try {
      // Chrome 스토리지에 즉시 저장
      chrome.storage.local.set({ [TIMER_STATE_KEY]: state });

      // 백그라운드 스크립트에 알림
      chrome.runtime.sendMessage({ type: 'TIMER_UPDATE', state }).catch((error) => {
        console.warn('Failed to send message to background:', error);
      });
    } catch (error) {
      console.error('Failed to save timer state:', error);
    }
  } else {
    // 일반 브라우저 환경에서는 로컬 스토리지에 저장
    try {
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }
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

        // 타이머 시작 또는 일시 정지에 따른 상태 변경
        const newState: Partial<TimerStore> = isRunning
          ? {
              // 타이머 시작 시
              isRunning,
              startTime: now,
              endTime: now + state.remainingTime * 1000,
              remainingTime: state.remainingTime,
              currentTodo: state.currentTodo,
            }
          : state.endTime
            ? {
                // 타이머 일시 정지 시
                isRunning,
                startTime: null,
                endTime: null,
                remainingTime: Math.ceil((state.endTime - now) / 1000),
                currentTodo: state.currentTodo,
              }
            : {
                // 타이머가 실행되지 않았던 경우
                isRunning,
                currentTodo: state.currentTodo,
              };

        // 상태 저장 (동기적)
        saveTimerState(newState);

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

        // 타이머 상태 초기화 저장
        saveTimerState(newState);

        return newState;
      }),
  })),
);

// 다른 탭에서 온 메시지 처리
timerChannel.onmessage = (event) => {
  if (event.data.type === 'TIMER_UPDATE') {
    useTimerStore.setState(event.data.state);
  }
};

// Chrome 확장 프로그램 환경에서 초기화
if (typeof chrome !== 'undefined' && chrome.storage?.local && chrome.runtime?.id) {
  // 타이머 상태 로드
  const loadTimerState = async () => {
    try {
      // Promise 형태로 변환
      const getStorageData = () =>
        new Promise((resolve) => {
          chrome.storage.local.get([TIMER_STATE_KEY], (result) => {
            resolve(result[TIMER_STATE_KEY] || null);
          });
        });

      const timerState = await getStorageData();

      if (timerState) {
        const { endTime, isRunning } = timerState as any;

        if (isRunning && endTime) {
          const now = Date.now();
          if (now < endTime) {
            // 타이머 아직 실행 중
            const remainingTime = Math.ceil((endTime - now) / 1000);
            useTimerStore.setState({
              ...(timerState as any),
              remainingTime,
            });
          } else {
            // 타이머 종료됨
            useTimerStore.setState({
              ...(timerState as any),
              isRunning: false,
              remainingTime: 0,
            });
          }
        } else {
          // 타이머 실행 중이 아닌 경우
          useTimerStore.setState(timerState as any);
        }
      }
    } catch (error) {
      console.error('Timer state load error:', error);
    }
  };

  // 초기화 실행
  loadTimerState();

  // 백그라운드에서 온 메시지 처리
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'TIMER_UPDATE') {
      useTimerStore.setState(message.state);
    }
    return true;
  });
}

// 상태 변경 감지 및 디버깅 로그
useTimerStore.subscribe(
  (state) => state.isRunning,
  (isRunning) => {
    console.log('타이머 실행 상태 변경:', isRunning);
  },
);
