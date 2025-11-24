import React from 'react';
import { useTranslation } from 'react-i18next';

import Dropdown from './Dropdown';

interface FiltersProps {
  search: string;
  genre: string;
  year: string;
  genres: string[];
  years: string[];
  onSearchChange: (value: string) => void;
  onGenreChange: (value: string) => void;
  onYearChange: (value: string) => void;
}

const Filters: React.FC<FiltersProps> = ({
  search, genre, year,
  genres, years,
  onSearchChange, onGenreChange, onYearChange
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-4 w-110">
      <div className="grow">
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 bg-bg border border-fg/20 rounded-lg focus:outline-none focus:border-fg focus:ring-1 focus:ring-fg/20 transition-all"
        />
      </div>

      <Dropdown 
        options={genres}
        selected={genre}
        placeholder={t('allGenres')}
        onSelect={onGenreChange}
      />

      <Dropdown 
        options={years}
        selected={year}
        placeholder={t('allYears')}
        onSelect={onYearChange}
      />
    </div>
  );
};

export default Filters;