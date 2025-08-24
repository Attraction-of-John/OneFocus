/* global chrome */
import { startBadgeUpdate, updateBadgeText } from './utils/timerUtils.js';

// 상수 정의
const TIMER_STATE_KEY = 'timerState';
const TIMER_MEASUREMENTS_KEY = 'timerMeasurements';
const TODO_LIST_KEY = 'todoList';
const TAB_CLOSE_DELAY_MS = 100; // 새 탭 닫기 지연 시간

// 타이머 상태 및 인터벌 관리
let timerState = null;
let timerInterval = null;
let storageUpdateInterval = null;
let timerCheckInterval = null;
let lastBroadcastAt = 0; // 진행상황 브로드캐스트 스로틀

/**
 * 현재 열려 있는 OneFocus 탭을 조회
 * - 확장 페이지 URL(chrome-extension://.../index.html)
 * - 새 탭 오버라이드 URL(chrome://newtab/, chrome://new-tab-page/)
 */
async function getOneFocusTabs() {
  const extensionUrl = chrome.runtime.getURL('index.html');
  const allTabs = await chrome.tabs.query({});
  return allTabs.filter((tab) => {
    const url = tab.url || '';
    return url.startsWith(extensionUrl);
  });
}

/**
 * 타이머 상태를 chrome.storage.local에 저장
 */
function saveToStorage() {
  if (timerState) {
    chrome.storage.local.set({ [TIMER_STATE_KEY]: timerState });
  }
}

/**
 * chrome.storage.local에서 데이터 가져오기
 * @param {string} key - 스토리지 키
 * @returns {Promise<any>} - 저장된 데이터
 */
function getFromStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] || null);
    });
  });
}

/**
 * 타이머 상태 업데이트
 * - 실행 중인 타이머의 남은 시간 계산
 * - 배지 텍스트 업데이트
 * - 완료된 타이머 처리
 */
function updateTimer() {
  if (timerState?.isRunning && timerState?.endTime) {
    const now = Date.now();
    if (now < timerState.endTime) {
      // 타이머가 아직 실행 중인 경우
      timerState.remainingTime = Math.ceil((timerState.endTime - now) / 1000);
      updateBadgeText(timerState.remainingTime);

      // 진행상황 주기적 브로드캐스트 (최대 1초당 2회)
      const nowMs = Date.now();
      if (nowMs - lastBroadcastAt > 500) {
        lastBroadcastAt = nowMs;
        try {
          chrome.runtime.sendMessage({ type: 'TIMER_UPDATE', state: timerState });
        } catch (e) {
          console.error('진행상황 브로드캐스트 오류:', e);
          // ignore
        }
      }
    } else {
      // 타이머가 완료된 경우
      saveTimerMeasurement(timerState);

      // 타이머 상태만 초기화 (완료 처리는 setupTimerTracking에서 담당)
      clearTimerState();
    }
  }
}

/**
 * 타이머 완료 시 처리
 */
