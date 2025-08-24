import OneFocusPageLayout from '@/layouts/OneFocusPageLayout';
import Header from '@/components/oneFocus/ui/Header';
import BookmarkWidget from '@/components/oneFocus/ui/BookmarkWidget';
import QuoteCard from '@/components/oneFocus/quote/QuoteCard';
import TodoList from '@/components/oneFocus/todoList/TodoList';
import SettingsButton from '@/components/oneFocus/ui/SettingsButton';

function OneFocusPage() {
  return (
    <OneFocusPageLayout>
      <BookmarkWidget />
      <SettingsButton />
      <Header />
      <QuoteCard />
      <TodoList />
    </OneFocusPageLayout>
  );
}

export default OneFocusPage;
