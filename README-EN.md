# One Focus 🎯

> Integrated Timer and Task Management Chrome Extension for Enhanced Productivity

One Focus is a productivity management tool that combines Pomodoro technique-based timer functionality with task management. Developed as a Chrome extension, it provides an immediate productivity environment accessible from the new tab, complete with motivational quotes to keep you focused.

## ✨ Key Features

### 🕐 Smart Timer

- **Pomodoro Technique** based focus time management
- **Real-time Progress Display** - Visualize remaining time with circular progress bar

### 📝 Task Management

- **Drag & Drop** - Intuitive task reordering
- **Category Classification** - Organize tasks systematically
- **Time Allocation** - Set focus time for each task
- **Priority Management** - Freely adjust task order

### 💡 Motivation

- **Quote Cards** - Daily inspirational quotes
- **Multi-language Support** - Korean/English interface
- **Beautiful UI** - Minimalist design that doesn't distract

### 🔧 Advanced Features

- **Chrome Extension** - Use directly from new tab
- **Local Storage** - Data safely stored in browser
- **Responsive Design** - Optimized for various screen sizes
- **Dark Theme** - Eye-friendly dark theme

## 🚀 Installation & Usage

### Installation

You can install One Focus directly from the Chrome Web Store:

[![Install One Focus](https://img.shields.io/badge/Install-One%20Focus-blue?style=for-the-badge&logo=google-chrome)](https://chromewebstore.google.com/detail/one-focus/dgehmnblaocgaioijfigmbhkpbjdobaf?authuser=0&hl=en)

**Quick Install Steps:**

1. Click the install button above or visit the Chrome Web Store
2. Click "Add to Chrome"
3. Confirm the installation
4. Open a new tab to start using One Focus!

**Alternative Installation (for developers):**
If you want to install from source code, you can clone this repository and load it as an unpacked extension in Chrome's developer mode.

### Usage

1. **Add Tasks**: Click the "+" button to add new tasks
2. **Start Timer**: Click the timer button on any task from your todo list
3. **Focus**: Immerse yourself in the task for the set duration
4. **Rest**: Take appropriate breaks after timer completion

## 🛠️ Tech Stack

### Frontend

- **React 18** - Latest React features
- **TypeScript** - Type safety
- **Vite** - Fast development environment
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible UI components

### State Management

- **Zustand** - Lightweight state management
- **React Query** - Server state management (for future expansion)

### Chrome Extension

- **Manifest V3** - Latest Chrome extension API
- **Service Worker** - Background task handling
- **Chrome Storage API** - Data persistence

### Development Tools

- **ESLint** - Code quality management
- **Prettier** - Code formatting
- **Storybook** - Component documentation
- **Cypress** - E2E testing

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── oneFocus/       # One Focus specific components
│   │   ├── timer/      # Timer related components
│   │   ├── todoList/   # Todo list components
│   │   ├── quote/      # Quote card components
│   │   └── ui/         # UI components
│   └── ui/             # Common UI components
├── stores/             # Zustand state management
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── i18n/               # Internationalization
└── pages/              # Page components
```

## 🎨 UI/UX Features

- **Minimalist Design** - Clean interface that doesn't distract
- **Dark Theme** - Eye-friendly dark color palette
- **Responsive Layout** - Optimized for various screen sizes
- **Smooth Animations** - Natural transition effects
- **Intuitive Navigation** - Easy-to-use interface

## 🔧 Development Scripts

```bash
# Run development server
yarn dev

# Build for production
yarn build

# Run linting
yarn lint

# Format code
yarn format

# Run tests
yarn test

# Run Storybook
yarn storybook

# Run Cypress E2E tests
yarn cypress:open
```

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

Project Link: [https://github.com/your-username/one-focus](https://github.com/your-username/one-focus)

## 🙏 Acknowledgments

- [Radix UI](https://www.radix-ui.com/) - Accessible UI components
- [Lucide React](https://lucide.dev/) - Beautiful icons
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Zustand](https://zustand-demo.pmnd.rs/) - Lightweight state management

---

Experience better productivity with **One Focus**! 🚀
