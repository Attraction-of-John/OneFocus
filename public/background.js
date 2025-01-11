/* global chrome */

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
  }
});
