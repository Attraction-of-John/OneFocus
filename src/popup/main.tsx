import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useTimerStore } from '@/stores/useTimerStore';
import TimerContent from '@/components/oneFocus/timer/TimerContent';
import '@/styles/index.css';

function PopupApp() {
  const { isRunning } = useTimerStore();

  useEffect(() => {
    // 타이머가 진행 중이 아니면 새탭 열고 팝업 창 닫기
    if (!isRunning) {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.windows) {
        chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
        chrome.windows.getCurrent((window) => {
          if (window.id !== undefined) {
            chrome.windows.remove(window.id);
          }
        });
      }
    }
  }, [isRunning]);

  // 타이머가 진행 중이 아니면 로딩 표시
  if (!isRunning) {
    return (
      <div className="text-white text-center p-6">
        <p>새 탭을 여는 중...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <TimerContent />
    </div>
  );
}

const root = createRoot(document.getElementById('popup-root')!);
root.render(<PopupApp />);
