import { create } from 'zustand';
import { Todo } from '@/types/todo.interface';
import { subscribeWithSelector } from 'zustand/middleware';
import { saveToStorage, loadFromStorage } from '@/utils/storageUtils';

const TODO_STORAGE_KEY = 'todoList';

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
    },
    updateTodoList: (id, updates) => {
      const updatedList = get().todoList.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo));
      set({ todoList: updatedList });
    },
    deleteTodoList: (id) => {
      const updatedList = get().todoList.filter((todo) => todo.id !== id);
      set({ todoList: updatedList });
    },
    setTodoList: (todoList) => {
      set({ todoList });
    },
  })),
);

// todo 목록 로딩 함수
const loadTodoList = () => {
  const todoList = loadFromStorage<Todo[]>(TODO_STORAGE_KEY, []);
  useTodoStore.getState().setTodoList(todoList);
};

// todoList 상태가 변경될 때마다 로컬 스토리지에 저장
// subscribe 자체는 상태 구독 함수이며, 여기서 콜백으로 saveToStorage를 호출하고 있음
useTodoStore.subscribe(
  (state) => state.todoList, // 구독할 상태 선택자(selector)
  (todoList) => {
    // 상태가 변경될 때 실행할 콜백 함수
    saveToStorage(TODO_STORAGE_KEY, todoList); // 실제 로컬 스토리지 저장 로직
  },
);

loadTodoList();
