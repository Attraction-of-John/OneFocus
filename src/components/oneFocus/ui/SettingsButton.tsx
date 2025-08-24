import { useState, useRef } from 'react';
import { IoSettingsOutline, IoClose } from 'react-icons/io5';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSettingsStore, SupportedLanguage, ThemeMode } from '@/stores/useSettingsStore';
import { useTranslation } from 'react-i18next';
// no input in this dialog now; presets are used instead

const builtinBackgrounds = [
  '/assets/background-imgs/avenue.jpg',
  '/assets/background-imgs/houses.jpg',
  '/assets/background-imgs/mountain.jpg',
  '/assets/background-imgs/path.jpg',
  '/assets/background-imgs/railroad.jpg',
  '/assets/background-imgs/rocks.jpg',
  '/assets/background-imgs/sunset.jpg',
  '/assets/background-imgs/the-fog.jpg',
  '/assets/background-imgs/trees.jpg',
  '/assets/background-imgs/water.jpg',
] as const;

const TABS = ['language', 'theme', 'background', 'datetime'] as const;

type TabKey = (typeof TABS)[number];

export default function SettingsButton() {
  const { t, i18n } = useTranslation();
  const {
    language,
    theme,
    background,
    dateFormat,
    timeFormat,
    setLanguage,
    setTheme,
    setBackground,
    setDateFormat,
    setTimeFormat,
  } = useSettingsStore();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<TabKey>('language');
  const fileRef = useRef<HTMLInputElement>(null);

  const datePresets = ['yyyy.MM.dd', 'MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd'] as const;
  const timePresets = ['HH:mm', 'HH:mm:ss', 'h:mm a'] as const;

  const handleUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setBackground({ type: 'custom', value: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-card/60 backdrop-blur-lg rounded-2xl px-3 py-2 shadow-sm">
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (v) setActive('language');
          }}
        >
          <DialogTrigger asChild>
            <button aria-label="Settings" className="p-2 rounded-full hover:bg-accent text-foreground">
              {open ? <IoClose className="w-5 h-5" /> : <IoSettingsOutline className="w-5 h-5" />}
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('settings.title')}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-[160px_1fr] gap-6">
              <nav className="border-r pr-4">
                <ul className="space-y-1">
                  {TABS.map((key) => (
                    <li key={key}>
                      <button
                        className={`w-full text-left px-3 py-2 rounded-md text-sm border ${
                          active === key
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card text-foreground hover:bg-accent border-border'
                        }`}
                        onClick={() => setActive(key)}
                      >
                        {t(`settings.${key}`)}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              <section className="min-h-[260px]">
                {active === 'language' && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium mb-2">{t('settings.language')}</h4>
                    <div className="flex gap-2">
                      {(['ko', 'en'] as SupportedLanguage[]).map((lng) => (
                        <button
                          key={lng}
                          onClick={() => {
                            setLanguage(lng);
                            void i18n.changeLanguage(lng);
                          }}
                          className={`px-3 py-1 rounded-md text-sm border ${
                            language === lng
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card text-foreground hover:bg-accent border-border'
                          }`}
                        >
                          {lng.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {active === 'theme' && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium mb-2">{t('settings.theme')}</h4>
                    <div className="flex gap-2">
                      {(['light', 'dark'] as ThemeMode[]).map((m) => (
                        <button
                          key={m}
                          onClick={() => setTheme(m)}
                          className={`px-3 py-1 rounded-md text-sm border ${
                            theme === m
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card text-foreground hover:bg-accent border-border'
                          }`}
                        >
                          {t(`settings.${m}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {active === 'background' && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium mb-2">{t('settings.background')}</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {builtinBackgrounds.map((src) => (
                        <button
                          key={src}
                          className={`relative h-16 rounded-md overflow-hidden ring-2 ${
                            background.type === 'builtin' && background.value === src
                              ? 'ring-primary'
                              : 'ring-transparent hover:ring-ring'
                          }`}
                          onClick={() => setBackground({ type: 'builtin', value: src })}
                        >
                          <img src={src} alt={src} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files && e.target.files[0] && handleUpload(e.target.files[0])}
                      />
                      <button
                        className="px-3 py-1 rounded-md text-sm border bg-card text-foreground hover:bg-accent border-border"
                        onClick={() => fileRef.current?.click()}
                      >
                        {t('settings.upload')}
                      </button>
                      {background.type === 'custom' && (
                        <button
                          className="px-3 py-1 rounded-md text-sm border bg-card text-foreground hover:bg-accent border-border"
                          onClick={() => setBackground({ type: 'builtin', value: builtinBackgrounds[1] })}
                        >
                          {t('settings.reset')}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {active === 'datetime' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">{t('settings.datetime')}</h4>
                    <div>
                      <div className="text-xs text-gray-600 mb-2 flex items-center gap-2">
                        <span>{t('settings.dateFormat')}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {t('settings.presets')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {datePresets.map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => setDateFormat(fmt)}
                            className={`px-2 py-1 rounded-md text-sm border ${
                              dateFormat === fmt
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-black hover:bg-black/10'
                            }`}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-2 flex items-center gap-2">
                        <span>{t('settings.timeFormat')}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {t('settings.presets')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {timePresets.map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => setTimeFormat(fmt)}
                            className={`px-2 py-1 rounded-md text-sm border ${
                              timeFormat === fmt
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-black hover:bg-black/10'
                            }`}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
