import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { BookmarkItem } from '@/types/bookmark.interface';

interface BookmarkState {
  bookmarks: BookmarkItem[];
  addBookmark: (item: Omit<BookmarkItem, 'id'>) => void;
  removeBookmark: (id: number) => void;
  setBookmarks: (items: BookmarkItem[]) => void;
  setChromeBarBookmarks: (items: BookmarkItem[]) => void;
}

const BOOKMARKS_KEY = 'bookmarks';

export const useBookmarkStore = create<BookmarkState>()(
  subscribeWithSelector((set, get) => ({
    bookmarks: [],
    addBookmark: (item) => {
      const maxId = get().bookmarks.reduce((max, b) => Math.max(max, b.id), 0);
      const newItem: BookmarkItem = { id: maxId + 1, ...item };
      const updated = [...get().bookmarks, newItem];
      set({ bookmarks: updated });
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ type: 'ADD_BOOKMARK', bookmark: newItem });
      }
    },
    removeBookmark: (id) => {
      const updated = get().bookmarks.filter((b) => b.id !== id);
      set({ bookmarks: updated });
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ type: 'DELETE_BOOKMARK', id });
      }
    },
    setBookmarks: (items) => {
      set({ bookmarks: items });
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ type: 'SET_BOOKMARKS', bookmarks: items });
      }
    },
    setChromeBarBookmarks: (items) => {
      const existing = get().bookmarks;
      const chromeSet = items.filter((i) => !existing.some((e) => e.url === i.url));
      const merged = [...chromeSet, ...existing];
      set({ bookmarks: merged });
    },
  })),
);

// Initial load from chrome.storage.local if available
if (typeof chrome !== 'undefined' && chrome.storage?.local) {
  const loadBookmarks = async () => {
    try {
      const result = await new Promise<{ [BOOKMARKS_KEY]: BookmarkItem[] }>((resolve, reject) => {
        chrome.storage.local.get([BOOKMARKS_KEY], (res) => {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
          else resolve(res as { [BOOKMARKS_KEY]: BookmarkItem[] });
        });
      });
      useBookmarkStore.getState().setBookmarks(result[BOOKMARKS_KEY] || []);
    } catch (error) {
      console.error('Storage get error (bookmarks):', error);
    }
  };

  loadBookmarks();
}

// Broadcast on change to background if needed
useBookmarkStore.subscribe(
  (state) => state.bookmarks,
  (bookmarks) => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'UPDATE_BOOKMARKS', bookmarks });
    }
  },
  { equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
);
