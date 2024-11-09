import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const Montserrat = localFont({
    src: './static/fonts/Montserrat-Regular.ttf',
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
            <body className={`${Montserrat.variable}`}>{children}</body>
        </html>
    );
}
