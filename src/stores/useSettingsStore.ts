import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import i18n from '@/i18n';

export type SupportedLanguage = 'ko' | 'en';
export type ThemeMode = 'light' | 'dark';
export type BackgroundType = 'builtin' | 'custom';

export interface BackgroundSetting {
  type: BackgroundType;
  value: string; // builtin: relative path under /assets/background-imgs, custom: data URL
}

interface SettingsState {
  language: SupportedLanguage;
  theme: ThemeMode;
  background: BackgroundSetting;
  dateFormat: string; // e.g., 'yyyy.MM.dd', 'MM/dd/yyyy'
  timeFormat: string; // e.g., 'HH:mm', 'h:mm a'

  setLanguage: (lang: SupportedLanguage) => void;
  setTheme: (mode: ThemeMode) => void;
  setBackground: (bg: BackgroundSetting) => void;
  setDateFormat: (format: string) => void;
  setTimeFormat: (format: string) => void;
}

const SETTINGS_KEY = 'onefocus_settings_v1';

function getInitialLanguage(): SupportedLanguage {
  try {
    const nav = navigator?.language?.toLowerCase();
    if (nav?.startsWith('ko')) return 'ko';
    return 'en';
  } catch {
    return 'en';
  }
}

const defaultState: Omit<
  SettingsState,
  'setLanguage' | 'setTheme' | 'setBackground' | 'setDateFormat' | 'setTimeFormat'
> = {
  language: getInitialLanguage(),
  theme: 'light',
  background: { type: 'builtin', value: '/assets/background-imgs/houses.jpg' },
  dateFormat: 'yyyy.MM.dd',
  timeFormat: 'HH:mm',
};

function persistState(state: Partial<SettingsState>) {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local && chrome.runtime?.id) {
      chrome.storage.local.get([SETTINGS_KEY], (res) => {
        const prev = (res?.[SETTINGS_KEY] || {}) as Partial<SettingsState>;
        chrome.storage.local.set({ [SETTINGS_KEY]: { ...prev, ...state } });
      });
    } else {
      const prevRaw = localStorage.getItem(SETTINGS_KEY);
      const prev = prevRaw ? (JSON.parse(prevRaw) as Partial<SettingsState>) : {};
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...prev, ...state }));
    }
  } catch {
    // ignore storage errors
  }
}

export const useSettingsStore = create<SettingsState>()(
  subscribeWithSelector((set) => ({
    ...defaultState,

    setLanguage: (language) => {
      set({ language });
      persistState({ language });
      try {
        void i18n.changeLanguage(language);
      } catch {
        // ignore
      }
    },
    setTheme: (theme) => {
      set({ theme });
      persistState({ theme });
      try {
        const root = document.documentElement;
        if (theme === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
      } catch {
        // ignore DOM errors (SSR / extension contexts)
      }
    },
    setBackground: (background) => {
      set({ background });
      persistState({ background });
    },
    setDateFormat: (dateFormat) => {
      set({ dateFormat });
      persistState({ dateFormat });
    },
    setTimeFormat: (timeFormat) => {
      set({ timeFormat });
      persistState({ timeFormat });
    },
  })),
);

// Initial load from storage
(() => {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local && chrome.runtime?.id) {
      chrome.storage.local.get([SETTINGS_KEY], (res) => {
        const saved = res?.[SETTINGS_KEY] as Partial<SettingsState> | undefined;
        if (saved) useSettingsStore.setState(saved as any);
        // Apply theme class once on load
        const theme = (saved?.theme ?? defaultState.theme) as ThemeMode;
        const root = document.documentElement;
        if (theme === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
        // Apply language to i18n on load
        const lang = (saved?.language ?? defaultState.language) as SupportedLanguage;
        try {
          void i18n.changeLanguage(lang);
        } catch {
          // ignore
        }
      });
    } else {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SettingsState>;
        useSettingsStore.setState(saved as any);
        const theme = (saved.theme ?? defaultState.theme) as ThemeMode;
        const root = document.documentElement;
        if (theme === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
        const lang = (saved.language ?? defaultState.language) as SupportedLanguage;
        try {
          void i18n.changeLanguage(lang);
        } catch {
          // ignore
        }
      } else {
        // ensure theme is applied once from defaults
        const root = document.documentElement;
        if (defaultState.theme === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
        try {
          void i18n.changeLanguage(defaultState.language);
        } catch {
          // ignore
        }
      }
    }
  } catch {
    // ignore
  }
})();
