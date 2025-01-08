export const formatDateTime = () => {
  const now = new Date();
  const time = now.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });
  const date = now.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  return { time, date };
};
