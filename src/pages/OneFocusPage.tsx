import { useEffect, useState } from 'react';
import OneFocusPageLayout from '@/layouts/OneFocusPageLayout';
import Header from '@/components/oneFocus/ui/Header';
import BookmarkWidget from '@/components/oneFocus/ui/BookmarkWidget';
import QuoteCard from '@/components/oneFocus/quote/QuoteCard';
import TodoList from '@/components/oneFocus/todoList/TodoList';
import SettingsButton from '@/components/oneFocus/ui/SettingsButton';
import InstallGuideDialog from '@/components/oneFocus/ui/InstallGuideDialog';
import { useInstallStore } from '@/stores/useInstallStore';

function OneFocusPage() {
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const { shouldShowInstallGuide, setHasSeenInstallGuide } = useInstallStore();

  useEffect(() => {
    // 컴포넌트가 마운트된 후 설치 가이드 표시 여부 확인
    const timer = setTimeout(() => {
      if (shouldShowInstallGuide()) {
        setShowInstallGuide(true);
      }
    }, 1000); // 1초 후에 표시하여 페이지 로딩 완료 후 표시

    return () => clearTimeout(timer);
  }, [shouldShowInstallGuide]);

  const handleInstallGuideClose = (open: boolean) => {
    setShowInstallGuide(open);
    if (!open) {
      // 다이얼로그를 닫을 때 설치 가이드를 본 것으로 표시
      setHasSeenInstallGuide(true);
    }
  };

  return (
    <OneFocusPageLayout>
      <BookmarkWidget />
      <SettingsButton />
      <Header />
      <QuoteCard />
      <TodoList />

      {/* 설치 안내 다이얼로그 */}
      <InstallGuideDialog open={showInstallGuide} onOpenChange={handleInstallGuideClose} />
    </OneFocusPageLayout>
  );
}

export default OneFocusPage;
