/* global chrome */
import { startBadgeUpdate, updateBadgeText } from './utils/timerUtils.js';

let timerState = null;
let timerInterval = null;
let storageUpdateInterval = null;

// Add timer measurements object
let timerMeasurements = {
  totalTimers: 0,
  completedTimers: 0,
  totalTimeSpent: 0, // in seconds
  dailyStats: {},
};

function loadMeasurements() {
  chrome.storage.local.get(['timerMeasurements'], (result) => {
    if (result.timerMeasurements) {
      timerMeasurements = result.timerMeasurements;
    }
  });
}

// Load measurements when script starts
loadMeasurements();

function saveToStorage() {
  if (timerState) {
    chrome.storage.local.set({ timerState });
  }
}

function saveMeasurements() {
  chrome.storage.local.set({ timerMeasurements });
}

function updateTimer() {
  if (timerState?.isRunning && timerState?.endTime) {
    const now = Date.now();
    if (now < timerState.endTime) {
      timerState.remainingTime = Math.ceil((timerState.endTime - now) / 1000);
      updateBadgeText(timerState.remainingTime);
    } else {
      // Timer completed - update measurements
      recordCompletedTimer(timerState);
      clearTimerState();
    }
  }
}

function recordCompletedTimer(state) {
  if (!state || !state.startTime) return;

  // Calculate time spent in seconds
  const timeSpent = Math.round((Date.now() - state.startTime) / 1000);

  // Update total stats
  timerMeasurements.totalTimers++;
  timerMeasurements.completedTimers++;
  timerMeasurements.totalTimeSpent += timeSpent;

  // Update daily stats
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  if (!timerMeasurements.dailyStats[today]) {
    timerMeasurements.dailyStats[today] = {
      timers: 0,
      timeSpent: 0,
    };
  }

  timerMeasurements.dailyStats[today].timers++;
  timerMeasurements.dailyStats[today].timeSpent += timeSpent;

  // Save updated measurements
  saveMeasurements();
}

function clearTimerState() {
  timerState = {
    isRunning: false,
    remainingTime: 0,
    startTime: null,
    endTime: null,
  };

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  if (storageUpdateInterval) {
    clearInterval(storageUpdateInterval);
    storageUpdateInterval = null;
  }

  chrome.action.setBadgeText({ text: '' });
  saveToStorage();
}

startBadgeUpdate();

let badgeInterval;

chrome.runtime.onStartup.addListener(() => {
  if (badgeInterval) clearInterval(badgeInterval);
  badgeInterval = startBadgeUpdate();
});

chrome.runtime.onInstalled.addListener((details) => {
  if (badgeInterval) clearInterval(badgeInterval);
  badgeInterval = startBadgeUpdate();

  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
  }
});

chrome.action.onClicked.addListener(() => {
  if (badgeInterval) clearInterval(badgeInterval);
  badgeInterval = startBadgeUpdate();

  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TIMER_UPDATE') {
    const prevState = timerState;
    timerState = message.state;

    if (timerInterval) clearInterval(timerInterval);
    if (storageUpdateInterval) clearInterval(storageUpdateInterval);

    // Record completed timer if it was running and now it's not
    if (prevState?.isRunning && !timerState.isRunning && prevState.startTime) {
      recordCompletedTimer(prevState);
    }

    if (timerState.isRunning) {
      timerInterval = setInterval(updateTimer, 100);
      storageUpdateInterval = setInterval(saveToStorage, 10000);
      updateTimer();
    } else {
      clearTimerState();
    }

    sendResponse({ status: 'success' });
    return true;
  }

  if (message.type === 'GET_TIMER_MEASUREMENTS') {
    sendResponse({ measurements: timerMeasurements });
    return true;
  }

  switch (message.type) {
    case 'ADD_TODO':
      chrome.storage.local.get(['todoList'], (result) => {
        const todoList = result.todoList || [];
        todoList.push(message.todo);
        chrome.storage.local.set({ todoList }, () => {
          if (chrome.runtime.lastError) {
            console.error('Failed to add todo:', chrome.runtime.lastError);
            sendResponse({ status: 'error' });
          } else {
            sendResponse({ status: 'success' });
          }
        });
      });
      break;

    case 'UPDATE_TODO':
      chrome.storage.local.get(['todoList'], (result) => {
        let todoList = result.todoList || [];
        const index = todoList.findIndex((todo) => todo.id === message.todo.id);
        if (index !== -1) {
          todoList[index] = message.todo;
          chrome.storage.local.set({ todoList }, () => {
            if (chrome.runtime.lastError) {
              console.error('Failed to update todo:', chrome.runtime.lastError);
              sendResponse({ status: 'error' });
            } else {
              sendResponse({ status: 'success' });
            }
          });
        } else {
          console.error('Todo not found.');
          sendResponse({ status: 'error' });
        }
      });
      break;

    case 'DELETE_TODO':
      chrome.storage.local.get(['todoList'], (result) => {
        let todoList = result.todoList || [];
        todoList = todoList.filter((todo) => todo.id !== message.id);
        chrome.storage.local.set({ todoList }, () => {
          if (chrome.runtime.lastError) {
            console.error('Failed to delete todo:', chrome.runtime.lastError);
            sendResponse({ status: 'error' });
          } else {
            sendResponse({ status: 'success' });
          }
        });
      });
      break;

    case 'SET_TODO_LIST':
      chrome.storage.local.set({ todoList: message.todoList }, () => {
        if (chrome.runtime.lastError) {
          console.error('Failed to set todoList:', chrome.runtime.lastError);
          sendResponse({ status: 'error' });
        } else {
          sendResponse({ status: 'success' });
        }
      });
      break;

    case 'GET_SUGGESTIONS':
      fetch(`https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(message.query)}`)
        .then((response) => response.json())
        .then((data) => sendResponse({ suggestions: data[1] }))
        .catch((error) => sendResponse({ error: error.message }));
      return true;

    case 'RESET_TIMER_MEASUREMENTS':
      timerMeasurements = {
        totalTimers: 0,
        completedTimers: 0,
        totalTimeSpent: 0,
        dailyStats: {},
      };
      saveMeasurements();
      sendResponse({ status: 'success' });
      break;
  }
});
