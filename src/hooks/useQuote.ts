import { useState, useEffect, useCallback } from 'react';
import { kadvice, KadviceTagType } from 'kadvice';

interface Quote {
  text: string;
  author: string;
  occupation: string;
}

const getQuoteData = (tag: KadviceTagType | undefined) => {
  const dailyQuote = kadvice.getOneByDaily(tag);
  return {
    text: dailyQuote.message,
    author: dailyQuote.author,
    occupation: dailyQuote.authorProfile || 'Unknown',
  };
};

export function useQuote(tag: KadviceTagType | undefined) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuote = useCallback(() => {
    try {
      setIsLoading(true);
      const quoteData = getQuoteData(tag);
      setQuote(quoteData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch quote'));
    } finally {
      setIsLoading(false);
    }
  }, [tag]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'count' || e.key === 'midNight') {
        fetchQuote();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchQuote]);

  useEffect(() => {
    fetchQuote();
    const interval = setInterval(fetchQuote, 5000);
    return () => clearInterval(interval);
  }, [fetchQuote]);

  return { quote, isLoading, error };
}
