import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import TodoDialog from './TodoDialog';
import TodoListItem from './TodoItem';
import TimerContent from '../timer/TimerContent';
import { useTodoStore } from '@/stores/useTodoStore';
import { useTimerStore } from '@/stores/useTimerStore';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MdOutlineAddTask } from 'react-icons/md';
import { useState } from 'react';

const TodoList: React.FC = () => {
  const { todoList, setTodoList } = useTodoStore();
  const { isTimerMode } = useTimerStore();
  const [isOpen, setIsOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = todoList.findIndex((todo) => todo.id.toString() === active.id);
      const newIndex = todoList.findIndex((todo) => todo.id.toString() === over?.id);
      const newTodoList = arrayMove(todoList, oldIndex, newIndex).map((todo, index) => ({
        ...todo,
        order: index + 1,
      }));
      setTodoList(newTodoList);
    }
  };

  return (
    <>
      <TodoDialog isOpen={isOpen} setIsOpen={setIsOpen} disabled={isTimerMode} />
      <Card className="bg-stone-100/50 backdrop-blur-lg shadow-xl h-[53vh]">
        {isTimerMode ? (
          <div className="animate-fade-in">
            <TimerContent />
          </div>
        ) : (
          <div>
            <CardHeader>
              <CardTitle>TodoList</CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              {/* Todo List */}
              <ScrollArea className="h-[38vh] rounded-md p-3">
                {todoList.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-center mb-4 max-w-[80%] text-base text-gray-500">
                      할 일이 없습니다. 새로운 할 일을 추가하려면 아래의 "Todo 추가" 버튼을 클릭하세요.
                    </p>
                    <button
                      onClick={() => setIsOpen(true)}
                      className="flex items-center gap-2 mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                      <MdOutlineAddTask />
                      Todo 추가
                    </button>
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext
                      items={todoList.map((todo) => todo.id.toString())}
                      strategy={verticalListSortingStrategy}
                    >
                      {todoList.map((todo) => (
                        <TodoListItem key={todo.id} todo={todo} />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </ScrollArea>
            </CardContent>
          </div>
        )}
      </Card>
    </>
  );
};

export default TodoList;
