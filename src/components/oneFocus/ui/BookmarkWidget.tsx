import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { IoAddOutline, IoBookmarksOutline, IoClose, IoTrashOutline } from 'react-icons/io5';
import { useBookmarkStore } from '@/stores/useBookmarkStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    <div className="w-8 h-8 rounded-md bg-white/80 flex items-center justify-center overflow-hidden">
      {!failed ? (
        <img
          src={faviconSrc}
          alt={derivedLabel}
          className="max-w-full max-h-full object-contain"
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
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const recentBookmarks = useMemo(() => bookmarks.slice(), [bookmarks]);
  const closeTimerRef = useRef<number | null>(null);

  const cancelClose = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = (id: number) => {
    cancelClose();
    closeTimerRef.current = window.setTimeout(() => {
      setHoveredId((prev) => (prev === id ? null : prev));
      closeTimerRef.current = null;
    }, 150);
  };

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
      <div className="relative inline-flex  justify-center bg-stone-100/60 backdrop-blur-lg rounded-2xl px-3 py-2 shadow-sm">
        <button
          aria-label="Bookmarks"
          className="p-2 rounded-full hover:bg-black/5 text-black"
          onClick={() => setIsOpen((v) => !v)}
        >
          {isOpen ? <IoClose className="w-5 h-5" /> : <IoBookmarksOutline className="w-5 h-5" />}
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full mt-2 items-center justify-center w-full h-[calc(100vh-6rem)] max-h-[calc(100vh-6rem)] origin-top-left of-animate-bounce-in bg-stone-100/70 backdrop-blur-lg rounded-2xl p-3 shadow flex flex-col gap-3 overflow-hidden">
            <Dialog>
              <DialogTrigger asChild>
                <button className="mx-auto flex h-8 w-8 items-center mb-2 justify-center rounded-md bg-black text-white hover:bg-black/90">
                  <IoAddOutline className="w-4 h-4" />
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
            <ScrollArea className="flex-1 min-h-0">
              <div className="flex flex-col items-center justify-center  mx-3.5 gap-2">
                {recentBookmarks.length === 0 ? (
                  <div className="p-1 text-sm text-gray-600">저장된 북마크가 없습니다.</div>
                ) : (
                  recentBookmarks.map((b) => (
                    <Popover key={b.id} open={hoveredId === b.id}>
                      <PopoverTrigger asChild>
                        <div
                          className="group of-bm-row relative flex items-center gap-2 w-full"
                          onMouseEnter={() => {
                            cancelClose();
                            setHoveredId(b.id);
                          }}
                          onMouseLeave={() => scheduleClose(b.id)}
                        >
                          <a href={b.url} target="_blank" rel="noreferrer" title={b.url}>
                            <BookmarkIcon url={b.url} label={b.label} />
                          </a>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        side="right"
                        align="center"
                        sideOffset={8}
                        className="p-1 w-auto"
                        onMouseEnter={() => {
                          cancelClose();
                          setHoveredId(b.id);
                        }}
                        onMouseLeave={() => scheduleClose(b.id)}
                      >
                        <button
                          aria-label="delete bookmark"
                          className="p-1 rounded bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white"
                          onClick={() => removeBookmark(b.id)}
                        >
                          <IoTrashOutline className="w-4 h-4" />
                        </button>
                      </PopoverContent>
                    </Popover>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
      <style>{`
        @keyframes of-bounce-in {
          0% { opacity: 0; transform: translateY(8px) scale(0.98); }
          60% { opacity: 1; transform: translateY(-4px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .of-animate-bounce-in { animation: of-bounce-in 420ms cubic-bezier(0.34, 1.56, 0.64, 1); }

        @keyframes of-float-top {
          0% { top: 50%; }
          50% { top: calc(50% - 2px); }
          100% { top: 50%; }
        }
        .of-bm-row:hover .of-delete { animation: of-float-top 2400ms ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default BookmarkWidget;
