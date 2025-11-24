import React, { useState } from 'react';
import ChevronIcon from '../assets/chevron-down.svg?react';

interface DropdownProps {
  options: string[];
  selected: string;
  placeholder: string;
  onSelect: (value: string) => void;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ 
  options, 
  selected, 
  placeholder, 
  onSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <div className='relative'>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center justify-between px-4 py-2 bg-bg border border-fg/20 rounded-lg hover:border-fg/50 transition-all'>

        <span className="flex items-center gap-2 truncate">
          {selected || placeholder}
        </span>

        <ChevronIcon className={`w-4 h-4 ml-3 stroke-current transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className='absolute w-full mt-2 bg-bg border border-fg/10 rounded-lg shadow-md z-20'>

          <button
            onClick={() => handleOptionClick('')}
            className='px-4 py-2 flex gap-2 hover:bg-fg/5 transition-colors'
          >

            <span>{placeholder}</span>
          </button>

          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleOptionClick(opt)}
              className='w-full px-4 py-2 flex gap-2 hover:bg-fg/5 transition-colors'
            >

              <span>{opt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;