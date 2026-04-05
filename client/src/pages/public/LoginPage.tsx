import { useState, useEffect } from 'react';
import { Button, Card, Form, Input, Typography, Alert } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { Role } from '../../contexts/AuthContext';
import { CarOutlined } from '@ant-design/icons';
import { apiClient } from '../../api/client';

const ROLE_REDIRECTS = {
  Customer: '/trips',
  Operator: '/manage/routes',
  Admin: '/admin/sales-report',
};

export default function LoginPage() {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && role) {
      const target = ROLE_REDIRECTS[role as keyof typeof ROLE_REDIRECTS] || '/trips';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setErrorMsg(null);

    try {

      const data = await apiClient.post<any>('/api/auth/login', values);

      const token = data.accessToken || data.token;

      if (token) {
        await login(token); 
      } else {
        throw new Error('Сервер не прислал токен доступа');
      }
      
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      minHeight: '100vh', background: '#f0f2f5' 
    }}>
      <Card style={{ width: 380, borderTop: '4px solid #800020' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <CarOutlined style={{ fontSize: '48px', color: '#800020' }} />
          <Typography.Title level={3} style={{ marginTop: 12, color: '#800020' }}>
            Автовокзал Иваново
          </Typography.Title>
          <Typography.Text type="secondary">Вход в кабинет пассажира</Typography.Text>
        </div>

        {errorMsg && (
          <Alert message={errorMsg} type="error" showIcon style={{ marginBottom: 16 }} closable />
        )}

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Электронная почта"
            name="email"
            rules={[{ required: true, message: 'Введите почту' }, { type: 'email', message: 'Неверный формат' }]}
          >
            <Input placeholder="mail@example.com" size="large" />
          </Form.Item>

          <Form.Item
            label="Пароль"
            name="password"
            rules={[{ required: true, message: 'Введите пароль' }]}
          >
            <Input.Password placeholder="Пароль" size="large" />
          </Form.Item>

          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            size="large" 
            loading={loading}
            style={{ background: '#800020', borderColor: '#800020', marginTop: 8 }}
          >
            Войти в систему
          </Button>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Typography.Text>
            Еще нет аккаунта? <Link to="/register" style={{ color: '#800020' }}>Создать</Link>
          </Typography.Text>
        </div>
      </Card>
    </div>
  );
}