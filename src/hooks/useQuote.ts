import { useState, useEffect, useCallback } from 'react';
import { kadvice, KadviceTagType } from 'kadvice';

interface Quote {
  text: string;
  author: string;
  occupation: string;
}

const QUOTE_STORAGE_KEY = 'dailyQuote';
const LAST_UPDATE_KEY = 'lastQuoteUpdate';

const getKoreanDateString = (): string => {
  const now = new Date();
  // 한국시간 (UTC+9)으로 변환
  const koreanTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return koreanTime.toISOString().split('T')[0]; // YYYY-MM-DD 형식
};

const getQuoteData = (tag: KadviceTagType | undefined): Quote => {
  const randomQuote = kadvice.getOne(tag);
  return {
    text: randomQuote.message,
    author: randomQuote.author,
    occupation: randomQuote.authorProfile || 'Unknown',
  };
};

const getStoredQuote = (): Quote | null => {
  try {
    const stored = localStorage.getItem(QUOTE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const setStoredQuote = (quote: Quote): void => {
  try {
    localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(quote));
    localStorage.setItem(LAST_UPDATE_KEY, getKoreanDateString());
  } catch {
    // localStorage 저장 실패 시 무시
  }
};

const shouldUpdateQuote = (): boolean => {
  try {
    const lastUpdate = localStorage.getItem(LAST_UPDATE_KEY);
    const today = getKoreanDateString();
    return !lastUpdate || lastUpdate !== today;
  } catch {
    return true;
  }
};

export function useQuote(tag: KadviceTagType | undefined) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuote = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);

      // 저장된 명언이 있고 오늘 업데이트된 것이라면 사용
      if (!shouldUpdateQuote()) {
        const storedQuote = getStoredQuote();
        if (storedQuote) {
          setQuote(storedQuote);
          setIsLoading(false);
          return;
        }
      }

      // 새로운 명언 가져오기
      const quoteData = getQuoteData(tag);
      setQuote(quoteData);
      setStoredQuote(quoteData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch quote'));
    } finally {
      setIsLoading(false);
    }
  }, [tag]);

  // 자정 체크를 위한 interval 설정
  useEffect(() => {
    const checkMidnight = () => {
      if (shouldUpdateQuote()) {
        fetchQuote();
      }
    };

    // 매분마다 자정 체크 (더 정확한 타이밍을 위해)
    const midnightCheckInterval = setInterval(checkMidnight, 60000);

    return () => clearInterval(midnightCheckInterval);
  }, [fetchQuote]);

  // 다른 탭에서 localStorage 변경 감지
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === QUOTE_STORAGE_KEY || e.key === LAST_UPDATE_KEY) {
        fetchQuote();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchQuote]);

  // 초기 로딩
  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  return { quote, isLoading, error };
}
