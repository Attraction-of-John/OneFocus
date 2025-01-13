import { kadvice } from 'kadvice';

export interface Quote {
  text: string;
  author: string;
  occupation: string;
}

export const getDailyQuote = async (category: 1 | 2 | 3 = 2): Promise<Quote> => {
  const quote = await kadvice.getOneByDaily(category);
  return {
    text: quote.message,
    author: quote.author,
    occupation: quote.authorProfile,
  };
};
