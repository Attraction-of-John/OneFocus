import { useEffect } from 'react';
import { Pause, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTimer } from '@/utils/timerUtils';
import { useTimerStore } from '@/stores/useTimerStore';

const TimerContent: React.FC = () => {
  const {
    currentTodo,
    currentTime,
    isRunning,
    setCurrentTime,
    setIsRunning,
    setTimerStarted,
    setTimerMode,
    setCurrentTodo,
    resetTimer,
  } = useTimerStore();

  useEffect(() => {
    setTimerStarted(true);

    let interval: NodeJS.Timeout;
    if (isRunning && currentTime > 0) {
      interval = setInterval(() => {
        setCurrentTime(currentTime - 1);
      }, 1000);
    } else if (currentTime === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, currentTime, setCurrentTime, setIsRunning, setTimerStarted]);

  const handleStartPause = () => {
    if (!isRunning) {
      setTimerStarted(true);
    }
    setIsRunning(!isRunning);
  };

  const handleCancel = () => {
    resetTimer();
    setTimerMode(false);
    setCurrentTodo(null);
  };

  return (
    <>
      <CardHeader>
        <CardTitle>타이머</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-4">
        {currentTodo && (
          <div className="mb-6 text-center">
            <h3 className="text-xl font-semibold">{currentTodo.text}</h3>
            {currentTodo.category && <span className="text-sm text-gray-500 mt-1">{currentTodo.category}</span>}
          </div>
        )}
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-gray-200"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
            />
            <circle
              className="text-gray-400 transition-all"
              strokeWidth="10"
              strokeDasharray={283}
              strokeDashoffset={
                283 -
                (((currentTodo?.allottedTime || 60) * 60 - currentTime) / ((currentTodo?.allottedTime || 60) * 60)) *
                  283
              }
              strokeLinecap="butt"
              stroke="currentColor"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-4xl font-mono">{formatTimer(currentTime)}</div>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <Button onClick={handleStartPause} variant="outline" className="w-32">
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                일시정지
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                계속하기
              </>
            )}
          </Button>
          <Button onClick={handleCancel} variant="outline" className="w-32">
            <X className="h-4 w-4 mr-2" />
            타이머 취소
          </Button>
        </div>
      </CardContent>
    </>
  );
};

export default TimerContent;
