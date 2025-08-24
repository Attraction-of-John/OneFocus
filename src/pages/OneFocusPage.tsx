import OneFocusPageLayout from '@/layouts/OneFocusPageLayout';
import Header from '@/components/oneFocus/ui/Header';
import BookmarkWidget from '@/components/oneFocus/ui/BookmarkWidget';
import QuoteCard from '@/components/oneFocus/quote/QuoteCard';
import TodoList from '@/components/oneFocus/todoList/TodoList';

function OneFocusPage() {
  return (
    <OneFocusPageLayout>
      <BookmarkWidget />
      <Header />
      <QuoteCard />
      <TodoList />
    </OneFocusPageLayout>
  );
}

export default OneFocusPage;
