import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import Dropdown from '../components/Dropdown';

import { useLocalStorage } from '../hooks/useLocalStorage';

import ChevronIcon from '../assets/chevron-down.svg?react';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
];

const AccountPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { i18n, t } = useTranslation();
  const [savedLang, setSavedLang] = useLocalStorage<string>('app-lang', 'en');

  useEffect(() => {
    if (savedLang && i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang);
    }
  }, [savedLang, i18n]);

  const currentLang = languages.find(l => l.code === savedLang) || languages[0];

  const handleSelect = (str: string) => {
    const lang = languages.find(l => l.label === str);
    if (lang) {
      setSavedLang(lang.code);
      setIsOpen(false);
    }
  };

  const [newNickname, setNewNickname] = useState('');
  const [newPassword, setNewPassword] = useState('');

  return (
    <div className='p-7 text-lg transition-all ease-in-out duration-300'>
      <h1 className='text-3xl mb-10'>Username</h1>
      <div className='flex flex-col gap-5'>
        <div className='flex gap-4 items-center'>
          <p>{t('language')}</p>

          <Dropdown
            options={languages.map(lang => lang.label)}
            selected={currentLang.label}
            onSelect={handleSelect}
          />
        </div>
        
        <div className='flex gap-4 items-center'>
          <p>{t('changeNickname')}</p>
          
          <input 
            type="text"
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
            placeholder={t('newNickname')}
            className="px-4 py-2 border border-fg/20 rounded-lg outline-none focus:border-fg"
          />

          <button className='px-4 py-2 border border-fg/20 rounded-lg hover:bg-fg hover:text-bg cursor-pointer'>
            {t('save')}
          </button>
        </div>

        <div className='flex gap-4 items-center'>
          <p>{t('changePassword')}</p>

          <input 
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t('newPassword')}
            className="px-4 py-2 border border-fg/20 rounded-lg outline-none focus:border-fg"
          />

          <button className='px-4 py-2 border border-fg/20 rounded-lg hover:bg-fg hover:text-bg cursor-pointer'>
            {t('save')}
          </button>
        </div>

        <Link to='/login'>
          <button className='mt-5 px-6 py-2 text-red-500 border rounded-lg hover:bg-red-500/10 cursor-pointer'>
              {t('logout')}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default AccountPage;