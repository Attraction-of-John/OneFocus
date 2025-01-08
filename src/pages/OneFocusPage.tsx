import TimerCard from '@/components/oneFocus/timer/TimerCard';
import OneFocusPageLayout from '@/layouts/OneFocusPageLayout';
import Header from '@/components/oneFocus/ui/Header';
import TodoList from '@/components/oneFocus/todoList/TodoList';

function OneFocusPage() {
  return (
    <OneFocusPageLayout>
      <Header />
      <TodoList />
      <TimerCard />
    </OneFocusPageLayout>
  );
}

export default OneFocusPage;
