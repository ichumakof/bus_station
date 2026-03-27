import { Layout, Menu, Button, Typography, Space, theme } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CarOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const customerMenuItems = [
  { key: '/trips', label: <Link to="/trips">Поиск рейсов</Link> },
  { key: '/my-tickets', label: <Link to="/my-tickets">Мои билеты</Link> },
];

const operatorMenuItems = [
  { key: '/manage/routes', label: <Link to="/manage/routes">Добавление маршрутов</Link> },
  { key: '/manage/edit-trips', label: <Link to="/manage/edit-trips">Управление рейсами</Link> },
];

const adminMenuItems = [
  { key: '/admin/sales-report', label: <Link to="/admin/sales-report">Отчет по продажам</Link> },
  { key: '/admin/users', label: <Link to="/admin/users">Сотрудники</Link> },
];

export default function AppLayout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const menuItems =
    role === 'Customer'
      ? customerMenuItems
      : role === 'Operator'
        ? operatorMenuItems
        : role === 'Admin'
          ? adminMenuItems
          : [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: '#800020', // Устанавливаем бордовый фон
          height: '64px',
          lineHeight: '64px',
        }}
      >
        <Space size="middle">
          {/* Иконка транспорта белого цвета */}
          <CarOutlined style={{ fontSize: '24px', color: 'white' }} />
          <Typography.Title level={4} style={{ color: 'white', margin: 0 }}>
            Автовокзал - Иваново
          </Typography.Title>
        </Space>

        <Space size="large">
          <Typography.Text style={{ color: 'rgba(255,255,255,0.85)' }}>
            <UserOutlined style={{ marginRight: 8 }} />
            {user?.displayName ?? 'Гость'} · 
            <span style={{ 
              marginLeft: 8, 
              padding: '2px 8px', 
              background: 'rgba(255,255,255,0.15)', 
              borderRadius: '4px' 
            }}>
              {role === 'Customer' ? 'Пассажир' : role}
            </span>
          </Typography.Text>
          <Button 
            type="text" 
            icon={<LogoutOutlined />}
            style={{ color: 'white' }} 
            onClick={handleLogout}
          >
            Выйти
          </Button>
        </Space>
      </Header>

      <Layout>
        {/* Оставляем Sider белым или делаем его светлым для контраста */}
        <Sider width={220} style={{ background: colorBgContainer }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>

        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              background: colorBgContainer,
              borderRadius: 8,
              padding: 24,
              minHeight: 360,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