async function handleTimerCompletion() {
  try {
    // 타이머 상태를 먼저 초기화하여 중복 실행 방지
    const currentState = { ...timerState };
    clearTimerState();

    // 기존 OneFocus 탭이 있는지 먼저 확인 (확장 URL + 새 탭 오버라이드 포함)
    const existingTabs = await getOneFocusTabs();

    if (existingTabs.length > 0) {
      // 기존 탭이 있으면 해당 탭을 활성화하고 완료 페이지로 이동

      try {
        // await chrome.tabs.update(existingTabs[0].id, {
        //   active: true,
        //   url: `${chrome.runtime.getURL('index.html')}#/timer-completed`,
        // });

        // // 창을 포커스하고 최상위로 가져오기 (windowId가 없는 경우 백업 처리)
        // const focused = await focusOrRestoreWindow(existingTabs[0].windowId);
        // if (!focused) {
        //   await chrome.windows.create({
        //     url: `${extensionUrl}#/timer-completed`,
        //     focused: true,
        //     state: 'maximized',
        //     type: 'normal',
        //   });
        // }

        console.log('타이머 완료: 기존 OneFocus 탭이 활성화되었습니다.');
      } catch (error) {
        console.error('기존 탭 활성화 중 오류:', error);
        // 오류 발생 시 새 탭 생성
        // await createNewTabForCompletion();
      }
    } else {
      // 기존 탭이 없으면 새 탭 생성
      // await createNewTabForCompletion();
    }

    // 강력한 알림 표시 (기존 탭이든 새 탭이든 상관없이)
    chrome.notifications.create('timerCompleted', {
      type: 'basic',
      iconUrl: 'extension-icons/icon128.png',
      title: '타이머 완료!',
      message: currentState.currentTodo
        ? `${currentState.currentTodo.text} 작업이 완료되었습니다`
        : '타이머가 완료되었습니다',
      buttons: [{ title: '확인하기' }],
      priority: 2,
      requireInteraction: true, // 알림 클릭 시 닫히지 않음
      silent: false, // 알림 사운드 재생
    });
  } catch (error) {
    console.error('타이머 완료 처리 중 오류:', error);
  }
}

/**
 * 타이머 완료를 위한 새 탭 생성
 */
async function createNewTabForCompletion() {
  const extensionUrl = chrome.runtime.getURL('index.html');

  try {
    const newTab = await chrome.tabs.create({
      url: `${extensionUrl}#/timer-completed`,
      active: true,
    });

    // 새 창을 포커스
    if (newTab.windowId !== undefined) {
      await chrome.windows.update(newTab.windowId, {
        focused: true,
        state: 'maximized',
      });
    } else {
      // 윈도우 정보가 없을 경우 백업: 새 윈도우 생성 후 포커스
      await chrome.windows.create({
        url: `${extensionUrl}#/timer-completed`,
        focused: true,
        state: 'maximized',
        type: 'normal',
      });
    }

    console.log('타이머 완료: 새 OneFocus 탭이 생성되었습니다.');
  } catch (error) {
    console.error('새 탭 생성 중 오류:', error);
  }
}

/**
 * 타이머 상태 초기화
 * - 실행 중이던 타이머 측정 데이터 저장
 * - 인터벌 정리
 * - 배지 텍스트 제거
 */
function clearTimerState() {
  // 실행 중이던 타이머 측정 데이터 저장
  if (timerState?.isRunning) {
    saveTimerMeasurement(timerState);
  }

  // 타이머 상태 초기화
  timerState = {
    isRunning: false,
    remainingTime: 0,
    startTime: null,
    endTime: null,
  };

  // 인터벌 정리
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  if (storageUpdateInterval) {
    clearInterval(storageUpdateInterval);
    storageUpdateInterval = null;
  }

  // 배지 텍스트 제거
  chrome.action.setBadgeText({ text: '' });

  // 변경된 상태 저장
  saveToStorage();
}

/**
 * 타이머 측정 데이터 저장
 * @param {Object} state - 타이머 상태
 */
async function saveTimerMeasurement(state) {
  if (!state || !state.startTime) return;

  const endedAt = state.isRunning ? Date.now() : state.endTime || Date.now();

  // 측정 데이터 생성
  const measurement = {
    startTime: state.startTime,
    endTime: endedAt,
    duration: Math.ceil((endedAt - state.startTime) / 1000),
    completed: !state.isRunning,
    todoId: state.currentTodo?.id || null,
    todoText: state.currentTodo?.text || null,
    category: state.currentTodo?.category || null,
    timestamp: Date.now(),
  };

  // 기존 측정 데이터에 추가
  const measurements = (await getFromStorage(TIMER_MEASUREMENTS_KEY)) || [];
  measurements.push(measurement);
  chrome.storage.local.set({ [TIMER_MEASUREMENTS_KEY]: measurements });

  // 앱 페이지에 측정 데이터 변경 알림 (extension -> app 통신)
  chrome.runtime
    .sendMessage({
      type: 'MEASUREMENTS_UPDATED',
      data: measurements,
    })
    .catch(() => {
      // 앱이 열려있지 않을 경우 발생하는 오류는 무시
    });
}

