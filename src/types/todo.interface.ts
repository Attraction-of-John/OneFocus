export interface Todo {
  id: number;
  deadline?: string;
  completed: boolean;
  order: number;
  text: string;
  category: string;
  allottedTime: number;
}
