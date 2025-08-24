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
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores/useSettingsStore';

interface TodoDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  disabled?: boolean;
}

const TodoDialog: React.FC<TodoDialogProps> = ({ isOpen, setIsOpen, disabled }) => {
  const { t } = useTranslation();
  const { language } = useSettingsStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Omit<Todo, 'id' | 'completed' | 'order'> & { customCategory?: string }>({
    defaultValues: {
      text: '',
      allottedTime: 30,
      category: t('tododialog.optionGeneral'),
      deadline: new Date().toISOString().split('T')[0],
    },
  });

  const [newTodoDetails, setNewTodoDetails] = useState<
    Omit<Todo, 'id' | 'completed' | 'order'> & { customCategory?: string }
  >({
    text: '',
    allottedTime: 30,
    category: t('tododialog.optionGeneral'),
    deadline: new Date().toISOString().split('T')[0],
  });

  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [isDeadlineEnabled, setIsDeadlineEnabled] = useState<boolean>(false);
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);

  const { addTodoList } = useTodoStore();

  const onSubmit = (data: Omit<Todo, 'id' | 'completed' | 'order'> & { customCategory?: string }) => {
    try {
      const category =
        data.category === t('tododialog.optionCustom') ? (data.customCategory ?? '') : (data.category ?? '');
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
        <DialogTrigger asChild disabled={disabled}>
          <Badge
            className={`flex items-center gap-2 text-sm font-semibold cursor-pointer transition-colors duration-200 my-1
              ${disabled ? 'opacity-0 cursor-not-allowed pointer-events-none' : ''}`}
          >
            <MdOutlineAddTask />
            {t('tododialog.open')}
          </Badge>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] transition-transform duration-200">
          <DialogHeader>
            <DialogTitle>{t('tododialog.title')}</DialogTitle>
            <DialogDescription>{t('tododialog.description')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-start gap-4 pt-4">
                <Label htmlFor="todo-text" className="text-right mt-3">
                  {t('tododialog.labelText')}
                </Label>
                <div className="col-span-3">
                  <Input
                    id="todo-text"
                    {...register('text', { required: t('tododialog.errTextRequired') })}
                    className="w-full"
                  />
                  <span className="min-h-[1.25rem] text-red-500 p-1 text-sm">{errors.text?.message}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="assigned-time" className="text-right mt-3">
                  {t('tododialog.labelAllottedTime')}
                </Label>
                <div className="col-span-3">
                  <Input
                    id="assigned-time"
                    type="number"
                    step={10}
                    {...register('allottedTime', {
                      required: t('tododialog.errAllottedTimeRequired'),
                      min: { value: 1, message: t('tododialog.errAllottedTimeMin') },
                    })}
                    className="w-full"
                  />
                  <span className="min-h-[1.25rem] text-red-500 p-1 text-sm">{errors.allottedTime?.message}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="category" className="text-right mt-3">
                  {t('tododialog.labelCategory')}
                </Label>
                <div className="col-span-3">
                  {isCustomCategory ? (
                    <>
                      <Input
                        id="custom-category"
                        placeholder={t('tododialog.placeholderCategory')}
                        {...register('customCategory', { required: t('tododialog.errCategoryRequired') })}
                        className="w-full"
                      />
                      <span className="min-h-[1.25rem] text-red-500 p-1 text-sm">{errors.customCategory?.message}</span>
                    </>
                  ) : (
                    <Select
                      value={watch('category')}
                      onValueChange={(value: string) => {
                        if (value === t('tododialog.optionCustom')) {
                          setIsCustomCategory(true);
                          setValue('category', value);
                          setNewTodoDetails({ ...newTodoDetails, category: value });
                          return;
                        }
                        setValue('category', value);
                        setNewTodoDetails({ ...newTodoDetails, category: value });
                      }}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder={t('tododialog.selectCategory')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={t('tododialog.optionGeneral')}>{t('tododialog.optionGeneral')}</SelectItem>
                        <SelectItem value={t('tododialog.optionWork')}>{t('tododialog.optionWork')}</SelectItem>
                        <SelectItem value={t('tododialog.optionPersonal')}>{t('tododialog.optionPersonal')}</SelectItem>
                        <SelectItem value={t('tododialog.optionImportant')}>
                          {t('tododialog.optionImportant')}
                        </SelectItem>
                        <SelectItem value={t('tododialog.optionCustom')}>{t('tododialog.optionCustom')}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <span className="min-h-[1.25rem] text-red-500 p-1 text-sm">{errors.category?.message}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label
                  htmlFor="date"
                  className={`text-right flex items-center ${language === 'en' ? 'ml-6' : 'ml-10'} mt-3 gap-2`}
                >
                  <Checkbox
                    id="enable-deadline"
                    checked={isDeadlineEnabled}
                    onCheckedChange={(checked) => setIsDeadlineEnabled(!!checked)}
                  />
                  {t('tododialog.labelDeadline')}
                </Label>
                <div className="col-span-3">
                  <Input
                    id="date"
                    type="date"
                    disabled={!isDeadlineEnabled}
                    {...register('deadline', {
                      required: isDeadlineEnabled ? (t('tododialog.errDeadlineRequired') as string) : false,
                      validate: (value) => {
                        if (!isDeadlineEnabled) return true;
                        const selectedDate = new Date(value ?? '');
                        const today = new Date();

                        selectedDate.setHours(0, 0, 0, 0);
                        today.setHours(0, 0, 0, 0);

                        return selectedDate >= today || (t('tododialog.errDeadlinePast') as string);
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
              {t('tododialog.submit')}
            </Button>
          </form>
        </DialogContent>
        <FailDialog open={showErrorDialog} onOpenChange={setShowErrorDialog} />
      </Dialog>
    </div>
  );
};

export default TodoDialog;
