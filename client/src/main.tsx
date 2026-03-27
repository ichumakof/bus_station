import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd'; // 1. Импортируем провайдер конфига
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import 'antd/dist/reset.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* 2. Оборачиваем всё в ConfigProvider и задаем бордовый цвет */}
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#800020', // Основной бордовый цвет для кнопок и меню
            borderRadius: 6,         // Немного скругляем углы
          },
        }}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);