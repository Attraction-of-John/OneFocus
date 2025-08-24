import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { IoBookmarksOutline, IoClose, IoTrashOutline } from 'react-icons/io5';
import { useBookmarkStore } from '@/stores/useBookmarkStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const BookmarkIcon: React.FC<{ url: string; label?: string }> = ({ url, label }) => {
  const [failed, setFailed] = useState(false);
  const derivedLabel = (() => {
    if (label && label.trim().length > 0) return label.trim();
    try {
      const u = new URL(url);
      return u.hostname.replace('www.', '');
    } catch (_) {
      return url;
    }
  })();
  const initial = derivedLabel.charAt(0).toUpperCase();
  const faviconSrc = `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(url)}`;

  return (
    <div className="w-7 h-7 rounded-md bg-white/80 flex items-center justify-center overflow-hidden">
      {!failed ? (
        <img
          src={faviconSrc}
          alt={derivedLabel}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-xs font-semibold text-gray-700">{initial}</span>
      )}
    </div>
  );
};

const BookmarkWidget: React.FC = () => {
  const { bookmarks, addBookmark, removeBookmark, setChromeBarBookmarks } = useBookmarkStore();
  const [isOpen, setIsOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const recentBookmarks = useMemo(() => bookmarks.slice(-5).reverse(), [bookmarks]);

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.bookmarks?.getTree) return;
    chrome.bookmarks.getTree((nodes) => {
      try {
        const root = nodes?.[0];
        if (!root) return;
        const bar = (root.children || []).find(
          (n) => n.title === 'Bookmarks bar' || n.title === '북마크바' || n.title === '즐겨찾기 모음',
        );
        const barChildren = (bar?.children || []).filter((n) => (n as any).url);
        const firstFive = barChildren
          .slice(0, 5)
          .map((n, idx) => ({ id: -(idx + 1), url: (n as any).url as string, label: n.title }));
        if (firstFive.length > 0) setChromeBarBookmarks(firstFive);
      } catch (_) {
        // ignore
      }
    });
  }, [setChromeBarBookmarks]);

  const handleAdd = () => {
    const url = newUrl.trim();
    if (!url) return;
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      addBookmark({ url: parsed.toString(), label: newLabel.trim() || undefined });
      setNewUrl('');
      setNewLabel('');
    } catch (_) {
      // invalid
    }
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      <div className="bg-stone-100/60 backdrop-blur-lg rounded-2xl px-3 py-2 shadow-sm">
        <button
          aria-label="Bookmarks"
          className="p-2 rounded-full hover:bg-black/5 text-black"
          onClick={() => setIsOpen((v) => !v)}
        >
          {isOpen ? <IoClose className="w-5 h-5" /> : <IoBookmarksOutline className="w-5 h-5" />}
        </button>
      </div>
      {isOpen && (
        <div className="mt-2 w-[320px] bg-stone-100/70 backdrop-blur-lg rounded-2xl p-3 space-y-3 shadow">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">북마크</div>
            <Dialog>
              <DialogTrigger asChild>
                <button className="px-2 py-1 rounded-md text-xs font-medium bg-black text-white hover:bg-black/90">
                  추가
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>북마크 추가</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="https://example.com" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
                  <Input placeholder="라벨 (선택)" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
                  <div className="flex justify-end gap-2">
                    <button
                      className="px-3 py-2 rounded-md text-sm font-medium bg-black text-white hover:bg-black/90"
                      onClick={handleAdd}
                    >
                      추가
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex flex-col gap-2">
            {recentBookmarks.length === 0 ? (
              <div className="p-1 text-sm text-gray-600">저장된 북마크가 없습니다.</div>
            ) : (
              recentBookmarks.map((b) => (
                <div key={b.id} className="group flex items-center justify-between gap-2">
                  <a href={b.url} target="_blank" rel="noreferrer" title={b.url}>
                    <BookmarkIcon url={b.url} label={b.label} />
                  </a>
                  <button
                    aria-label="delete bookmark"
                    className="p-1 rounded hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeBookmark(b.id)}
                  >
                    <IoTrashOutline className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkWidget;
