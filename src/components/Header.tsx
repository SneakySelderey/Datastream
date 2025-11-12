import React from 'react';

import UpdateIcon from '../assets/update.svg?react';
import UserIcon from '../assets/user.svg?react';
import ThemeIcon from '../assets/theme.svg?react';

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
    return (
        <div className='fixed top-0 left-0 right-0 p-3 pr-6 pl-6 bg-gray-200 text-black z-50 shadow-md flex justify-between items-center'>
            <span>Datastream - pageName</span>
            <div className='flex items-center gap-6'>
                <ThemeIcon className='w-6 h-6 cursor-pointer'/>
                <UpdateIcon className='w-6 h-6 cursor-pointer'/>
                <UserIcon className='w-6 h-6 cursor-pointer'/>
            </div>
        </div>
    )
}

export default Header