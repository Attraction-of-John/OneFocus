import OneFocusPageLayout from '@/layouts/OneFocusPageLayout';
import Header from '@/components/oneFocus/ui/Header';
import QuoteCard from '@/components/oneFocus/quote/QuoteCard';
import TodoList from '@/components/oneFocus/todoList/TodoList';
import TimerCard from '@/components/oneFocus/timer/TimerCard';

function OneFocusPage() {
  return (
    <OneFocusPageLayout>
      <Header />
      <QuoteCard />
      <TodoList />
      <TimerCard />
    </OneFocusPageLayout>
  );
}

export default OneFocusPage;
