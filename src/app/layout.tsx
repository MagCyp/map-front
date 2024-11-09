import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import CustomThemeProvider from '@/components/CustomThemeProvider';
import Header from '@/components/Header';

const Montserrat = localFont({
    src: './fonts/Montserrat-Regular.ttf',
    variable: '--font-montserrat-regular',
});

export const metadata: Metadata = {
    title: 'Main Page',
    description: 'Features will be added in future versions',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
            <body className={`${Montserrat.variable}`}>
                <CustomThemeProvider>
                    <Header />
                    {children}
                </CustomThemeProvider>
            </body>
        </html>
    );
}
