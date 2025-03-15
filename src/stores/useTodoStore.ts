import { create } from 'zustand';
import { Todo } from '@/types/todo.interface';
import { subscribeWithSelector } from 'zustand/middleware';

interface TodoState {
  todoList: Todo[];
  addTodoList: (todo: Todo) => void;
  updateTodoList: (id: number, updates: Partial<Todo>) => void;
  deleteTodoList: (id: number) => void;
  setTodoList: (todos: Todo[]) => void;
}

export const useTodoStore = create<TodoState>()(
  subscribeWithSelector((set, get) => ({
    todoList: [],
    addTodoList: (todo) => {
      const maxOrder = get().todoList.reduce((max, t) => Math.max(max, t.order), 0);
      const newTodo = { ...todo, order: maxOrder + 1 };
      const updatedList = [...get().todoList, newTodo];
      set({ todoList: updatedList });
      chrome.runtime.sendMessage({ type: 'ADD_TODO', todo: newTodo });
    },
    updateTodoList: (id, updates) => {
      const updatedList = get().todoList.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo));
      set({ todoList: updatedList });
      const updatedTodo = updatedList.find((todo) => todo.id === id);
      if (updatedTodo) {
        chrome.runtime.sendMessage({ type: 'UPDATE_TODO', todo: updatedTodo });
      }
    },
    deleteTodoList: (id) => {
      const updatedList = get().todoList.filter((todo) => todo.id !== id);
      set({ todoList: updatedList });
      chrome.runtime.sendMessage({ type: 'DELETE_TODO', id });
    },
    setTodoList: (todoList) => {
      set({ todoList });
      chrome.runtime.sendMessage({ type: 'SET_TODO_LIST', todoList });
    },
  })),
);

if (typeof chrome !== 'undefined' && chrome.storage?.local) {
  const loadTodoList = async () => {
    try {
      const result = await new Promise<{ todoList: Todo[] }>((resolve, reject) => {
        chrome.storage.local.get(['todoList'], (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result as { todoList: Todo[] });
          }
        });
      });
      useTodoStore.getState().setTodoList(result.todoList || []);
    } catch (error) {
      console.error('Storage get error:', error);
    }
  };

  loadTodoList();
}

useTodoStore.subscribe(
  (state) => state.todoList,
  (todoList) => {
    chrome.runtime.sendMessage({ type: 'UPDATE_TODO_LIST', todoList });
  },
  { equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
);
