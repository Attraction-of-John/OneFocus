import { format } from 'date-fns';
import { useSettingsStore } from '@/stores/useSettingsStore';

export const formatDateTime = () => {
  const now = new Date();
  // NOTE: This function can be called in non-react places; read current settings directly from store
  const { dateFormat, timeFormat, language } = useSettingsStore.getState();

  try {
    const time = format(now, timeFormat || 'HH:mm');
    const date = format(now, dateFormat || 'yyyy.MM.dd');
    return { time, date };
  } catch {
    const locale = language === 'ko' ? 'ko-KR' : 'en-US';
    const time = now.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
    const date = now.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
    return { time, date };
  }
};
