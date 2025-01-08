import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Todo } from '@/types/todo.interface';
import { useTodoStore } from '@/stores/useTodoStore';

const TodoList: React.FC = () => {
  const { todoList, addTodoList, completeTodoList } = useTodoStore();
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim()) {
      const newTodoItem: Todo = {
        id: Date.now(),
        text: newTodo,
        completed: false,
        order: 0,
        allottedTime: 0,
        category: '일',
      };
      addTodoList(newTodoItem);
      setNewTodo('');
    }
  };

  return (
    <Card className="bg-stone-100/50 backdrop-blur-lg shadow-xl">
      <CardContent className="p-6">
        {/* Todo Input */}
        <div className="flex gap-2 mb-6">
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="새로운 할일을 입력하세요"
            className="bg-white/50"
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          />
          <Button onClick={addTodo} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Todo List */}
        <div className="space-y-2">
          {todoList.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-2 p-3 bg-white/50 rounded-full hover:bg-white/70 transition-colors"
            >
              <Button size="sm" variant="ghost" onClick={() => completeTodoList(todo.id)}>
                <Check className={`h-4 w-4 ${todo.completed ? 'text-green-500' : 'text-gray-400'}`} />
              </Button>
              <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}>{todo.text}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodoList;
