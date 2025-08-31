import { useState, useEffect, useCallback } from 'react';
import { kadvice, KadviceTagType } from 'kadvice';
import { useSettingsStore } from '@/stores/useSettingsStore';
import englishQuotes from '@/assets/english-quotes.json';

interface Quote {
  text: string;
  author: string;
  occupation?: string;
}

const QUOTE_STORAGE_KEY_KO = 'dailyQuote_ko';
const LAST_UPDATE_KEY_KO = 'lastQuoteUpdate_ko';
const QUOTE_STORAGE_KEY_EN = 'dailyQuote_en';
const LAST_UPDATE_KEY_EN = 'lastQuoteUpdate_en';

const getTodayDateKey = (isEnglish: boolean): string => {
  const now = new Date();
  // 영어는 로컬 타임존, 한국어는 KST(Asia/Seoul) 기준으로 날짜 키 생성
  if (isEnglish) {
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
  }

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
};

const getKoreanQuote = (tag: KadviceTagType | undefined): Quote => {
  const randomQuote = kadvice.getOne(tag);
  return {
    text: randomQuote.message,
    author: randomQuote.author,
    occupation: randomQuote.authorProfile || undefined,
  };
};

const fetchEnglishQuote = async (): Promise<Quote> => {
  // Use local bundled JSON to avoid network dependency
  const list = englishQuotes as Array<{ text: string; author?: string }>;
  const random = list[Math.floor(Math.random() * list.length)];
  return { text: random.text, author: random.author ?? 'Unknown' };
};

const getStoredQuote = (isEnglish: boolean): Quote | null => {
  try {
    const stored = localStorage.getItem(isEnglish ? QUOTE_STORAGE_KEY_EN : QUOTE_STORAGE_KEY_KO);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const setStoredQuote = (quote: Quote, isEnglish: boolean): void => {
  try {
    localStorage.setItem(isEnglish ? QUOTE_STORAGE_KEY_EN : QUOTE_STORAGE_KEY_KO, JSON.stringify(quote));
    localStorage.setItem(isEnglish ? LAST_UPDATE_KEY_EN : LAST_UPDATE_KEY_KO, getTodayDateKey(isEnglish));
  } catch {
    // localStorage 저장 실패 시 무시
  }
};

const shouldUpdateQuote = (isEnglish: boolean): boolean => {
  try {
    const lastUpdate = localStorage.getItem(isEnglish ? LAST_UPDATE_KEY_EN : LAST_UPDATE_KEY_KO);
    const today = getTodayDateKey(isEnglish);
    return !lastUpdate || lastUpdate !== today;
  } catch {
    return true;
  }
};

export function useQuote(tag: KadviceTagType | undefined) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const language = useSettingsStore((s) => s.language);

  const fetchQuote = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const isEnglish = language === 'en';

      if (!shouldUpdateQuote(isEnglish)) {
        const storedQuote = getStoredQuote(isEnglish);
        if (storedQuote) {
          setQuote(storedQuote);
          setIsLoading(false);
          return;
        }
      }

      const quoteData = isEnglish ? await fetchEnglishQuote() : getKoreanQuote(tag);
      setQuote(quoteData);
      setStoredQuote(quoteData, isEnglish);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch quote'));
    } finally {
      setIsLoading(false);
    }
  }, [tag, language]);

  // 자정 체크를 위한 interval 설정
  useEffect(() => {
    const checkMidnight = () => {
      if (shouldUpdateQuote(language === 'en')) {
        void fetchQuote();
      }
    };

    const midnightCheckInterval = setInterval(checkMidnight, 60000);

    return () => clearInterval(midnightCheckInterval);
  }, [fetchQuote, language]);

  // 다른 탭에서 localStorage 변경 감지
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      const keys = [QUOTE_STORAGE_KEY_KO, LAST_UPDATE_KEY_KO, QUOTE_STORAGE_KEY_EN, LAST_UPDATE_KEY_EN];
      if (e.key && keys.includes(e.key)) {
        void fetchQuote();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchQuote]);

  // 초기 로딩
  useEffect(() => {
    void fetchQuote();
  }, [fetchQuote]);

  return { quote, isLoading, error };
}
