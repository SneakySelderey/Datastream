import React, { useEffect, useMemo, useRef, useState } from 'react';
import ChevronIcon from '../assets/chevron-down.svg?react';

interface DropdownProps {
  options: string[];
  selected: string;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  noOptionsText?: string;
  onSelect: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ 
  options, 
  selected, 
  placeholder, 
  searchable = false,
  searchPlaceholder = 'Search',
  noOptionsText = 'Nothing found',
  onSelect
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!searchable || normalizedQuery.length === 0) {
      return options;
    }

    return options.filter((option) => option.toLowerCase().includes(normalizedQuery));
  }, [options, searchQuery, searchable]);

  const handleToggle = () => {
    if (isOpen) {
      setSearchQuery('');
    }

    setIsOpen(!isOpen);
  };

  const handleOptionClick = (value: string) => {
    onSelect(value);
    setSearchQuery('');
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setSearchQuery('');
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className='relative w-full max-w-64'>
      <button 
        onClick={handleToggle}
        className='w-full flex items-center justify-between px-4 py-2 bg-bg border border-fg/20 rounded-lg hover:border-fg/50 transition-all'>

        <span className="flex items-center gap-2 truncate">
          {selected || placeholder || ''}
        </span>

        <ChevronIcon className={`w-4 h-4 ml-3 stroke-current transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className='absolute mt-2 w-full overflow-hidden bg-bg border border-fg/10 rounded-lg shadow-md z-20'>
          {searchable && (
            <div className='p-2 border-b border-fg/10'>
              <input
                autoFocus
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchQuery('');
                    setIsOpen(false);
                  }
                }}
                placeholder={searchPlaceholder}
                className='w-full px-3 py-2 bg-bg border border-fg/20 rounded-lg outline-none focus:border-fg focus:ring-1 focus:ring-fg/20'
              />
            </div>
          )}

          <div className='max-h-64 overflow-y-auto overflow-x-hidden'>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleOptionClick(opt)}
                  className='w-full text-left px-4 py-2 flex gap-2 hover:bg-fg/5 transition-colors'
                >
                  <span className='truncate'>{opt}</span>
                </button>
              ))
            ) : (
              <p className='px-4 py-3 text-sm text-fg/60'>{noOptionsText}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
