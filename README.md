# One Focus 🎯

[한국어](README.md) | [English](README-EN.md)

> 생산성 향상을 위한 통합 타이머 및 할 일 관리 Chrome 확장 프로그램

One Focus는 포모도로 기법을 활용한 타이머와 할 일 관리를 결합한 생산성 관리 도구입니다. Chrome 확장 프로그램으로 개발되어 새 탭에서 바로 사용할 수 있으며, 동기부여를 위한 명언과 함께 집중할 수 있는 환경을 제공합니다.

## ✨ 주요 기능

### 🕐 스마트 타이머

- **포모도로 기법** 기반의 집중 시간 관리
- **실시간 진행률 표시** - 원형 프로그레스 바로 남은 시간 시각화

### 📝 할 일 관리

- **드래그 앤 드롭** - 직관적인 순서 변경
- **카테고리 분류** - 작업을 체계적으로 관리
- **시간 할당** - 각 작업에 집중 시간을 설정
- **우선순위 관리** - 작업 순서를 자유롭게 조정

### 💡 동기부여

- **명언 카드** - 매일 새로운 영감을 제공하는 명언
- **다국어 지원** - 한국어/영어 인터페이스
- **아름다운 UI** - 집중을 방해하지 않는 미니멀한 디자인

### 🔧 고급 기능

- **Chrome 확장 프로그램** - 새 탭에서 바로 사용
- **로컬 스토리지** - 데이터는 브라우저에 안전하게 저장
- **반응형 디자인** - 다양한 화면 크기에 최적화
- **다크 테마** - 눈의 피로를 줄이는 어두운 테마

## 🚀 설치 및 사용법

### 설치

Chrome 웹 스토어에서 One Focus를 직접 설치할 수 있습니다:

[![One Focus 설치](https://img.shields.io/badge/설치-One%20Focus-blue?style=for-the-badge&logo=google-chrome)](https://chromewebstore.google.com/detail/one-focus/dgehmnblaocgaioijfigmbhkpbjdobaf?authuser=0&hl=ko)

**간편 설치 방법:**

1. 위의 설치 버튼을 클릭하거나 Chrome 웹 스토어를 방문하세요
2. "Chrome에 추가" 버튼을 클릭하세요
3. 설치를 확인하세요
4. 새 탭을 열어 One Focus를 사용해보세요!

**개발자용 설치 (소스코드에서):**
소스코드에서 설치하고 싶다면 이 저장소를 클론하고 Chrome의 개발자 모드에서 압축해제된 확장 프로그램으로 로드할 수 있습니다.

### 사용법

1. **할 일 추가**: "+" 버튼을 클릭하여 새로운 작업을 추가합니다
2. **타이머 시작**: 할 일 목록에서 원하는 작업의 타이머 버튼을 클릭합니다
3. **집중하기**: 설정된 시간 동안 집중하며 작업에 몰입합니다
4. **휴식**: 타이머 완료 후 적절한 휴식을 취합니다

## 🛠️ 기술 스택

### Frontend

- **React 18** - 최신 React 기능 활용
- **TypeScript** - 타입 안전성 보장
- **Vite** - 빠른 개발 환경
- **Tailwind CSS** - 유틸리티 기반 스타일링
- **Radix UI** - 접근성이 뛰어난 UI 컴포넌트

### 상태 관리

- **Zustand** - 가벼운 상태 관리
- **React Query** - 서버 상태 관리 (향후 확장용)

### Chrome Extension

- **Manifest V3** - 최신 Chrome 확장 프로그램 API
- **Service Worker** - 백그라운드 작업 처리
- **Chrome Storage API** - 데이터 영속성

### 개발 도구

- **ESLint** - 코드 품질 관리
- **Prettier** - 코드 포맷팅
- **Storybook** - 컴포넌트 문서화
- **Cypress** - E2E 테스팅

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── oneFocus/       # One Focus 전용 컴포넌트
│   │   ├── timer/      # 타이머 관련 컴포넌트
│   │   ├── todoList/   # 할 일 목록 컴포넌트
│   │   ├── quote/      # 명언 카드 컴포넌트
│   │   └── ui/         # UI 컴포넌트
│   └── ui/             # 공통 UI 컴포넌트
├── stores/             # Zustand 상태 관리
├── hooks/              # 커스텀 React 훅
├── utils/              # 유틸리티 함수
├── types/              # TypeScript 타입 정의
├── i18n/               # 다국어 지원
└── pages/              # 페이지 컴포넌트
```

## 🎨 UI/UX 특징

- **미니멀 디자인** - 집중을 방해하지 않는 깔끔한 인터페이스
- **다크 테마** - 눈의 피로를 줄이는 어두운 색상 팔레트
- **반응형 레이아웃** - 다양한 화면 크기에 최적화
- **부드러운 애니메이션** - 자연스러운 전환 효과
- **직관적인 네비게이션** - 사용하기 쉬운 인터페이스

## 🔧 개발 스크립트

```bash
# 개발 서버 실행
yarn dev

# 프로덕션 빌드
yarn build

# 코드 린팅
yarn lint

# 코드 포맷팅
yarn format

# 테스트 실행
yarn test

# Storybook 실행
yarn storybook

# Cypress E2E 테스트
yarn cypress:open
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

프로젝트 링크: [https://github.com/your-username/one-focus](https://github.com/your-username/one-focus)

## 🙏 감사의 말

- [Radix UI](https://www.radix-ui.com/) - 접근성이 뛰어난 UI 컴포넌트
- [Lucide React](https://lucide.dev/) - 아름다운 아이콘
- [Tailwind CSS](https://tailwindcss.com/) - 유틸리티 기반 CSS 프레임워크
- [Zustand](https://zustand-demo.pmnd.rs/) - 가벼운 상태 관리

---

**One Focus**와 함께 더 나은 생산성을 경험해보세요! 🚀
