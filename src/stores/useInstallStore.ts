import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface InstallState {
  hasSeenInstallGuide: boolean;
  setHasSeenInstallGuide: (seen: boolean) => void;
  shouldShowInstallGuide: () => boolean;
}

export const useInstallStore = create<InstallState>()(
  persist(
    (set, get) => ({
      hasSeenInstallGuide: false,

      setHasSeenInstallGuide: (seen: boolean) => {
        set({ hasSeenInstallGuide: seen });
      },

      shouldShowInstallGuide: () => {
        const { hasSeenInstallGuide } = get();
        return !hasSeenInstallGuide;
      },
    }),
    {
      name: 'one-focus-install-storage',
      version: 1,
    },
  ),
);
