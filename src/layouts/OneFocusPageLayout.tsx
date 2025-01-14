import React from 'react';
import { useTimerStore } from '@/stores/useTimerStore';

const OneFocusPageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isTimerMode, isRunning } = useTimerStore();

  return (
    <div className="min-h-screen w-full bg-[url('/assets/background-imgs/houses.jpg')] bg-cover bg-center bg-no-repeat fixed inset-0">
      <div
        className={`p-6 min-h-screen transition-all duration-700 ${
          isTimerMode && isRunning ? 'backdrop-blur-xl bg-black/40' : ''
        }`}
      >
        <div className="max-w-3xl mx-auto space-y-2">{children}</div>
      </div>
    </div>
  );
};

export default OneFocusPageLayout;
