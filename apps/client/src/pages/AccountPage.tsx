import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Dropdown from '../components/Dropdown';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
];

const AccountPage: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [savedLang, setSavedLang] = useLocalStorage<string>('app-lang', 'en');
  const { logout, user, updateUser } = useAuth();

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
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const [newNickname, setNewNickname] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleNicknameSave = async () => {
    if (!user || !newNickname.trim()) return;

    try {
      const response = await fetch('/api/auth/change-nickname', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: user.id, newName: newNickname.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update nickname');
      }

      updateUser(data.user);

      setNewNickname('');
    } catch (err) {
      const message = (err as Error).message || 'Failed to update nickname';
      alert(message);
    }
  };

  const handlePasswordSave = async () => {
    if (!user || !newPassword.trim()) return;

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: user.id, newPassword: newPassword.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password');
      }

      setNewPassword('');
    } catch (err) {
      console.error('Password update failed', err);
    }
  };

  return (
    <div className='p-7 text-lg transition-all ease-in-out duration-300'>
      <h1 className='text-3xl mb-10'>{user?.name}</h1>
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

          <button
            onClick={handleNicknameSave}
            className='px-4 py-2 border border-fg/20 rounded-lg hover:bg-fg hover:text-bg cursor-pointer'
          >
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

          <button
            onClick={handlePasswordSave}
            className='px-4 py-2 border border-fg/20 rounded-lg hover:bg-fg hover:text-bg cursor-pointer'
          >
            {t('save')}
          </button>
        </div>

        <button
        onClick={handleLogout}
        className='mt-5 px-6 py-2 text-red-500 border rounded-lg hover:bg-red-500/10 cursor-pointer'>
            {t('logout')}
        </button>
      </div>
    </div>
  );
};

export default AccountPage;