'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';

const CustomThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <ThemeProvider enableSystem={true} attribute='class'>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {children}
            </div>
        </ThemeProvider>
    );
};

export default CustomThemeProvider;
