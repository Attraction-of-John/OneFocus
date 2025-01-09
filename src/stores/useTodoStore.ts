import { create } from 'zustand';
import { Todo } from '@/types/todo.interface';

interface TodoState {
  todoList: Todo[];
  addTodoList: (todo: Todo) => void;
  updateTodoList: (id: number, updates: Partial<Todo>) => void;
  deleteTodoList: (id: number) => void;
  setTodoList: (todos: Todo[]) => void;
}

export const useTodoStore = create<TodoState>((set) => ({
  todoList: [],
  addTodoList: (todo) => {
    set((state) => {
      const updatedList = [...state.todoList, todo];
      chrome.runtime.sendMessage({ type: 'UPDATE_TODO_LIST', todoList: updatedList });
      return { todoList: updatedList };
    });
  },
  updateTodoList: (id, updates) => {
    const updatedList = useTodoStore
      .getState()
      .todoList.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo));
    set({ todoList: updatedList });
    chrome.runtime.sendMessage({ type: 'UPDATE_TODO_LIST', todoList: updatedList });
  },
  deleteTodoList: (id) => {
    const updatedList = useTodoStore.getState().todoList.filter((todo) => todo.id !== id);
    set({ todoList: updatedList });
    chrome.runtime.sendMessage({ type: 'UPDATE_TODO_LIST', todoList: updatedList });
  },
  setTodoList: (todoList) => set({ todoList }),
}));

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
