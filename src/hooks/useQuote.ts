import { useState, useEffect } from 'react';
import { getDailyQuote, Quote } from '@/utils/quoteUtils';

export const useQuote = (category: 1 | 2 | 3) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const newQuote = await getDailyQuote(category);
        setQuote(newQuote);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('명언을 가져오는데 실패했습니다.'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuote();
  }, [category]);

  return { quote, isLoading, error };
};
