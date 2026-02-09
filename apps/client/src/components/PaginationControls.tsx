import React from 'react';
import { useTranslation } from 'react-i18next';

import ChevronIcon from '../assets/chevron-down.svg?react';

interface PaginationControlsProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const { t } = useTranslation();

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(startItem + itemsPerPage - 1, totalItems);

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className="flex items-center justify-end gap-4 p-4 mt-4 border-t border-fg/10 text-sm">

      <span>
        {startItem}-{endItem} {t('of')} {totalItems}
      </span>

      <div className="flex items-center gap-2">
        <span>{t('itemsPerPage')}:</span>

        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="bg-bg border border-fg/20 rounded px-2 py-1 cursor-pointer focus:outline-none focus:border-fg"
        >
          <option value={18}>18</option>
          <option value={36}>36</option>
          <option value={72}>72</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="p-1 rounded disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
        >
          <ChevronIcon className="w-5 h-5 rotate-90 stroke-current" />
        </button>

        <span className="min-w-12 text-center">
          {currentPage} / {totalPages || 1}
        </span>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-1 rounded disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
        >
          <ChevronIcon className="w-5 h-5 -rotate-90 stroke-current" />
        </button>
      </div>

    </div>
  );
};

export default PaginationControls;
