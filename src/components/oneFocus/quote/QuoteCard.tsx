import { Card, CardContent } from '@/components/ui/card';
import { useQuote } from '@/hooks/useQuote';
import { useTimerStore } from '@/stores/useTimerStore';

const QuoteCard: React.FC = () => {
  const { quote, isLoading, error } = useQuote(2);
  const { isTimerMode, isRunning } = useTimerStore();

  if (error) return <div>에러가 발생했습니다: {error.message}</div>;
  if (isLoading || !quote) return <div>로딩중...</div>;

  return (
    <Card className="bg-stone-100/50 backdrop-blur-lg shadow-xl h-[21vh]">
      <CardContent className="py-4 px-8 flex flex-col h-full">
        <h2
          className={`
          text-lg font-semibold transition-colors duration-700
          ${isTimerMode && isRunning ? 'text-white' : 'text-gray-700'}
        `}
        >
          오늘의 명언
        </h2>
        <blockquote className="flex flex-col justify-between flex-1">
          <p
            className={`
            text-lg text-center my-auto transition-colors duration-700
            ${isTimerMode && isRunning ? 'text-white' : 'text-gray-800'}
          `}
          >
            "{quote.text}"
          </p>
          <footer className="text-right">
            <cite
              className={`
              text-sm not-italic block transition-colors duration-700
              ${isTimerMode && isRunning ? 'text-gray-200' : 'text-gray-600'}
            `}
            >
              - {quote.author} -
            </cite>
            <p
              className={`
              text-xs transition-colors duration-700
              ${isTimerMode && isRunning ? 'text-gray-300' : 'text-gray-500'}
            `}
            >
              {quote.occupation}
            </p>
          </footer>
        </blockquote>
      </CardContent>
    </Card>
  );
};

export default QuoteCard;
