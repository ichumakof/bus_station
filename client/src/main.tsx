import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import 'antd/dist/reset.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#800020',
            borderRadius: 6,
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