// 배지 업데이트 시작
startBadgeUpdate();
let badgeInterval;

// 확장 프로그램 시작 시 배지 업데이트 재시작
chrome.runtime.onStartup.addListener(() => {
  if (badgeInterval) clearInterval(badgeInterval);
  badgeInterval = startBadgeUpdate();

  // Storage에서 타이머 상태 로드
  initializeFromStorage();
});

// 확장 프로그램 설치/업데이트 시 처리
chrome.runtime.onInstalled.addListener((details) => {
  if (badgeInterval) clearInterval(badgeInterval);
  badgeInterval = startBadgeUpdate();

  // 새로 설치된 경우 앱 페이지 열기
  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
  }

  // Storage에서 타이머 상태 로드
  initializeFromStorage();
});

// 확장 프로그램 아이콘 클릭 처리는 manifest.json의 default_popup으로 처리됨
// 팝업에서 타이머 상태에 따라 적절한 동작 수행

// 탭 생성 시 타이머 상태 확인 및 제한 처리 - 개선된 버전
chrome.tabs.onCreated.addListener(async (tab) => {
  // console.log('새 탭 생성됨:', tab.id);

  // 팝업 창에서 생성된 탭은 제한하지 않음
  if (tab.windowId) {
    try {
      const window = await chrome.windows.get(tab.windowId);
      if (window.type === 'popup') {
        // console.log('팝업 창에서 생성된 탭이므로 제한하지 않음:', tab.id);
        return;
      }
    } catch (error) {
      console.error('창 정보 확인 중 오류:', error);
    }
  }

  // 메모리에 있는 타이머 상태 확인 (즉시)
  if (timerState?.isRunning) {
    // console.log('메모리에서 실행 중인 타이머 상태 확인됨');
    await handleNewTabWithActiveTimer(tab);
    return;
  }

  // 저장소에서 타이머 상태 확인 (백업)
  try {
    const state = await getFromStorage(TIMER_STATE_KEY);
    // console.log('저장소에서 타이머 상태 확인:', state);

    if (state?.isRunning) {
      // console.log('저장소에서 실행 중인 타이머 상태 확인됨');
      // 메모리에 캐시 업데이트
      timerState = state;
      await handleNewTabWithActiveTimer(tab);
    }
  } catch (error) {
    console.error('타이머 상태 확인 중 오류:', error);
  }
});

/**
 * 실행 중인 타이머가 있을 때 새 탭 처리
 */
async function handleNewTabWithActiveTimer(tab) {
  try {
    // console.log('타이머 실행 중 - 새 탭 제한 처리 시작');

    // 알림 표시
    chrome.notifications.create(
      {
        type: 'basic',
        iconUrl: 'extension-icons/icon128.png',
        title: '타이머 실행 중',
        message: '타이머가 실행 중일 때는 새 탭을 열 수 없습니다. 먼저 타이머를 중지해주세요.',
      },
      (notificationId) => {
        console.log('알림 생성됨:', notificationId);
        if (chrome.runtime.lastError) {
          console.error('알림 생성 오류:', chrome.runtime.lastError);
        }
      },
    );

    // 앱 탭이 이미 열려있으면 그 탭을 활성화
    const existingTabs = await getOneFocusTabs();
    // console.log('기존 앱 탭:', existingTabs.length);

    if (existingTabs.length > 0) {
      try {
        await chrome.tabs.update(existingTabs[0].id, { active: true });
        await chrome.windows.update(existingTabs[0].windowId, { focused: true });
      } catch (error) {
        console.error('탭 활성화 오류:', error);
      }
    }

    // 새로 생성된 탭 닫기 (지연 추가)
    setTimeout(async () => {
      try {
        await chrome.tabs.remove(tab.id);
        console.log('새 탭 닫기 성공:', tab.id);
      } catch (error) {
        console.error('탭 닫기 오류:', error, tab);
      }
    }, TAB_CLOSE_DELAY_MS);
  } catch (error) {
    console.error('새 탭 처리 중 오류:', error);
  }
}

