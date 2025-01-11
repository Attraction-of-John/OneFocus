import { Play, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Todo } from '@/types/todo.interface';
import { useTodoStore } from '@/stores/useTodoStore';
import { MdDragIndicator } from 'react-icons/md';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { formatTime } from '@/utils/todoUtils';

interface TodoListItemProps {
  todo: Todo;
}

const TodoItem: React.FC<TodoListItemProps> = ({ todo }) => {
  const { updateTodoList, deleteTodoList } = useTodoStore();
  const [isEditing, setIsEditing] = useState({
    text: false,
    category: false,
    deadline: false,
    allottedTime: false,
  });
  const [editedTodo, setEditedTodo] = useState(todo);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id.toString() as UniqueIdentifier,
  });

  const style = {
    transform: transform
      ? CSS.Transform.toString({
          ...transform,
          x: 0,
        })
      : undefined,
    transition,
    zIndex: isDragging ? 1000 : 'auto',
    backgroundColor: isDragging ? 'rgba(59,130,246, 0.1)' : 'inherit',
  };

  const handleFieldClick = (field: keyof typeof isEditing) => {
    setIsEditing((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (field: keyof Todo, value: any) => {
    setEditedTodo((prev) => ({ ...prev, [field]: value }));
    updateTodoList(todo.id, { [field]: value });
  };

  const handleBlur = (field: keyof typeof isEditing) => {
    setIsEditing((prev) => ({ ...prev, [field]: false }));
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="group flex items-center gap-4 rounded-2xl p-2 hover:bg-stone-100/30 transition-all">
        <span {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-500">
          <MdDragIndicator size={20} />
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => updateTodoList(todo.id, { completed: !todo.completed })}
          className="shrink-0 h-6 w-6 rounded-full p-0.5 hover:bg-stone-100/20 relative"
        >
          {todo.completed ? (
            <Check className="h-4 w-4 text-primary" />
          ) : (
            <div className="h-4 w-4 rounded-full border-[1.5px] border-stone-500" />
          )}
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isEditing.text ? (
              <input
                type="text"
                value={editedTodo.text}
                onChange={(e) => handleChange('text', e.target.value)}
                onBlur={() => handleBlur('text')}
                autoFocus
                className="flex h-8 w-48 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            ) : (
              <span
                className={`text-lg ${todo.completed ? 'line-through text-gray-500' : ''}`}
                onClick={() => handleFieldClick('text')}
              >
                {todo.text}
              </span>
            )}
            {isEditing.category ? (
              <input
                type="text"
                value={editedTodo.category || ''}
                onChange={(e) => handleChange('category', e.target.value)}
                onBlur={() => handleBlur('category')}
                autoFocus
                className="flex h-7 w-24 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            ) : (
              <Badge
                variant="secondary"
                className="text-xs cursor-pointer"
                onClick={() => handleFieldClick('category')}
              >
                {todo.category || '없음'}
              </Badge>
            )}
            {isEditing.deadline ? (
              <input
                type="date"
                value={todo.deadline ? new Date(todo.deadline).toISOString().substr(0, 10) : ''}
                onChange={(e) => handleChange('deadline', e.target.value)}
                onBlur={() => handleBlur('deadline')}
                autoFocus
                className=" flex h-7 w-30 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            ) : (
              todo.deadline && (
                <Badge
                  variant="outline"
                  className="text-xs cursor-pointer"
                  onClick={() => handleFieldClick('deadline')}
                >
                  {new Date(todo.deadline).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Badge>
              )
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing.allottedTime ? (
            <input
              type="number"
              step={10}
              value={editedTodo.allottedTime || ''}
              onChange={(e) => handleChange('allottedTime', Number(e.target.value))}
              onBlur={() => handleBlur('allottedTime')}
              autoFocus
              className="flex h-7 w-14 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          ) : (
            <span
              className="text-sm text-gray-500 tabular-nums cursor-pointer"
              onClick={() => handleFieldClick('allottedTime')}
            >
              {formatTime(todo.allottedTime)}
            </span>
          )}
          <Button size="sm" variant="ghost" onClick={() => console.log('click')} className="shrink-0">
            <Play className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => deleteTodoList(todo.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
      <div className="border-b border-stone-500/70 mx-3" />
    </div>
  );
};

export default TodoItem;
