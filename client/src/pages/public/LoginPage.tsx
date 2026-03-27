import { Button, Card, Space, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { Role } from '../../contexts/AuthContext';
import { CarOutlined } from '@ant-design/icons';

const DEMO_USERS: { role: Role; redirect: string }[] = [
  { role: 'Customer', redirect: '/trips' },
  { role: 'Operator', redirect: '/manage/routes' },
  { role: 'Admin', redirect: '/admin/sales-report' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = (role: Role, redirect: string) => {
    login('dev-token', { id: 'dev', displayName: `${role} Demo` }, role);
    navigate(redirect);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
      }}
    >
      <Card style={{ width: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <CarOutlined style={{ fontSize: '50px', color: '#800020' }} />
          <Typography.Title level={3} style={{ margin: '10px 0 0 0', color: '#800020' }}>
            Автовокзал Иваново
          </Typography.Title>
        </div>

        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {DEMO_USERS.map(({ role, redirect }) => (
            <Button
              key={role}
              type="primary"
              block
              onClick={() => handleDemoLogin(role, redirect)}
            >
              Login as {role}
            </Button>
          ))}
        </Space>
      </Card>
    </div>
  );
}
