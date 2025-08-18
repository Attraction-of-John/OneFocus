import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useTimerStore } from '@/stores/useTimerStore';
import { formatTimer } from '@/utils/timerUtils';
import '@/styles/index.css';

function PopupApp() {
  const { isRunning, remainingTime, currentTodo } = useTimerStore();

  useEffect(() => {
    // 타이머가 진행 중이 아니면 기존 탭 확인 후 이동
    if (!isRunning) {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.windows) {
        const extensionUrl = chrome.runtime.getURL('index.html');

        // 기존 OneFocus 탭이 있는지 확인
        chrome.tabs.query({ url: `${extensionUrl}*` }, (tabs) => {
          if (tabs.length > 0 && tabs[0].id && tabs[0].windowId) {
            // 기존 탭이 있으면 해당 탭을 활성화
            chrome.tabs.update(tabs[0].id, {
              active: true,
              url: `${extensionUrl}#/timer-completed`,
            });

            // 창을 포커스하고 최상위로 가져오기
            chrome.windows.update(tabs[0].windowId, {
              focused: true,
              state: 'maximized',
            });
          } else {
            // 기존 탭이 없으면 새 탭 생성
            chrome.tabs.create({ url: `${extensionUrl}#/timer-completed` });
          }
        });
      }
    }
  }, [isRunning]);

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

  const handleOpenMainTab = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
    }
  };

  const handleClosePopup = () => {
    if (typeof chrome !== 'undefined' && chrome.windows) {
      chrome.windows.getCurrent((window) => {
        if (window.id !== undefined) {
          chrome.windows.remove(window.id);
        }
      });
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-6"
      style={{
        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 50%, #d1d5db 100%)',
        color: '#1f2937',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* 헤더 */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">OneFocus</h2>
        <p className="text-sm text-gray-600">집중 시간 관리</p>
      </div>

      {/* 진행상황 표시 */}
      {currentTodo ? (
        <div className="w-full mb-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">{currentTodo.text}</h3>
            {currentTodo.category && (
              <span
                className="text-sm px-3 py-1"
                style={{
                  color: '#4b5563',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '9999px',
                  border: '1px solid #d1d5db',
                  display: 'inline-block',
                  marginTop: '8px',
                }}
              >
                {currentTodo.category}
              </span>
            )}
          </div>

          {/* 진행상황 퍼센트 */}
          <div className="text-center mb-3">
            <div className="text-sm text-gray-600 mb-1">진행상황</div>
            <div className="text-2xl font-bold text-gray-800">
              {Math.round(((currentTodo.allottedTime * 60 - remainingTime) / (currentTodo.allottedTime * 60)) * 100)}%
            </div>
          </div>

          {/* 진행상황 바 */}
          <div
            className="w-full h-3 mb-3 overflow-hidden"
            style={{
              backgroundColor: '#e5e7eb',
              borderRadius: '9999px',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              className="h-full relative overflow-hidden"
              style={{
                width: `${((currentTodo.allottedTime * 60 - remainingTime) / (currentTodo.allottedTime * 60)) * 100}%`,
                background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #10b981 100%)',
                borderRadius: '9999px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                transition: 'width 0.5s ease-out',
              }}
            >
              {/* 진행상황 바에 빛나는 효과 */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                  animation: 'pulse 2s infinite',
                }}
              />
            </div>
          </div>

          {/* 남은 시간 */}
          <div className="text-center text-sm text-gray-600">
            남은 시간: {Math.floor(remainingTime / 60)}분 {remainingTime % 60}초
          </div>
        </div>
      ) : (
        <div className="w-full mb-6 text-center">
          <div className="text-lg font-semibold text-gray-600 mb-2">할 일을 선택해주세요</div>
          <div className="text-sm text-gray-500">메인 페이지에서 할 일을 선택하고 타이머를 시작하세요</div>
        </div>
      )}

      {/* 타이머 정보 */}
      <div className="text-center mb-6 flex-1 flex flex-col justify-center">
        <div className="text-4xl font-mono font-bold mb-3 text-gray-800">{formatTimer(remainingTime)}</div>
        <div
          className="text-sm px-4 py-2"
          style={{
            color: '#4b5563',
            backgroundColor: '#e5e7eb',
            borderRadius: '9999px',
            display: 'inline-block',
          }}
        >
          {isRunning ? '집중 중...' : '대기 중'}
        </div>
      </div>

      {/* 버튼들 */}
      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={handleOpenMainTab}
          className="w-full py-3 font-medium transition-colors"
          style={{
            backgroundColor: '#374151',
            color: 'white',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1f2937';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#374151';
          }}
        >
          메인 페이지 열기
        </button>
        <button
          onClick={handleClosePopup}
          className="w-full py-3 font-medium transition-colors"
          style={{
            backgroundColor: 'transparent',
            color: '#6b7280',
            borderRadius: '8px',
            border: '2px solid #9ca3af',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e5e7eb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('popup-root')!);
root.render(<PopupApp />);
