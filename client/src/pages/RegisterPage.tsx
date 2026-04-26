import { useState } from 'react';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { Link, Navigate } from 'react-router-dom';
import { CarOutlined } from '@ant-design/icons';
import { ApiError } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleFinish = async (values: {
    displayName: string;
    email: string;
    password: string;
  }) => {
    setError(null);
    setLoading(true);

    try {
      await register(values.displayName, values.email, values.password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось выполнить регистрацию.');
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
      <Card style={{ width: 400, borderTop: '4px solid #7a1f2b' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <CarOutlined style={{ fontSize: 42, color: '#7a1f2b' }} />
          <Typography.Title level={3} style={{ marginBottom: 8 }}>
            Регистрация пассажира
          </Typography.Title>
        </div>

        {error && (
          <Alert type="error" message={error} showIcon closable style={{ marginBottom: 16 }} />
        )}

        <Form layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="displayName"
            label="Имя"
            rules={[{ required: true, message: 'Введите имя' }]}
          >
            <Input size="large" placeholder="Иван Иванов" />
          </Form.Item>

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
            rules={[
              { required: true, message: 'Введите пароль' },
              { min: 6, message: 'Минимум 6 символов' },
            ]}
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
            Зарегистрироваться
          </Button>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Typography.Text>
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </Typography.Text>
        </div>
      </Card>
    </div>
  );
}
