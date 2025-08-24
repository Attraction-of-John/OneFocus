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
const BOOKMARKS_IMPORTED_KEY = 'bookmarksImported';

function persistBookmarks(bookmarks: BookmarkItem[]) {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return;
  try {
    const toSave = bookmarks.filter((b) => typeof b.id === 'number' && b.id > 0);
    chrome.storage.local.set({ [BOOKMARKS_KEY]: toSave });
  } catch (error) {
    // eslint-disable-next-line no-console
    // console.error('Storage set error (bookmarks):', error);
  }
}

export const useBookmarkStore = create<BookmarkState>()(
  subscribeWithSelector((set, get) => ({
    bookmarks: [],
    addBookmark: (item) => {
      const maxId = get().bookmarks.reduce((max, b) => Math.max(max, b.id), 0);
      const newItem: BookmarkItem = { id: maxId + 1, ...item };
      const updated = [...get().bookmarks, newItem];
      set({ bookmarks: updated });
      persistBookmarks(updated);
    },
    removeBookmark: (id) => {
      const updated = get().bookmarks.filter((b) => b.id !== id);
      set({ bookmarks: updated });
      persistBookmarks(updated);
    },
    setBookmarks: (items) => {
      set({ bookmarks: items });
      persistBookmarks(items);
    },
    setChromeBarBookmarks: (items) => {
      // 최초 1회만 크롬 북마크바를 import하여 영구 저장
      if (typeof chrome === 'undefined' || !chrome.storage?.local) return;

      chrome.storage.local.get([BOOKMARKS_IMPORTED_KEY], (res) => {
        const alreadyImported = Boolean(res[BOOKMARKS_IMPORTED_KEY]);
        if (alreadyImported) return; // 재유입 방지

        const existing = get().bookmarks;
        const existingUrls = new Set(existing.map((b) => b.url));

        const toImport = items.filter((i) => i.url && !existingUrls.has(i.url));
        if (toImport.length === 0) {
          chrome.storage.local.set({ [BOOKMARKS_IMPORTED_KEY]: true });
          return;
        }

        const startId = existing.reduce((max, b) => Math.max(max, b.id), 0);
        const imported: BookmarkItem[] = toImport.map((i, idx) => ({
          id: startId + idx + 1,
          url: i.url,
          label: i.label,
        }));

        const merged = [...existing, ...imported];
        set({ bookmarks: merged });
        persistBookmarks(merged);
        chrome.storage.local.set({ [BOOKMARKS_IMPORTED_KEY]: true });
      });
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
    // 상태 변경 시에도 동기화 보장
    persistBookmarks(bookmarks);
  },
  { equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
);
