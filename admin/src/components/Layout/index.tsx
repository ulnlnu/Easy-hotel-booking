/**
 * admin/src/components/Layout/index.tsx
 * 管理端布局组件
 */

import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Avatar, Dropdown } from 'antd';
import {
  PlusSquareOutlined,
  AuditOutlined,
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/useAuthStore';
import type { UserRole } from '@shared/types/user';
import './index.scss';

const { Header, Sider, Content } = AntLayout;

// 根据用户角色生成菜单项
const getMenuItems = (role: UserRole | null) => {
  const commonItems = [
    {
      key: '/hotels/edit',
      icon: <PlusSquareOutlined />,
      label: '酒店录入',
    },
    {
      key: '/hotels/audit',
      icon: <AuditOutlined />,
      label: '审核管理',
    },
  ];

  // 个人中心菜单
  const profileItems = [
    {
      type: 'divider' as const,
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
  ];

  // 系统管理员专属账号管理菜单
  const adminItems =
    role === 'admin'
      ? [
          {
            key: '/users',
            icon: <TeamOutlined />,
            label: '账号管理',
          },
        ]
      : [];

  return [...commonItems, ...profileItems, ...adminItems];
};

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = getMenuItems(user?.role || null);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  // 登录页不显示布局
  if (location.pathname === '/login') {
    return <Outlet />;
  }

  return (
    <AntLayout className="admin-layout">
      <Sider width={240} theme="light">
        <div className="logo">
          <h2>易宿管理后台</h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <AntLayout>
        <Header className="header">
          <div className="header-right">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="user-info">
                <Avatar icon={<UserOutlined />} />
                <span className="username">{user?.realName}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="content">
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}

export default Layout;
