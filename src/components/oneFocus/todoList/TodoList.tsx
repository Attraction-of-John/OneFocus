import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import TodoDialog from './TodoDialog';
import TodoListItem from './TodoItem';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const TodoList: React.FC = () => {
  const testTodo1 = {
    order: 1,
    completed: true,
    id: 1,
    text: '테스트1',
    allottedTime: 30,
    category: '일반',
    deadline: new Date().toISOString().split('T')[0],
  };

  const testTodo2 = {
    order: 2,
    completed: false,
    id: 2,
    text: '테스트2',
    allottedTime: 30,
    category: '일반',
    deadline: new Date().toISOString().split('T')[0],
  };

  const testTodo3 = {
    order: 3,
    completed: false,
    id: 3,
    text: '테스트3',
    allottedTime: 30,
    category: '일반',
    deadline: new Date().toISOString().split('T')[0],
  };

  // 테스트 Todo를 상태로 관리
  const [testTodos, setTestTodos] = useState([testTodo1, testTodo2, testTodo3]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTestTodos((items) => {
        const oldIndex = items.findIndex((item) => item.id.toString() === active.id);
        const newIndex = items.findIndex((item) => item.id.toString() === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <>
      <TodoDialog />
      <Card className="bg-stone-100/50 backdrop-blur-lg shadow-xl h-[500px]">
        <CardHeader>
          <CardTitle>TodoList</CardTitle>
        </CardHeader>
        <CardContent className="px-6">
          {/* Todo List */}
          <ScrollArea className="h-96 rounded-md p-3">
            {/* TODO 임시 코드 */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={testTodos.map((todo) => todo.id.toString())}
                strategy={verticalListSortingStrategy}
              >
                {testTodos.map((todo) => (
                  <TodoListItem key={todo.id} todo={todo} />
                ))}
                {testTodos.map((todo) => (
                  <TodoListItem key={todo.id} todo={todo} />
                ))}
                {testTodos.map((todo) => (
                  <TodoListItem key={todo.id} todo={todo} />
                ))}
              </SortableContext>
            </DndContext>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  );
};

export default TodoList;
