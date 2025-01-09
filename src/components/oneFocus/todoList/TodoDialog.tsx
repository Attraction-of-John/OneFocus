import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Todo } from '@/types/todo.interface';
import { useTodoStore } from '@/stores/useTodoStore';
import { Badge } from '@/components/ui/badge';
import { MdOutlineAddTask } from 'react-icons/md';
import { useForm } from 'react-hook-form';

const TodoDialog: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Omit<Todo, 'id' | 'completed' | 'order'>>({
    defaultValues: {
      text: '',
      allottedTime: 30,
      category: '일반',
      deadline: new Date().toISOString().split('T')[0],
    },
  });

  const { addTodoList } = useTodoStore();

  const onSubmit = (data: Omit<Todo, 'id' | 'completed' | 'order'>) => {
    addTodoList({ ...data, id: Date.now(), completed: false, order: 0 });
  };

  return (
    <div className="flex justify-end">
      <Dialog>
        <DialogTrigger asChild>
          <Badge className="flex items-center gap-2 text-sm font-semibold">
            <MdOutlineAddTask />
            Todo 추가
          </Badge>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>상세 할일 추가</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="todo-text" className="text-right">
                  할일
                </Label>
                <Input
                  id="todo-text"
                  {...register('text', { required: '할일을 입력해주세요.' })}
                  className="col-span-3"
                />
                {errors.text && <span className="text-red-500 text-sm">{errors.text.message}</span>}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="assigned-time" className="text-right">
                  할당 시간 (분)
                </Label>
                <Input
                  id="assigned-time"
                  type="number"
                  {...register('allottedTime', {
                    required: '할당 시간을 입력해주세요.',
                    min: { value: 1, message: '할당 시간은 0보다 커야 합니다.' },
                  })}
                  className="col-span-3"
                />
                {errors.allottedTime && <span className="text-red-500 text-sm">{errors.allottedTime.message}</span>}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  카테고리
                </Label>
                <Select {...register('category')} defaultValue="일반">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="일반">일반</SelectItem>
                    <SelectItem value="업무">업무</SelectItem>
                    <SelectItem value="개인">개인</SelectItem>
                    <SelectItem value="중요">중요</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <span className="text-red-500 text-sm">{errors.category.message}</span>}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  날짜
                </Label>
                <Input
                  id="date"
                  type="date"
                  {...register('deadline', {
                    required: '날짜를 선택해주세요.',
                    validate: (value) => (value && new Date(value) >= new Date()) || '과거 날짜는 선택할 수 없습니다.',
                  })}
                  className="col-span-3"
                />
                {errors.deadline && <span className="text-red-500 text-sm">{errors.deadline.message}</span>}
              </div>
            </div>
            <Button type="submit">추가</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TodoDialog;
