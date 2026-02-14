/**
 * admin/src/pages/Login/index.tsx
 * 登录/注册页面
 */

import { useState } from 'react';
import { Form, Input, Button, Tabs, Card, message } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { loginApi, registerApi } from '@/services/api';
import type { LoginRequest } from '@shared/types/user';
import type { UserRole } from '@shared/types/user';
import './index.scss';

function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: LoginRequest) => {
    setLoading(true);
    try {
      const response = await loginApi(values);
      if (response.success) {
        setAuth(response.data.user, response.data.token);
        message.success('登录成功');
        navigate('/hotels/edit');
      } else {
        message.error(response.message);
      }
    } catch (error: any) {
      message.error(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: {
    username: string;
    password: string;
    confirmPassword: string;
    realName: string;
    phone: string;
    email?: string;
  }) => {
    setLoading(true);
    try {
      // 注册请求（固定角色为酒店管理员）
      await registerApi({
        username: values.username,
        password: values.password,
        realName: values.realName,
        role: 'hotel_admin' as UserRole,
        phone: values.phone,
        email: values.email,
      });

      message.success('注册成功！请登录');

      // 切换到登录Tab
      setActiveKey('login');
    } catch (error: any) {
      message.error(error.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const [activeKey, setActiveKey] = useState('login');

  return (
    <div className="login-page">
      <Card className="login-card">
        <div className="logo">
          <h1>易宿酒店预订平台</h1>
          <p>管理后台</p>
        </div>

        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          items={[
            {
              key: 'login',
              label: '登录',
              children: (
                <Form onFinish={handleLogin} autoComplete="off">
                  <Form.Item
                    name="username"
                    rules={[{ required: true, message: '请输入用户名' }]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="用户名"
                      size="large"
                    />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: '请输入密码' }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="密码"
                      size="large"
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                      登录
                    </Button>
                  </Form.Item>
                  <div className="demo-accounts">
                    <p>演示账号：</p>
                    <p>管理员：admin / admin123</p>
                    <p>酒店管理员：hoteladmin / admin123</p>
                  </div>
                </Form>
              ),
            },
            {
              key: 'register',
              label: '注册',
              children: (
                <Form onFinish={handleRegister} autoComplete="off">
                  <Form.Item
                    name="username"
                    rules={[
                      { required: true, message: '请输入用户名' },
                      { min: 3, max: 20, message: '用户名长度为3-20个字符' },
                      { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="用户名（3-20个字符）"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: '请输入密码' },
                      { min: 6, max: 20, message: '密码长度为6-20个字符' },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="密码（6-20个字符）"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: '请确认密码' },
                      ({ getFieldValue }) => ({
                        validator(_: any, value: string) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('两次输入的密码不一致'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="确认密码"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="realName"
                    rules={[
                      { required: true, message: '请输入真实姓名' },
                      { min: 2, max: 20, message: '姓名长度为2-20个字符' },
                    ]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="真实姓名" size="large" />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    rules={[
                      { required: true, message: '请输入手机号' },
                      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="手机号"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    rules={[
                      { type: 'email', message: '请输入正确的邮箱地址' },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="邮箱（可选）"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item>
                    <div className="register-role-tip">
                      <p>注册成功后，您将成为「酒店管理员」</p>
                      <p>可创建和管理自己的酒店</p>
                    </div>
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                      注册
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}

export default Login;