// 창 포커스/복원 유틸리티
async function focusOrRestoreWindow(windowId) {
  try {
    if (windowId === undefined) return false;
    // 1차: normal + focused
    await chrome.windows.update(windowId, { state: 'normal', focused: true });
    // 2차: 최대화 시도 (선호 동작)
    await chrome.windows.update(windowId, { state: 'maximized', focused: true });
    return true;
  } catch (error) {
    try {
      console.log('창 포커스/복원 실패:', error);
      // 마지막 시도: 포커스만
      await chrome.windows.update(windowId, { focused: true });
      return true;
    } catch {
      return false;
    }
  }
}

// 메시지 핸들러
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('메시지 수신:', message.type);

  switch (message.type) {
    // 타이머 관련 메시지
    case 'TIMER_UPDATE':
      handleTimerUpdate(message, sendResponse);
      return true;

    case 'TIMER_COMPLETED':
      // 타이머 완료는 setupTimerTracking에서 처리하므로 여기서는 무시
      sendResponse({ status: 'success' });
      handleTimerCompletion();
      return true;

    case 'GET_TIMER_MEASUREMENTS':
      handleGetTimerMeasurements(sendResponse);
      return true;

    case 'CLEAR_TIMER_MEASUREMENTS':
      handleClearTimerMeasurements(sendResponse);
      return true;

    // Todo 관련 메시지
    case 'ADD_TODO':
      handleAddTodo(message, sendResponse);
      return true;

    case 'UPDATE_TODO':
      handleUpdateTodo(message, sendResponse);
      return true;

    case 'DELETE_TODO':
      handleDeleteTodo(message, sendResponse);
      return true;

    case 'SET_TODO_LIST':
      handleSetTodoList(message, sendResponse);
      return true;

    // 검색 제안 요청 처리
    case 'GET_SUGGESTIONS':
      handleGetSuggestions(message, sendResponse);
      return true;

    // 앱에서 명시적으로 새 탭 생성 허용 요청
    case 'ALLOW_NEW_TAB':
      handleAllowNewTab(sendResponse);
      return true;

    // 팝업이 열렸음을 알림: 다음 OneFocus 새 탭 허용 안함
    case 'POPUP_OPENED':
      sendResponse({ status: 'success' });
      return true;

    // 타이머 상태 요청
    case 'GET_TIMER_STATE':
      handleGetTimerState(sendResponse);
      return true;
  }
});

/**
 * 타이머 상태 요청 처리
 */
function handleGetTimerState(sendResponse) {
  sendResponse({
    state: timerState,
    status: 'success',
  });
}

/**
 * 타이머 업데이트 메시지 처리
 */
function handleTimerUpdate(message, sendResponse) {
  console.log('타이머 상태 업데이트됨:', message.state?.isRunning);

  const previousState = timerState;
  timerState = message.state;

  // 기존 인터벌 정리
  if (timerInterval) clearInterval(timerInterval);
  if (storageUpdateInterval) clearInterval(storageUpdateInterval);

  // 타이머가 실행 중이었다가 중지된 경우 측정 데이터 저장
  if (previousState?.isRunning && !timerState.isRunning) {
    saveTimerMeasurement(previousState);
  }

  if (timerState.isRunning) {
    // 타이머가 실행 중인 경우 인터벌 설정
    timerInterval = setInterval(updateTimer, 100);
    storageUpdateInterval = setInterval(saveToStorage, 10000);
    updateTimer();
  } else {
    // 타이머가 실행 중이 아닌 경우 상태 초기화
    clearTimerState();
  }

  sendResponse({ status: 'success' });
}

