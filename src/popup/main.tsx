import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { useTimerStore } from '@/stores/useTimerStore';
import { formatTimer } from '@/utils/timerUtils';
import '@/styles/index.css';

function PopupApp() {
  const { isRunning, remainingTime, currentTodo } = useTimerStore();

  const attemptedOpenRef = useRef(false);
  useEffect(() => {
    let cancelled = false;
    async function maybeOpenMainWhenNotRunning() {
      if (attemptedOpenRef.current) return;
      if (typeof chrome === 'undefined' || !chrome.runtime?.id) return;

      // 백그라운드에서 실제 타이머 상태를 먼저 조회 (경쟁 상태 방지)
      const bgState = await new Promise<any>((resolve) => {
        try {
          chrome.runtime.sendMessage({ type: 'GET_TIMER_STATE' }, (res) => resolve(res?.state || null));
        } catch {
          resolve(null);
        }
      });

      if (cancelled || !bgState || bgState.isRunning) return;

      attemptedOpenRef.current = true;

      const extensionUrl = chrome.runtime.getURL('index.html');
      try {
        chrome.tabs.query({ url: `${extensionUrl}*` }, (tabs) => {
          if (cancelled) return;
          if (tabs.length > 0 && tabs[0].id && tabs[0].windowId) {
            chrome.tabs.update(tabs[0].id, { active: true });
            chrome.windows.update(tabs[0].windowId, { focused: true, state: 'maximized' });
          } else {
            chrome.tabs.create({ url: `${extensionUrl}` });
          }
        });
      } catch {
        // ignore
      }
    }

    maybeOpenMainWhenNotRunning();
    return () => {
      cancelled = true;
    };
  }, []);

  // 실시간 타이머 업데이트를 위한 인터벌
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning) {
      // 타이머가 실행 중일 때 100ms마다 업데이트
      intervalId = setInterval(() => {
        // 강제로 리렌더링을 위한 더미 상태 업데이트
        // 실제로는 Zustand store가 자동으로 업데이트됨
      }, 100);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning]);

  // const handleClosePopup = () => {
  //   if (typeof chrome !== 'undefined' && chrome.windows) {
  //     chrome.windows.getCurrent((window) => {
  //       if (window.id !== undefined) {
  //         chrome.windows.remove(window.id);
  //       }
  //     });
  //   }
  // };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 text-gray-800 overflow-hidden">
      {/* 헤더 */}
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">OneFocus</h2>
        <p className="text-sm text-gray-600">집중 시간 관리</p>
      </div>

      {/* 진행상황 표시 */}
      {currentTodo ? (
        <div className="w-full mb-2">
          <div className="text-center mb-2">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">{currentTodo.text}</h3>
            {currentTodo.category && (
              <span className="text-sm px-3 py-1 text-gray-600 bg-gray-200 rounded-full border border-gray-300 inline-block mt-2">
                {currentTodo.category}
              </span>
            )}
          </div>

          {/* 진행상황 퍼센트 */}
          <div className="text-center mb-2">
            <div className="text-sm text-gray-600 mb-1">진행상황</div>
            <div className="text-2xl font-bold text-gray-800">
              {Math.round(((currentTodo.allottedTime * 60 - remainingTime) / (currentTodo.allottedTime * 60)) * 100)}%
            </div>
          </div>

          {/* 진행상황 바 */}
          <div className="w-full h-3 mb-2 overflow-hidden bg-gray-200 rounded-full shadow-inner">
            <div
              className="h-full relative overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-emerald-500 shadow transition-[width] duration-500 ease-out"
              style={{
                width: `${((currentTodo.allottedTime * 60 - remainingTime) / (currentTodo.allottedTime * 60)) * 100}%`,
              }}
            />
          </div>

          {/* 남은 시간 */}
          <div className="text-center text-sm text-gray-600">
            남은 시간: {Math.floor(remainingTime / 60)}분 {remainingTime % 60}초
          </div>
        </div>
      ) : (
        <div className="w-full mb-2 text-center">
          <div className="text-lg font-semibold text-gray-600 mb-2">할 일을 선택해주세요</div>
          <div className="text-sm text-gray-500">메인 페이지에서 할 일을 선택하고 타이머를 시작하세요</div>
        </div>
      )}

      {/* 타이머 정보 */}
      <div className="text-center mb-2 flex-1 flex flex-col justify-center">
        <div className="text-xl font-mono font-bold mb-3 text-gray-800">{formatTimer(remainingTime)}</div>
        <div className="text-sm px-4 py-2 text-gray-600 bg-gray-200 rounded-full inline-block">
          {isRunning ? '집중 중...' : '대기 중'}
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('popup-root')!);
root.render(<PopupApp />);
