/**
 * admin/src/pages/Login/index.tsx
 * 登录/注册页面
 */

import { useState } from 'react';
import { Form, Input, Button, Tabs, Card, message, Select, Progress } from 'antd';
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

/** 密码强度：0 弱 1 中 2 强 */
function getPasswordStrength(password: string): { level: number; text: string; status: 'exception' | 'normal' | 'success' } {
  if (!password) return { level: 0, text: '', status: 'exception' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  else if (/[a-zA-Z]/.test(password)) score += 0.5;
  if (/\d/.test(password)) score += 0.5;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  const level = score < 2 ? 0 : score < 3.5 ? 1 : 2;
  const text = level === 0 ? '弱' : level === 1 ? '中' : '强';
  const status = level === 0 ? 'exception' : level === 1 ? 'normal' : 'success';
  return { level, text, status };
}

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
    role: UserRole;
    phone: string;
    email?: string;
  }) => {
    setLoading(true);
    try {
      await registerApi({
        username: values.username,
        password: values.password,
        realName: values.realName,
        role: values.role,
        phone: values.phone,
        email: values.email,
      });

      message.success('注册成功！请登录');
      setActiveKey('login');
    } catch (error: any) {
      message.error(error.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const [activeKey, setActiveKey] = useState('login');
  const [passwordStrength, setPasswordStrength] = useState('');

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
                    <p>酒店管理员：hoteladmin / hoteladmin123</p>
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
                      { min: 8, max: 20, message: '密码长度为8-20个字符' },
                      () => ({
                        validator(_, value) {
                          if (!value) return Promise.resolve();
                          const { level } = getPasswordStrength(value);
                          if (level === 0) {
                            return Promise.reject(new Error('密码强度过弱，建议包含字母、数字或符号，至少8位'));
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="密码（8-20位，建议字母+数字）"
                      size="large"
                      onChange={e => setPasswordStrength(e.target.value)}
                    />
                  </Form.Item>
                  {passwordStrength && (
                    <div style={{ marginBottom: 16 }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>密码强度：</span>
                      <Progress
                        percent={getPasswordStrength(passwordStrength).level === 0 ? 33 : getPasswordStrength(passwordStrength).level === 1 ? 66 : 100}
                        size="small"
                        status={getPasswordStrength(passwordStrength).status}
                        showInfo={false}
                        style={{ display: 'inline-block', width: 80, marginLeft: 8, verticalAlign: 'middle' }}
                      />
                      <span style={{ marginLeft: 8, fontSize: 12, color: getPasswordStrength(passwordStrength).level === 0 ? '#dc2626' : getPasswordStrength(passwordStrength).level === 1 ? '#f59e0b' : '#16a34a' }}>
                        {getPasswordStrength(passwordStrength).text}
                        {getPasswordStrength(passwordStrength).level === 0 && '（过低，请加强）'}
                      </span>
                    </div>
                  )}

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
                    name="role"
                    label="注册角色"
                    rules={[{ required: true, message: '请选择角色' }]}
                  >
                    <Select
                      placeholder="请选择角色"
                      size="large"
                      options={[
                        { label: '酒店管理员', value: 'hotel_admin' },
                      ]}
                    />
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
                      <p>酒店管理员：可创建并管理自己的酒店</p>
                      <p style={{ marginTop: 4, fontSize: 12, opacity: 0.9 }}>系统管理员仅能由现有管理员在账号管理中创建</p>
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

