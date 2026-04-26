import { CarOutlined, LogoutOutlined } from '@ant-design/icons';
import { Button, Layout, Menu, Space, Typography, theme } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

const customerMenuItems = [
  { key: '/trips', label: <Link to="/trips">Поиск рейсов</Link> },
  { key: '/my-tickets', label: <Link to="/my-tickets">Мои билеты</Link> },
];

const operatorMenuItems = [
  { key: '/manage/routes', label: <Link to="/manage/routes">Маршруты</Link> },
  { key: '/manage/edit-trips', label: <Link to="/manage/edit-trips">Рейсы</Link> },
];

const adminMenuItems = [
  { key: '/admin/users', label: <Link to="/admin/users">Пользователи</Link> },
  { key: '/admin/sales-report', label: <Link to="/admin/sales-report">Отчет по продажам</Link> },
];

function resolveSelectedKey(pathname: string): string {
  if (pathname.startsWith('/trips')) return '/trips';
  if (pathname.startsWith('/my-tickets')) return '/my-tickets';
  if (pathname.startsWith('/manage/routes')) return '/manage/routes';
  if (pathname.startsWith('/manage/edit-trips')) return '/manage/edit-trips';
  if (pathname.startsWith('/admin/users')) return '/admin/users';
  if (pathname.startsWith('/admin/sales-report')) return '/admin/sales-report';
  return pathname;
}

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
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          background: 'linear-gradient(90deg, #6f1726, #8d2a39)',
          boxShadow: '0 12px 28px rgba(122, 31, 43, 0.22)',
        }}
      >
        <Space size={12}>
          <CarOutlined style={{ color: 'white', fontSize: 24 }} />
          <Typography.Title level={3} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
            Автовокзал Иваново
          </Typography.Title>
        </Space>

        <Space size={18}>
          <Typography.Text style={{ color: 'rgba(255,255,255,0.92)', fontSize: 15, fontWeight: 600 }}>
            {user?.displayName ?? 'Гость'} · {role}
          </Typography.Text>
          <Button type="link" style={{ color: 'white', padding: 0, fontWeight: 700 }} onClick={handleLogout}>
            <LogoutOutlined /> Выйти
          </Button>
        </Space>
      </Header>

      <Layout style={{ background: 'transparent' }}>
        <Sider
          width={230}
          style={{
            background: colorBgContainer,
            borderRight: '1px solid rgba(122, 31, 43, 0.14)',
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[resolveSelectedKey(location.pathname)]}
            style={{ height: '100%', borderRight: 0, paddingTop: 12 }}
            items={menuItems}
          />
        </Sider>

        <Layout style={{ padding: '24px', background: 'transparent' }}>
          <Content
            style={{
              background: colorBgContainer,
              borderRadius: 12,
              padding: 28,
              minHeight: 360,
              border: '1px solid rgba(122, 31, 43, 0.12)',
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
