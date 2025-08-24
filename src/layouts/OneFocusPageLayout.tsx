import React from 'react';
import { useTimerStore } from '@/stores/useTimerStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

const OneFocusPageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isTimerMode, isRunning } = useTimerStore();
  const { background } = useSettingsStore();

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat fixed inset-0"
      style={{ backgroundImage: `url('${background.value}')` }}
    >
      <div
        className={`p-6 min-h-screen transition-all duration-700 ${
          isTimerMode && isRunning ? 'backdrop-blur-xl bg-black/40' : ''
        }`}
      >
        {/* Dark mode background dim overlay */}
        <div className="pointer-events-none fixed inset-0 bg-black/0 dark:bg-black/30" />
        <div className="max-w-3xl mx-auto space-y-2">{children}</div>
      </div>
    </div>
  );
};

export default OneFocusPageLayout;
