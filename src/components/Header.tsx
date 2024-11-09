'use client';

import { useTheme } from 'next-themes';
import React from 'react';

function Header() {
    const { theme, setTheme } = useTheme();

    return (
        <div>
            <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
                Toggle Theme
            </button>
        </div>
    );
}

export default Header;
