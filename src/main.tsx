import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import './styles/index.css';
import App from '@/App';
import TimerCompletedPage from '@/pages/TimerCompletedPage';
import '@/i18n';

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/timer-completed',
    element: <TimerCompletedPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />);
