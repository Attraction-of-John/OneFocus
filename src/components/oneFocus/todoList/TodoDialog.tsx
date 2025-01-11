import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Todo } from '@/types/todo.interface';
import { useTodoStore } from '@/stores/useTodoStore';
import { Badge } from '@/components/ui/badge';
import { MdOutlineAddTask } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import FailDialog from './FailDialog';

interface TodoDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const TodoDialog: React.FC<TodoDialogProps> = ({ isOpen, setIsOpen }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Omit<Todo, 'id' | 'completed' | 'order'> & { customCategory?: string }>({
    defaultValues: {
      text: '',
      allottedTime: 30,
      category: '일반',
      deadline: new Date().toISOString().split('T')[0],
    },
  });

  const [newTodoDetails, setNewTodoDetails] = useState<
    Omit<Todo, 'id' | 'completed' | 'order'> & { customCategory?: string }
  >({
    text: '',
    allottedTime: 30,
    category: '일반',
    deadline: new Date().toISOString().split('T')[0],
  });

  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [isDeadlineEnabled, setIsDeadlineEnabled] = useState<boolean>(false);
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);

  const { addTodoList } = useTodoStore();

  const onSubmit = (data: Omit<Todo, 'id' | 'completed' | 'order'> & { customCategory?: string }) => {
    try {
      const category = data.category === '직접 작성' ? (data.customCategory ?? '') : (data.category ?? '');
      const todoData = {
        ...data,
        category,
        id: Date.now(),
        completed: false,
        order: 0,
        deadline: isDeadlineEnabled ? data.deadline : undefined,
      };
      addTodoList(todoData);
      setIsOpen(false);
    } catch {
      setShowErrorDialog(true);
    }
  };

  return (
    <div className="flex justify-end">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Badge className="flex items-center gap-2 text-sm font-semibold cursor-pointer transition-colors duration-200">
            <MdOutlineAddTask />
            Todo 추가
          </Badge>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] transition-transform duration-200">
          <DialogHeader>
            <DialogTitle>할일 추가</DialogTitle>
            <DialogDescription>새로운 할일을 추가하세요.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-start gap-4 pt-4">
                <Label htmlFor="todo-text" className="text-right mt-3">
                  할일
                </Label>
                <div className="col-span-3">
                  <Input
                    id="todo-text"
                    {...register('text', { required: '할일을 입력해주세요.' })}
                    className="w-full"
                  />
                  <span className="min-h-[1.25rem] text-red-500 p-1 text-sm">{errors.text?.message}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="assigned-time" className="text-right mt-3">
                  할당 시간 (분)
                </Label>
                <div className="col-span-3">
                  <Input
                    id="assigned-time"
                    type="number"
                    step={10}
                    {...register('allottedTime', {
                      required: '할당 시간을 입력해주세요.',
                      min: { value: 1, message: '할당 시간은 0보다 커야 합니다.' },
                    })}
                    className="w-full"
                  />
                  <span className="min-h-[1.25rem] text-red-500 p-1 text-sm">{errors.allottedTime?.message}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="category" className="text-right mt-3">
                  카테고리
                </Label>
                <div className="col-span-3">
                  {isCustomCategory ? (
                    <>
                      <Input
                        id="custom-category"
                        placeholder="카테고리를 입력하세요."
                        {...register('customCategory', { required: '카테고리를 입력해주세요.' })}
                        className="w-full"
                      />
                      <span className="min-h-[1.25rem] text-red-500 p-1 text-sm">{errors.customCategory?.message}</span>
                    </>
                  ) : (
                    <Select
                      value={newTodoDetails.category}
                      onValueChange={(value: string) => {
                        if (value === '직접 작성') {
                          setIsCustomCategory(true);
                        } else {
                          setNewTodoDetails({ ...newTodoDetails, category: value });
                        }
                      }}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="일반">일반</SelectItem>
                        <SelectItem value="업무">업무</SelectItem>
                        <SelectItem value="개인">개인</SelectItem>
                        <SelectItem value="중요">중요</SelectItem>
                        <SelectItem value="직접 작성">직접 작성</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <span className="min-h-[1.25rem] text-red-500 p-1 text-sm">{errors.category?.message}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="date" className="text-right flex items-center ml-10 mt-3 gap-2">
                  <Checkbox
                    id="enable-deadline"
                    checked={isDeadlineEnabled}
                    onCheckedChange={(checked) => setIsDeadlineEnabled(!!checked)}
                  />
                  마감일
                </Label>
                <div className="col-span-3">
                  <Input
                    id="date"
                    type="date"
                    disabled={!isDeadlineEnabled}
                    {...register('deadline', {
                      required: isDeadlineEnabled ? '날짜를 선택해주세요.' : false,
                      validate: (value) => {
                        if (!isDeadlineEnabled) return true;
                        const selectedDate = new Date(value ?? '');
                        const today = new Date();

                        selectedDate.setHours(0, 0, 0, 0);
                        today.setHours(0, 0, 0, 0);

                        return selectedDate >= today || '과거 날짜는 선택할 수 없습니다.';
                      },
                    })}
                    className="w-full"
                  />
                  <span className="col-span-4 min-h-[1.25rem] text-red-500 p-1 text-sm">
                    {errors.deadline?.message}
                  </span>
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full my-4">
              추가
            </Button>
          </form>
        </DialogContent>
        <FailDialog open={showErrorDialog} onOpenChange={setShowErrorDialog} />
      </Dialog>
    </div>
  );
};

export default TodoDialog;
