/* global chrome */

export function formatTimerDisplay(remainingTime) {
  const hours = Math.floor(remainingTime / 3600);
  const minutes = Math.floor((remainingTime % 3600) / 60);
  const seconds = remainingTime % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function updateBadgeText(remainingTime) {
  const displayText = formatTimerDisplay(remainingTime);
  chrome.action.setBadgeText({ text: displayText });
  chrome.action.setBadgeBackgroundColor({ color: '#999999' });
}

export function startBadgeUpdate() {
  if (!chrome.runtime?.id) {
    console.warn('Extension context unavailable');
    return;
  }

  return new Promise((resolve) => {
    chrome.storage.local.get(['timerState'], (result) => {
      if (chrome.runtime.lastError) {
        console.warn('Failed to load timer state:', chrome.runtime.lastError);
        resolve(null);
        return;
      }

      if (result.timerState) {
        chrome.runtime.sendMessage({ type: 'TIMER_UPDATE', state: result.timerState }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn('Failed to update timer:', chrome.runtime.lastError);
          }
          resolve(response);
        });
      } else {
        resolve(null);
      }
    });
  });
}
