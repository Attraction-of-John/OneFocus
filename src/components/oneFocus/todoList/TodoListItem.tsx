import { Play, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Todo } from '@/types/todo.interface';
import { useTodoStore } from '@/stores/useTodoStore';
import { MdDragIndicator } from 'react-icons/md';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TodoListItemProps {
  todo: Todo;
}

const TodoListItem: React.FC<TodoListItemProps> = ({ todo }) => {
  const { updateTodoList, deleteTodoList } = useTodoStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 'auto',
    backgroundColor: isDragging ? 'rgba(59,130,246, 0.1)' : 'inherit',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="group flex items-center gap-4 rounded-2xl p-2 hover:bg-stone-100/30 transition-all">
        {/* 드래그 핸들을 위한 span에 listeners 적용 */}
        <span className="cursor-grab active:cursor-grabbing text-gray-500">
          <MdDragIndicator />
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
            <span className={`font-medium ${todo.completed ? 'line-through text-gray-500' : ''}`}>{todo.text}</span>
            <div className="flex gap-1">
              {todo.category && (
                <Badge variant="secondary" className="text-xs">
                  {todo.category}
                </Badge>
              )}
              {todo.deadline && (
                <Badge variant="outline" className="text-xs">
                  {new Date(todo.deadline).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {todo.allottedTime && <span className="text-sm text-gray-500 tabular-nums">{todo.allottedTime}분</span>}
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

export default TodoListItem;
