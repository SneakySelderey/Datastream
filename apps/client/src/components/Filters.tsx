import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Dropdown from './Dropdown';

import { type SortMode } from '../types';

interface FiltersProps {
  search: string;
  genre: string;
  year: string;
  genres: string[];
  years: string[];
  sortMode: SortMode;
  onSearchChange: (value: string) => void;
  onGenreChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

const Filters: React.FC<FiltersProps> = ({
  search, genre, year,
  genres, years, sortMode,
  onSearchChange, onGenreChange,
  onYearChange, onSortChange
}) => {
  const { t } = useTranslation();

  const sortOptions = [
    { value: 'name', label: t('sortName') },
    { value: 'random', label: t('sortRandom') },
    { value: 'recently-added', label: t('sortNewest') },
    { value: 'recently-played', label: t('sortPlayed') },
    { value: 'most-played', label: t('sortPopular') },
  ];

  const currentSort = sortOptions.find(opt => opt.value === sortMode) || sortOptions[0];

  const handleSortSelect = (str: string) => {
    const option = sortOptions.find(opt => opt.label === str);
    if (option) {
      onSortChange(option.value);
    }
  };

  const allGenresLabel = t('allGenres');
  const allYearsLabel = t('allYears');

  const handleGenreSelect = (value: string) => {
    onGenreChange(value === allGenresLabel ? '' : value);
  };

  const handleYearSelect = (value: string) => {
    onYearChange(value === allYearsLabel ? '' : value);
  };

  useEffect(() => {
    if (genre && !genres.includes(genre)) {
      onGenreChange('');
    }
  }, [genre, genres, onGenreChange]);

  useEffect(() => {
    if (year && !years.includes(year)) {
      onYearChange('');
    }
  }, [year, years, onYearChange]);

  return (
    <div className="flex flex-wrap gap-4">
      <div>
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 bg-bg border border-fg/20 rounded-lg focus:outline-none focus:border-fg focus:ring-1 focus:ring-fg/20 transition-all"
        />
      </div>

      <Dropdown 
        options={sortOptions.map(opt => opt.label)}
        selected={currentSort.label}
        onSelect={handleSortSelect}
      />

      <Dropdown 
        options={[allGenresLabel, ...genres]}
        selected={genre}
        placeholder={t('allGenres')}
        onSelect={handleGenreSelect}
      />

      <Dropdown 
        options={[allYearsLabel, ...years]}
        selected={year}
        placeholder={t('allYears')}
        onSelect={handleYearSelect}
      />
    </div>
  );
};

export default Filters;
