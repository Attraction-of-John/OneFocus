import { useState, useEffect } from 'react';
import { Clock, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatTimer } from '@/utils/timerUtils';

const TimerCard: React.FC = () => {
  const [time, setTime] = useState(3600);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const resetTimer = () => {
    setTime(0);
    setIsRunning(false);
  };

  return (
    <Card className="bg-stone-100/50 backdrop-blur-lg shadow-xl p-6">
      <CardContent className="flex flex-col items-center justify-center">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full" viewBox="0 0 100 100">
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
              className="text-gray-400"
              strokeWidth="10"
              strokeDasharray={283}
              strokeDashoffset={283 - (283 * (time % 3600)) / 3600}
              strokeLinecap="butt"
              stroke="currentColor"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-4xl font-mono">{formatTimer(time)}</div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={() => setIsRunning(!isRunning)} variant="outline" className="w-32">
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                일시정지
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" />
                시작하기
              </>
            )}
          </Button>
          <Button onClick={resetTimer} variant="outline" className="w-32">
            초기화
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimerCard;
