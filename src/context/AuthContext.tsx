'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig'; // Импортируем auth из нашей конфигурации

interface AuthContextType {
  currentUser: User | null;
  loading: boolean; // Добавляем состояние загрузки
}

// Создаем контекст с начальными значениями
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true, // Изначально загрузка активна
});

// Хук для удобного использования контекста
export function useAuth() {
  return useContext(AuthContext);
}

// Компонент-провайдер
export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Состояние для отслеживания загрузки статуса аутентификации

  useEffect(() => {
    // onAuthStateChanged возвращает функцию отписки
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // Устанавливаем пользователя (или null)
      setLoading(false); // Загрузка завершена
      console.log("Auth State Changed:", user ? user.uid : 'No user'); // Для отладки
    });

    // Отписываемся при размонтировании компонента, чтобы избежать утечек памяти
    return () => unsubscribe();
  }, []); // Пустой массив зависимостей означает, что эффект выполнится один раз при монтировании

  const value = {
    currentUser,
    loading,
  };

  // Не рендерим дочерние компоненты, пока не определен статус аутентификации
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}