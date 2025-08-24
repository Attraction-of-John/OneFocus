import { Card, CardContent } from '@/components/ui/card';
import { useQuote } from '@/hooks/useQuote';
import { useTimerStore } from '@/stores/useTimerStore';
import { useTranslation } from 'react-i18next';

const QuoteCard: React.FC = () => {
  const { quote, isLoading, error } = useQuote(2);
  const { isTimerMode, isRunning } = useTimerStore();
  const { t } = useTranslation();

  if (error)
    return (
      <div>
        {t('common.errorPrefix')}
        {error.message}
      </div>
    );
  if (isLoading || !quote) return <div>{t('common.loading')}</div>;

  return (
    <Card className="bg-card/50 backdrop-blur-lg shadow-xl h-[21vh]">
      <CardContent className="py-4 px-8 flex flex-col h-full">
        <h2
          className={`
          text-lg font-semibold transition-colors duration-700
          ${isTimerMode && isRunning ? 'text-foreground' : 'text-foreground'}
        `}
        >
          {t('quote.title')}
        </h2>
        <blockquote className="flex flex-col justify-between flex-1">
          <p
            className={`
            text-lg text-center my-auto transition-colors duration-700
            ${isTimerMode && isRunning ? 'text-foreground' : 'text-foreground'}
          `}
          >
            "{quote.text}"
          </p>
          <footer className="text-right">
            <cite
              className={`
              text-sm not-italic block transition-colors duration-700
              ${isTimerMode && isRunning ? 'text-muted-foreground' : 'text-muted-foreground'}
            `}
            >
              - {quote.author} -
            </cite>
            <p
              className={`
              text-xs transition-colors duration-700
              ${isTimerMode && isRunning ? 'text-muted-foreground' : 'text-muted-foreground'}
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
