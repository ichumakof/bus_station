import { useState } from 'react';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CarOutlined } from '@ant-design/icons';
import { ApiError } from '../api/client';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleFinish = async (values: { email: string; password: string }) => {
    setError(null);
    setLoading(true);

    try {
      await login(values.email, values.password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось выполнить вход.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f4f2ef',
      }}
    >
      <Card style={{ width: 380, borderTop: '4px solid #7a1f2b' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <CarOutlined style={{ fontSize: 42, color: '#7a1f2b' }} />
          <Typography.Title level={3} style={{ marginBottom: 8 }}>
            Автовокзал Иваново
          </Typography.Title>
          <Typography.Text type="secondary">Вход в систему продажи билетов</Typography.Text>
        </div>

        {error && (
          <Alert type="error" message={error} showIcon closable style={{ marginBottom: 16 }} />
        )}

        <Form layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="email"
            label="Электронная почта"
            rules={[
              { required: true, message: 'Введите почту' },
              { type: 'email', message: 'Некорректный email' },
            ]}
          >
            <Input size="large" placeholder="example@mail.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Пароль"
            rules={[{ required: true, message: 'Введите пароль' }]}
          >
            <Input.Password size="large" placeholder="Пароль" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            style={{ background: '#7a1f2b', borderColor: '#7a1f2b' }}
          >
            Войти
          </Button>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Typography.Text>
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </Typography.Text>
        </div>
      </Card>
    </div>
  );
}
