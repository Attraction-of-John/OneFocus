import { useState, useEffect, useRef } from 'react';
import { SiGoogle } from 'react-icons/si';
import { Input } from '@/components/ui/input';
import { IoSearch } from 'react-icons/io5';
import { formatDateTime } from '@/utils/dateUtils';
import { useSearch } from '@/hooks/useSearch';

const Header: React.FC = () => {
  const [currentDateTime, setCurrentDateTime] = useState(formatDateTime());
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const {
    searchTerm,
    suggestions,
    selectedIndex,
    isSearchFocused,
    handleSearch,
    executeSearch,
    handleKeyDown,
    setIsSearchFocused,
  } = useSearch();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(formatDateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const currentRef = searchContainerRef.current;

    const handleClickOutside = (event: MouseEvent) => {
      if (currentRef && !currentRef.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [setIsSearchFocused]);

  return (
    <div className="flex flex-col items-center gap-4 mb-8 justify-between relative z-50">
      <div className="w-full bg-stone-100/50 backdrop-blur-lg rounded-3xl px-5 py-2 flex items-center">
        <div className="px-2">
          <span className="text-lg text-black">{currentDateTime.time}</span>
          <br />
          <span className="text-base text-gray-800">{currentDateTime.date}</span>
        </div>
        <div ref={searchContainerRef} className="relative flex-1">
          <SiGoogle className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Google Search"
            className={`
              pl-9 border-0 bg-white/80 border-gray-200 focus-visible:ring-0 focus-visible:bg-white focus-visible:ring-offset-0
              ${suggestions.length > 0 && searchTerm && isSearchFocused ? 'rounded-t-3xl rounded-b-none' : 'rounded-3xl'}
            `}
          />
          {suggestions.length > 0 && searchTerm && isSearchFocused && (
            <div className="absolute w-full bg-white rounded-b-3xl border border-t-0 border-gray-200 shadow-lg overflow-hidden">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer
                    ${index === selectedIndex ? 'bg-gray-100' : ''}
                  `}
                  onClick={() => {
                    executeSearch(suggestion);
                  }}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <IoSearch className="w-5 h-5 text-gray-400 shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm">{suggestion}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
