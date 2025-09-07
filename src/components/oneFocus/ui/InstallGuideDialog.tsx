import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { Star, ExternalLink } from 'lucide-react';

interface InstallGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InstallGuideDialog: React.FC<InstallGuideDialogProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation();

  const handleGitHubStar = () => {
    window.open('https://github.com/Attraction-of-John/OneFocus', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-y-auto p-8"
        style={{
          maxWidth: '95vw',
          maxHeight: '95vh',
          width: '95vw',
          height: '95vh',
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Star className="h-6 w-6 text-yellow-500 fill-current" />
            {t('installGuide.title')}
          </DialogTitle>
          <DialogDescription className="text-base">{t('installGuide.subtitle')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 가로 레이아웃: 이미지와 텍스트를 나란히 배치 */}
          <div className="flex flex-col xl:flex-row gap-8">
            {/* 권한 허락 안내 이미지 */}
            <div className="flex-1 flex justify-center xl:justify-start">
              <div className="relative w-full max-w-lg">
                <img
                  src="/assets/chrome-permission-dialog.png"
                  alt={t('installGuide.imageAlt')}
                  className="max-w-full h-auto rounded-lg shadow-lg"
                  onError={(e) => {
                    // 이미지가 없을 경우 대체 UI 표시
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-64 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-300 dark:border-blue-600">
                          <div class="text-center p-6">
                            <div class="text-6xl mb-4">🔒</div>
                            <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">크롬 권한 허락 안내</h3>
                            <p class="text-blue-700 dark:text-blue-300 text-sm">새 탭을 열 때 "유지" 버튼을 클릭하세요</p>
                            <div class="mt-4 flex justify-center space-x-2">
                              <div class="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded text-xs flex items-center justify-center">변경</div>
                              <div class="w-16 h-8 bg-blue-500 text-white rounded text-xs flex items-center justify-center font-semibold">유지</div>
                            </div>
                          </div>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
            </div>

            {/* 설치 안내 텍스트 */}
            <div className="flex-1 space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 text-lg">
                  {t('installGuide.step1Title')}
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-base leading-relaxed">
                  {t('installGuide.step1Description')}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3 text-lg">
                  {t('installGuide.step2Title')}
                </h3>
                <p className="text-green-800 dark:text-green-200 text-base leading-relaxed">
                  {t('installGuide.step2Description')}
                </p>
              </div>
            </div>
          </div>

          {/* GitHub Star 요청 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-center">
              <Star className="h-12 w-12 text-purple-500 fill-current mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-3">
                {t('installGuide.githubStarTitle')}
              </h3>
              <p className="text-purple-800 dark:text-purple-200 mb-6 text-lg leading-relaxed">
                {t('installGuide.githubStarDescription')}
              </p>
              <Button
                onClick={handleGitHubStar}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
              >
                <Star className="h-5 w-5 mr-2" />
                {t('installGuide.githubStarButton')}
                <ExternalLink className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button onClick={() => onOpenChange(false)} className="bg-blue-600 hover:bg-blue-700 text-white">
            {t('installGuide.gotIt')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InstallGuideDialog;
