export const formatTime = (minutes: number, language: string) => {
  if (!minutes) return '시간 설정';
  if (minutes < 60) return `${minutes}${language === 'en' ? 'm' : '분'}`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0
    ? `${hours}${language === 'en' ? 'h' : '시간'}   ${remainingMinutes}${language === 'en' ? 'm' : '분'}`
    : `${hours}${language === 'en' ? 'h' : '시간'}`;
};
