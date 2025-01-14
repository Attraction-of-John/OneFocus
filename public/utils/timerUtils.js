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
  chrome.storage.sync.get(['timerState'], (result) => {
    if (result.timerState?.isRunning) {
      const now = Date.now();
      const endTime = result.timerState.endTime;
      if (endTime && now < endTime) {
        const remaining = Math.ceil((endTime - now) / 1000);
        updateBadgeText(remaining);
      }
    }
  });

  return setInterval(() => {
    chrome.storage.sync.get(['timerState'], (result) => {
      if (result.timerState?.isRunning && result.timerState?.endTime) {
        const now = Date.now();
        const endTime = result.timerState.endTime;
        if (now < endTime) {
          const remaining = Math.ceil((endTime - now) / 1000);
          updateBadgeText(remaining);
        } else {
          chrome.action.setBadgeText({ text: '' });
        }
      } else {
        chrome.action.setBadgeText({ text: '' });
      }
    });
  }, 1000);
}
