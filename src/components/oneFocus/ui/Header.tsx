import { useState, useEffect } from 'react';
import { FaGoogle } from 'react-icons/fa';
import { Input } from '@/components/ui/input';
import { formatDateTime } from '@/utils/dateUtils';

const Header: React.FC = () => {
  const [currentDateTime, setCurrentDateTime] = useState(formatDateTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(formatDateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 mb-8 justify-between">
      <div className="w-full bg-stone-100/50 backdrop-blur-lg rounded-3xl px-5 py-2 flex items-center">
        <div className="px-2">
          <span className="text-lg text-black">{currentDateTime.time}</span>
          <br />
          <span className="text-base text-gray-800">{currentDateTime.date}</span>
        </div>
        <div className="relative flex-1">
          <FaGoogle className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input type="search" placeholder="Google Search" className="pl-9 bg-white/80 border-0 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default Header;
