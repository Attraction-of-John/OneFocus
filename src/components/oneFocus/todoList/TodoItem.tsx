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
import { useTimerStore } from '@/stores/useTimerStore';

// 편집 가능한 필드 타입
type EditableFields = {
  text: boolean;
  category: boolean;
  deadline: boolean;
  allottedTime: boolean;
};

interface TodoListItemProps {
  todo: Todo;
}

/**
 * Todo 항목 컴포넌트
 * - 드래그 앤 드롭 정렬 가능
 * - 각 필드 인라인 편집 가능
 * - 타이머 시작 기능
 */
const TodoItem: React.FC<TodoListItemProps> = ({ todo }) => {
  // Todo 및 타이머 스토어 액션
  const { updateTodoList, deleteTodoList } = useTodoStore();
  const { setTimerMode, setCurrentTodo, setIsRunning } = useTimerStore();

  // 편집 상태 관리
  const [isEditing, setIsEditing] = useState<EditableFields>({
    text: false,
    category: false,
    deadline: false,
    allottedTime: false,
  });

  // 편집 중인 Todo 데이터
  const [editedTodo, setEditedTodo] = useState<Todo>(todo);

  // dnd-kit 정렬 기능
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id.toString() as UniqueIdentifier,
  });

  // 드래그 시 스타일
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

  /**
   * 필드 클릭 시 편집 모드 활성화
   */
  const handleFieldClick = (field: keyof EditableFields) => {
    setIsEditing((prev) => ({ ...prev, [field]: true }));
  };

  /**
   * 필드 값 변경 처리
   */
  const handleChange = (field: keyof Todo, value: any) => {
    setEditedTodo((prev) => ({ ...prev, [field]: value }));
    updateTodoList(todo.id, { [field]: value });
  };

  /**
   * 편집 종료 처리
   */
  const handleBlur = (field: keyof EditableFields) => {
    setIsEditing((prev) => ({ ...prev, [field]: false }));
  };

  /**
   * 타이머 시작 처리
   */
  const handlePlayClick = () => {
    setCurrentTodo(todo);
    setTimerMode(true);
    setIsRunning(true);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="group flex items-center gap-4 rounded-2xl p-2 hover:bg-stone-100/30 transition-all">
        {/* 드래그 핸들 */}
        <span {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-500">
          <MdDragIndicator size={20} />
        </span>

        {/* 완료 체크박스 */}
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

        {/* Todo 내용 영역 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* Todo 텍스트 - 편집 가능 */}
            {isEditing.text ? (
              <input
                type="text"
                value={editedTodo.text}
                onChange={(e) => handleChange('text', e.target.value)}
                onBlur={() => handleBlur('text')}
                autoFocus
                className="flex h-8 w-48 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            ) : (
              <span
                className={`text-lg ${todo.completed ? 'line-through text-gray-500' : ''}`}
                onClick={() => handleFieldClick('text')}
              >
                {todo.text}
              </span>
            )}

            {/* 카테고리 - 편집 가능 */}
            {isEditing.category ? (
              <input
                type="text"
                value={editedTodo.category || ''}
                onChange={(e) => handleChange('category', e.target.value)}
                onBlur={() => handleBlur('category')}
                autoFocus
                className="flex h-7 w-24 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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

            {/* 마감일 - 편집 가능 */}
            {isEditing.deadline ? (
              <input
                type="date"
                value={todo.deadline ? new Date(todo.deadline).toISOString().substring(0, 10) : ''}
                onChange={(e) => handleChange('deadline', e.target.value)}
                onBlur={() => handleBlur('deadline')}
                autoFocus
                className="flex h-7 w-30 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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

        {/* 할당 시간 및 작업 버튼 */}
        <div className="flex items-center gap-2">
          {/* 할당 시간 - 편집 가능 */}
          {isEditing.allottedTime ? (
            <input
              type="number"
              step={10}
              value={editedTodo.allottedTime || ''}
              onChange={(e) => handleChange('allottedTime', Number(e.target.value))}
              onBlur={() => handleBlur('allottedTime')}
              autoFocus
              className="flex h-7 w-14 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          ) : (
            <span
              className="text-sm text-gray-500 tabular-nums cursor-pointer"
              onClick={() => handleFieldClick('allottedTime')}
            >
              {formatTime(todo.allottedTime)}
            </span>
          )}

          {/* 타이머 시작 버튼 - 완료되지 않은 항목만 */}
          {!todo.completed && (
            <Button size="sm" variant="ghost" onClick={handlePlayClick} className="shrink-0">
              <Play className="h-4 w-4" />
            </Button>
          )}

          {/* 삭제 버튼 - 호버 시 표시 */}
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
      {/* 구분선 */}
      <div className="border-b border-stone-500/70 mx-3" />
    </div>
  );
};

export default TodoItem;