/**
 * 타이머 측정 데이터 요청 처리
 */
function handleGetTimerMeasurements(sendResponse) {
  chrome.storage.local.get([TIMER_MEASUREMENTS_KEY], (result) => {
    sendResponse({
      measurements: result[TIMER_MEASUREMENTS_KEY] || [],
      status: 'success',
    });
  });
  return true; // 비동기 sendResponse를 위해 true 반환
}

/**
 * 타이머 측정 데이터 초기화 처리
 */
function handleClearTimerMeasurements(sendResponse) {
  chrome.storage.local.remove(TIMER_MEASUREMENTS_KEY, () => {
    sendResponse({ status: 'success' });
  });
  return true; // 비동기 sendResponse를 위해 true 반환
}

/**
 * Todo 추가 처리
 */
function handleAddTodo(message, sendResponse) {
  chrome.storage.local.get([TODO_LIST_KEY], (result) => {
    const todoList = result[TODO_LIST_KEY] || [];
    todoList.push(message.todo);
    chrome.storage.local.set({ [TODO_LIST_KEY]: todoList }, () => {
      if (chrome.runtime.lastError) {
        console.error('Failed to add todo:', chrome.runtime.lastError);
        sendResponse({ status: 'error' });
      } else {
        sendResponse({ status: 'success' });
      }
    });
  });
}

/**
 * Todo 업데이트 처리
 */
