import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { useTimerStore } from '@/stores/useTimerStore';
import { formatTimer } from '@/utils/timerUtils';
import '@/styles/index.css';
import i18n from '@/i18n';
import { useTranslation } from 'react-i18next';

function PopupApp() {
  const { isRunning, remainingTime, currentTodo } = useTimerStore();
  const { t } = useTranslation();

  // 초기 언어/테마를 settings에서 반영 (i18n은 기본적으로 navigator/localStorage를 보지만, 우리는 커스텀 키를 씀)
  useEffect(() => {
    const SETTINGS_KEY = 'onefocus_settings_v1';
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local && chrome.runtime?.id) {
        chrome.storage.local.get([SETTINGS_KEY], (res) => {
          try {
            const saved = res?.[SETTINGS_KEY] as { language?: string; theme?: string } | undefined;
            if (saved?.language) {
              void i18n.changeLanguage(saved.language);
              document.documentElement.setAttribute('lang', saved.language);
            }
            if (saved?.theme === 'dark') document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
            document.title = i18n.t('popup.htmlTitle');
          } catch {
            // ignore
          }
        });
      } else {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as { language?: string; theme?: string };
          if (saved?.language) {
            void i18n.changeLanguage(saved.language);
            document.documentElement.setAttribute('lang', saved.language);
          }
          if (saved?.theme === 'dark') document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
        }
        document.title = i18n.t('popup.htmlTitle');
      }
    } catch {
      // ignore
    }
  }, []);

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
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-background text-foreground overflow-hidden">
      {/* 헤더 */}
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold mb-2">{t('popup.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('popup.subtitle')}</p>
      </div>

      {/* 진행상황 표시 */}
      {currentTodo ? (
        <div className="w-full mb-2">
          <div className="text-center mb-2">
            <h3 className="text-lg font-semibold mb-2">{currentTodo.text}</h3>
            {currentTodo.category && (
              <span className="text-sm px-3 py-1 text-muted-foreground bg-muted rounded-full border border-border inline-block mt-2">
                {currentTodo.category}
              </span>
            )}
          </div>

          {/* 진행상황 퍼센트 */}
          <div className="text-center mb-2">
            <div className="text-sm text-muted-foreground mb-1">{t('popup.progress')}</div>
            <div className="text-2xl font-bold">
              {Math.round(((currentTodo.allottedTime * 60 - remainingTime) / (currentTodo.allottedTime * 60)) * 100)}%
            </div>
          </div>

          {/* 진행상황 바 */}
          <div className="w-full h-3 mb-2 overflow-hidden bg-muted rounded-full shadow-inner">
            <div
              className="h-full relative overflow-hidden rounded-full bg-primary shadow transition-[width] duration-500 ease-out"
              style={{
                width: `${((currentTodo.allottedTime * 60 - remainingTime) / (currentTodo.allottedTime * 60)) * 100}%`,
              }}
            />
          </div>

          {/* 남은 시간 */}
          <div className="text-center text-sm text-muted-foreground">
            {t('popup.remainingTimeLabel', { minutes: Math.floor(remainingTime / 60), seconds: remainingTime % 60 })}
          </div>
        </div>
      ) : (
        <div className="w-full mb-2 text-center">
          <div className="text-lg font-semibold text-muted-foreground mb-2">{t('popup.noTaskTitle')}</div>
          <div className="text-sm text-muted-foreground">{t('popup.noTaskHint')}</div>
        </div>
      )}

      {/* 타이머 정보 */}
      <div className="text-center mb-2 flex-1 flex flex-col justify-center">
        <div className="text-xl font-mono font-bold mb-3">{formatTimer(remainingTime)}</div>
        <div className="text-sm px-4 py-2 text-muted-foreground bg-muted rounded-full inline-block">
          {isRunning ? t('popup.status.running') : t('popup.status.idle')}
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('popup-root')!);
root.render(<PopupApp />);
