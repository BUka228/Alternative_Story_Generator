import type { Metadata } from 'next';
// Импортируем нужные шрифты из next/font/google
import { Geist, Geist_Mono } from 'next/font/google';
import { Caveat, Orbitron, Cinzel } from 'next/font/google'; // <-- Добавляем шрифты для жанров
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from "@/components/ui/toaster";
// Убираем TooltipProvider отсюда, добавим его в page.tsx, т.к. он нужен только там
// import { TooltipProvider } from '@/components/ui/tooltip'; // <-- Убираем

const geistSans = Geist({
  variable: '--font-geist-sans', // Основной шрифт
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono', // Моноширинный (можно использовать для заголовков/кода)
  subsets: ['latin'],
});

// Инициализируем шрифты для жанров
const caveat = Caveat({
  variable: '--font-caveat', // Сказка
  subsets: ['latin', 'cyrillic'], // Указываем нужные подмножества
  weight: ['400', '700'], // Указываем нужные веса
});

const orbitron = Orbitron({
  variable: '--font-orbitron', // Научная фантастика
  subsets: ['latin'],
  weight: ['400', '700'],
});

const cinzel = Cinzel({
  variable: '--font-cinzel', // Как в кино
  subsets: ['latin'],
  weight: ['400', '700'],
});


export const metadata: Metadata = {
  title: 'История Наоборот',
  description: 'Генератор альтернативных историй знакомства',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      {/* Применяем переменные шрифтов к body */}
      <body className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} ${orbitron.variable} ${cinzel.variable} antialiased`}>
          <AuthProvider>
            {/* Убрали TooltipProvider отсюда */}
            {children}
            <Toaster />
          </AuthProvider>
      </body>
    </html>
  );
}
