import OneFocusPageLayout from '@/layouts/OneFocusPageLayout';
import Header from '@/components/oneFocus/ui/Header';
import QuoteCard from '@/components/oneFocus/quote/QuoteCard';
import TodoList from '@/components/oneFocus/todoList/TodoList';

function OneFocusPage() {
  return (
    <OneFocusPageLayout>
      <Header />
      <QuoteCard />
      <TodoList />
    </OneFocusPageLayout>
  );
}

export default OneFocusPage;
