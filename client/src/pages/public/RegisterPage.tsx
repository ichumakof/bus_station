import { useState, useEffect } from 'react';
import { Button, Card, Form, Input, Typography, Alert } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CarOutlined } from '@ant-design/icons';

const ROLE_REDIRECTS = {
  Customer: '/trips',
  Operator: '/manage/routes',
  Admin: '/admin/sales-report',
};

export default function RegisterPage() {
  const { register, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Если уже авторизован — уходим на главную
  useEffect(() => {
    if (isAuthenticated && role) {
      const target = ROLE_REDIRECTS[role as keyof typeof ROLE_REDIRECTS] || '/trips';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const onFinish = async (values: any) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await register(values.displayName, values.email, values.password);
      // После успешного register вызван login(), сработает useEffect выше
    } catch (err: any) {
      setErrorMsg(err.message || 'Не удалось создать аккаунт');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      minHeight: '100vh', background: '#f0f2f5' 
    }}>
      <Card style={{ width: 400, borderTop: '4px solid #800020' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <CarOutlined style={{ fontSize: '48px', color: '#800020' }} />
          <Typography.Title level={3} style={{ marginTop: 12, color: '#800020' }}>
            Регистрация пассажира
          </Typography.Title>
        </div>

        {errorMsg && (
          <Alert message={errorMsg} type="error" showIcon style={{ marginBottom: 16 }} closable />
        )}

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Как вас зовут?"
            name="displayName"
            rules={[{ required: true, message: 'Пожалуйста, представьтесь' }]}
          >
            <Input placeholder="Иван Иванов" size="large" />
          </Form.Item>

          <Form.Item
            label="Электронная почта"
            name="email"
            rules={[
              { required: true, message: 'Введите почту' },
              { type: 'email', message: 'Некорректный email' }
            ]}
          >
            <Input placeholder="example@mail.com" size="large" />
          </Form.Item>

          <Form.Item
            label="Пароль"
            name="password"
            extra="Пароль должен содержать минимум 6 символов, цифру и строчную букву"
            rules={[
              { required: true, message: 'Придумайте пароль' },
              { min: 6, message: 'Минимум 6 символов' },
              { 
                pattern: /[a-z]/, 
                message: 'Нужна хотя бы одна строчная буква' 
              },
              { 
                pattern: /[0-9]/, 
                message: 'Нужна хотя бы одна цифра' 
              }
            ]}
          >
            <Input.Password placeholder="Придумайте пароль" size="large" />
          </Form.Item>

          <Form.Item
            label="Подтвердите пароль"
            name="confirm"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Повторите пароль' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Пароли не совпадают'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Повторите пароль" size="large" />
          </Form.Item>

          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            size="large" 
            loading={loading}
            style={{ background: '#800020', borderColor: '#800020' }}
          >
            Зарегистрироваться
          </Button>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Typography.Text>
            Уже есть аккаунт? <Link to="/login" style={{ color: '#800020' }}>Войти</Link>
          </Typography.Text>
        </div>
      </Card>
    </div>
  );
}