function handleUpdateTodo(message, sendResponse) {
  chrome.storage.local.get([TODO_LIST_KEY], (result) => {
    let todoList = result[TODO_LIST_KEY] || [];
    const index = todoList.findIndex((todo) => todo.id === message.todo.id);
    if (index !== -1) {
      todoList[index] = message.todo;
      chrome.storage.local.set({ [TODO_LIST_KEY]: todoList }, () => {
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
}

/**
 * Todo 삭제 처리
 */
function handleDeleteTodo(message, sendResponse) {
  chrome.storage.local.get([TODO_LIST_KEY], (result) => {
    let todoList = result[TODO_LIST_KEY] || [];
    todoList = todoList.filter((todo) => todo.id !== message.id);
    chrome.storage.local.set({ [TODO_LIST_KEY]: todoList }, () => {
      if (chrome.runtime.lastError) {
        console.error('Failed to delete todo:', chrome.runtime.lastError);
        sendResponse({ status: 'error' });
      } else {
        sendResponse({ status: 'success' });
      }
    });
  });
}

/**
 * Todo 목록 설정 처리
 */
function handleSetTodoList(message, sendResponse) {
  chrome.storage.local.set({ [TODO_LIST_KEY]: message.todoList }, () => {
    if (chrome.runtime.lastError) {
      console.error('Failed to set todoList:', chrome.runtime.lastError);
      sendResponse({ status: 'error' });
    } else {
      sendResponse({ status: 'success' });
    }
  });
}

/**
 * 검색 제안 요청 처리
 */
function handleGetSuggestions(message, sendResponse) {
  fetch(`https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(message.query)}`)
    .then((response) => response.json())
    .then((data) => sendResponse({ suggestions: data[1] }))
    .catch((error) => sendResponse({ error: error.message }));
}

/**
 * 명시적으로 새 탭 생성 허용 처리
 * (타이머가 중지된 상태에서만 동작)
 */
async function handleAllowNewTab(sendResponse) {
  try {
    const extensionUrl = chrome.runtime.getURL('index.html');
    const existingTabs = await getOneFocusTabs();

    if (existingTabs.length > 0) {
      await chrome.tabs.update(existingTabs[0].id, { active: true, url: `${extensionUrl}` });
      const focused = await focusOrRestoreWindow(existingTabs[0].windowId);
      if (!focused) {
        await chrome.windows.create({ url: `${extensionUrl}`, focused: true, state: 'maximized', type: 'normal' });
      }
      sendResponse({ status: 'success', action: 'activated' });
      return;
    }

    const newTab = await chrome.tabs.create({ url: `${extensionUrl}`, active: true });
    const focused = await focusOrRestoreWindow(newTab.windowId);
    if (!focused) {
      await chrome.windows.create({ url: `${extensionUrl}`, focused: true, state: 'maximized', type: 'normal' });
    }
    sendResponse({ status: 'success', action: 'created' });
  } catch (error) {
    console.error('ALLOW_NEW_TAB 처리 중 오류:', error);
    sendResponse({ status: 'error' });
  }
}

// 확장 프로그램 시작 시 chrome.storage.local에서 타이머 상태 로드
async function initializeFromStorage() {
  try {
    console.log('스토리지에서 타이머 상태 초기화 시작');
    const storedState = await getFromStorage(TIMER_STATE_KEY);
    console.log('로드된 타이머 상태:', storedState);

    if (storedState) {
      timerState = storedState;

      if (timerState.isRunning) {
        console.log('실행 중인 타이머 상태 복원');
        // 타이머가 실행 중이던 경우 재개
        timerInterval = setInterval(updateTimer, 100);
        storageUpdateInterval = setInterval(saveToStorage, 10000);
        updateTimer();
      }
    }
  } catch (error) {
    console.error('타이머 상태 로드 오류:', error);
  }
}

// 초기화 실행
initializeFromStorage();

// 타이머 상태 감시 및 완료 알림 처리
function setupTimerTracking() {
  // 이전에 설정된 인터벌 제거
  if (timerCheckInterval) {
    clearInterval(timerCheckInterval);
  }

  // 1초마다 타이머 상태 확인 (더 정확한 완료 감지)
  timerCheckInterval = setInterval(async () => {
    try {
      // 현재 타이머 상태 가져오기
      const timerState = await new Promise((resolve) => {
        chrome.storage.local.get([TIMER_STATE_KEY], (result) => {
          resolve(result[TIMER_STATE_KEY] || null);
        });
      });

      if (timerState && timerState.isRunning && timerState.endTime) {
        const now = Date.now();

        // 타이머 완료 여부 확인
        if (now >= timerState.endTime) {
          console.log('타이머가 완료되었습니다.');

          // 타이머 완료 처리 함수 호출 (한 번만 실행)
          await handleTimerCompletion();

          // 추가 알림 및 포커스 강화
          await enhanceTimerCompletionNotification();
        }
      }
    } catch (error) {
      console.error('타이머 상태 확인 중 에러:', error);
    }
  }, 1000); // 1초마다 확인 (더 정확한 완료 감지)
}

// 타이머 완료 시 추가 알림 및 포커스 강화
async function enhanceTimerCompletionNotification() {
  try {
    // 시스템 알림 권한 확인 및 요청
    if (chrome.notifications && chrome.permissions) {
      const permissions = await chrome.permissions.getAll();
      if (!permissions.permissions.includes('notifications')) {
        await chrome.permissions.request({ permissions: ['notifications'] });
      }
    }

    // 모든 OneFocus 탭에 강제 포커스 시도
    const extensionUrl = chrome.runtime.getURL('index.html');
    const allTabs = await getOneFocusTabs();

    for (const tab of allTabs) {
      try {
        // 탭을 활성화하고 완료 페이지로 이동
        await chrome.tabs.update(tab.id, {
          active: true,
          url: `${extensionUrl}#/timer-completed`,
        });

        // 창을 최대화하고 포커스 (복원 포함)
        const focused = await focusOrRestoreWindow(tab.windowId);
        if (!focused) {
          await chrome.windows.create({
            url: `${extensionUrl}#/timer-completed`,
            focused: true,
            state: 'maximized',
            type: 'normal',
          });
        }

        console.log(`탭 ${tab.id} 강제 포커스 성공`);
        break; // 첫 번째 성공한 탭만 처리
      } catch (error) {
        console.error(`탭 ${tab.id} 포커스 실패:`, error);
      }
    }

    // 추가 알림 (더 강력한 시각적 효과)
    setTimeout(() => {
      chrome.notifications.create('timerCompletedFinal', {
        type: 'basic',
        iconUrl: 'extension-icons/icon128.png',
        title: '🎉 작업 완료!',
        message: '타이머가 완료되었습니다. 확인해보세요!',
        priority: 2,
        requireInteraction: true,
        silent: false,
      });
    }, 3000);
  } catch (error) {
    console.error('타이머 완료 알림 강화 중 오류:', error);
  }
}

// 확장 프로그램 설치/업데이트 시 초기화
chrome.runtime.onInstalled.addListener(() => {
  setupTimerTracking();
});

// 확장 프로그램이 비활성화될 때 타이머 중지
chrome.runtime.onSuspend.addListener(async () => {
  try {
    console.log('확장 프로그램이 비활성화되어 타이머를 중지합니다.');

    // 현재 타이머 상태 확인
    const currentState = await getFromStorage(TIMER_STATE_KEY);

    if (currentState?.isRunning) {
      // 타이머 상태 초기화
      clearTimerState();

      // 알림 제거
      chrome.notifications.clear('timerCompleted');
    }
  } catch (error) {
    console.error('확장 프로그램 비활성화 처리 중 오류:', error);
  }
});

// 브라우저 시작 시 초기화
chrome.runtime.onStartup.addListener(() => {
  setupTimerTracking();
});

// 탭 종료 시 타이머 중지 처리 - 사용자 확인 후에만 중지
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  try {
    // 현재 타이머 상태 확인
    const currentState = await getFromStorage(TIMER_STATE_KEY);

    if (currentState?.isRunning) {
      // OneFocus 탭이 남아있는지 확인
      const remainingTabs = await getOneFocusTabs();

      // OneFocus 탭이 더 이상 없으면 사용자에게 확인
      if (remainingTabs.length === 0) {
        console.log('모든 OneFocus 탭이 종료되었습니다. 사용자 확인을 기다립니다.');

        // 사용자가 명시적으로 탭을 닫은 경우에만 타이머 중지
        // 팝업이나 다른 창에서의 종료는 타이머를 유지
        if (removeInfo.isWindowClosing) {
          console.log('창이 닫혀서 타이머를 중지합니다.');
          clearTimerState();
          chrome.notifications.clear('timerCompleted');
        }
      }
    }
  } catch (error) {
    console.error('탭 종료 처리 중 오류:', error);
  }
});

// 창 종료 시 타이머 중지 처리 - 사용자 확인 후에만 중지
chrome.windows.onRemoved.addListener(async () => {
  try {
    // 현재 타이머 상태 확인
    const currentState = await getFromStorage(TIMER_STATE_KEY);

    if (currentState?.isRunning) {
      // OneFocus 탭이 남아있는지 확인
      const remainingTabs = await getOneFocusTabs();

      // OneFocus 탭이 더 이상 없으면 사용자에게 확인
      if (remainingTabs.length === 0) {
        console.log('모든 OneFocus 창이 종료되었습니다. 사용자 확인을 기다립니다.');

        // 사용자가 명시적으로 창을 닫은 경우에만 타이머 중지
        // 팝업이나 다른 창에서의 종료는 타이머를 유지
        console.log('창이 닫혀서 타이머를 중지합니다.');
        clearTimerState();
        chrome.notifications.clear('timerCompleted');
      }
    }
  } catch (error) {
    console.error('창 종료 처리 중 오류:', error);
  }
});

// 알림 클릭 이벤트 처리
chrome.notifications.onClicked.addListener(async (notificationId) => {
  if (notificationId === 'timerCompleted') {
    // 알림 제거
    chrome.notifications.clear(notificationId);

    // 기존 OneFocus 탭 활성화
    try {
      const extensionUrl = chrome.runtime.getURL('index.html');
      const tabs = await getOneFocusTabs();

      if (tabs.length > 0) {
        // 기존 OneFocus 탭 활성화
        await chrome.tabs.update(tabs[0].id, {
          active: true,
          url: `${extensionUrl}#/timer-completed`,
        });

        // 창을 포커스/복원
        const focused = await focusOrRestoreWindow(tabs[0].windowId);
        if (!focused) {
          await chrome.windows.create({
            url: `${extensionUrl}#/timer-completed`,
            focused: true,
            state: 'maximized',
            type: 'normal',
          });
        }

        // console.log('알림 클릭: OneFocus 탭이 활성화되었습니다.');
      } else {
        // 기존 탭이 없으면 새 탭 생성
        const newTab = await chrome.tabs.create({
          url: `${extensionUrl}#/timer-completed`,
          active: true,
        });

        // 새 창을 포커스/복원
        const focused = await focusOrRestoreWindow(newTab.windowId);
        if (!focused) {
          await chrome.windows.create({
            url: `${extensionUrl}#/timer-completed`,
            focused: true,
            state: 'maximized',
            type: 'normal',
          });
        }

        // console.log('알림 클릭: 새 OneFocus 탭이 생성되었습니다.');
      }
    } catch (error) {
      console.error('알림 클릭 처리 중 오류:', error);
    }
  }
});

// 알림 버튼 클릭 이벤트 처리
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  if (notificationId === 'timerCompleted' && buttonIndex === 0) {
    // 확인하기 버튼 클릭 시
    chrome.notifications.clear(notificationId);

    try {
      const extensionUrl = chrome.runtime.getURL('index.html');
      const tabs = await getOneFocusTabs();

      if (tabs.length > 0) {
        await chrome.tabs.update(tabs[0].id, {
          active: true,
          url: `${extensionUrl}#/timer-completed`,
        });

        // 창을 포커스/복원
        const focused = await focusOrRestoreWindow(tabs[0].windowId);
        if (!focused) {
          await chrome.windows.create({
            url: `${extensionUrl}#/timer-completed`,
            focused: true,
            state: 'maximized',
            type: 'normal',
          });
        }

        // console.log('알림 버튼 클릭: OneFocus 탭이 활성화되었습니다.');
      } else {
        // 기존 탭이 없으면 새 탭 생성
        const newTab = await chrome.tabs.create({
          url: `${extensionUrl}#/timer-completed`,
          active: true,
        });

        // 새 창을 포커스/복원
        const focused = await focusOrRestoreWindow(newTab.windowId);
        if (!focused) {
          await chrome.windows.create({
            url: `${extensionUrl}#/timer-completed`,
            focused: true,
            state: 'maximized',
            type: 'normal',
          });
        }

        // console.log('알림 버튼 클릭: 새 OneFocus 탭이 생성되었습니다.');
      }
    } catch (error) {
      console.error('알림 버튼 클릭 처리 중 오류:', error);
    }
  }
});

// 메시지 처리
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TIMER_UPDATE') {
    // 타이머 상태 업데이트 처리
    console.log('타이머 상태 업데이트:', message.state);

    // 상태가 변경될 때 탭에 메시지 전송
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        try {
          chrome.tabs
            .sendMessage(tab.id, {
              type: 'TIMER_UPDATE',
              state: message.state,
            })
            .catch(() => {
              // 일부 탭은 메시지를 받을 수 없을 수 있음 (오류 무시)
            });
        } catch (error) {
          // 탭이 메시지를 처리할 수 없는 경우 무시
          console.error('메시지 전송 오류:', error);
        }
      });
    });
  } else if (message.type === 'GET_TIMER_STATE') {
    // 타이머 상태 요청 처리
    chrome.storage.local.get([TIMER_STATE_KEY], (result) => {
      sendResponse({ state: result[TIMER_STATE_KEY] || null });
    });
    return true; // 비동기 응답을 위해 true 반환
  }
});
