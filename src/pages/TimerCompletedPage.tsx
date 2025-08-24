import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OneFocusPageLayout from '@/layouts/OneFocusPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTimerStore } from '@/stores/useTimerStore';
import { useTodoStore } from '@/stores/useTodoStore';
import { formatTime } from '@/utils/timerUtils';
import { CheckCircle, Clock, Star, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TimerCompletedPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentTodo, setCurrentTodo, setTimerMode, resetTimer } = useTimerStore();
  const { updateTodoList } = useTodoStore();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // 3초 후 confetti 애니메이션 제거
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleMarkAsCompleted = () => {
    if (currentTodo) {
      // Todo를 완료로 표시
      updateTodoList(currentTodo.id, { completed: true });
    }

    // 타이머 상태 초기화
    setCurrentTodo(null);
    setTimerMode(false);
    resetTimer();

    // 메인 페이지로 이동
    navigate('/');
  };

  const handleContinueWithoutCompleting = () => {
    // Todo를 완료로 표시하지 않고 메인 페이지로 이동
    setCurrentTodo(null);
    setTimerMode(false);
    resetTimer();
    navigate('/');
  };

  console.log(currentTodo);

  return (
    <OneFocusPageLayout>
      {/* Confetti 애니메이션 */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                <Star
                  className="w-4 h-4 text-yellow-400"
                  style={{
                    transform: `rotate(${Math.random() * 360}deg)`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
        {/* 완료 메시지 카드 */}
        <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <div className="absolute inset-0 animate-ping">
                  <CheckCircle className="w-16 h-16 text-green-500 opacity-20" />
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">{t('timerCompleted.title')}</CardTitle>
            <p className="text-muted-foreground mt-2">{t('timerCompleted.description')}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 완료한 할일 정보 */}
            {currentTodo && (
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-muted-foreground">{t('timerCompleted.completedTask')}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{currentTodo.text}</span>
                    {currentTodo.category && (
                      <Badge variant="secondary" className="text-xs">
                        {currentTodo.category}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>
                      {t('timerCompleted.focusTimeDone', { time: formatTime(currentTodo.allottedTime * 60) })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 액션 버튼들 */}
            <div className="space-y-3">
              <Button
                onClick={handleMarkAsCompleted}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('timerCompleted.markAsCompleted')}
              </Button>

              <div className="grid grid-cols-1 gap-2">
                <Button
                  onClick={handleContinueWithoutCompleting}
                  variant="ghost"
                  className="w-full text-muted-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('timerCompleted.goBackWithoutCompleting')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 통계 정보 (선택사항) */}
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold">{t('timerCompleted.todayFocusTime')}</h3>
              <p className="text-2xl font-bold text-blue-600">
                {currentTodo ? formatTime(currentTodo.allottedTime * 60) : '00:00'}
              </p>
              <p className="text-sm text-muted-foreground">{t('timerCompleted.keepGoing')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </OneFocusPageLayout>
  );
};

export default TimerCompletedPage;
