/**
 * admin/src/pages/ChangePassword/index.tsx
 * 修改密码页面
 */

import { useState } from 'react';
import { Card, Form, Input, Button, message, Progress } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { changePasswordApi } from '@/services/api';
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

interface ChangePasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function ChangePassword() {
  const navigate = useNavigate();
  const [form] = Form.useForm<ChangePasswordForm>();
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  const handleSubmit = async (values: ChangePasswordForm) => {
    setLoading(true);
    try {
      await changePasswordApi({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      message.success('密码修改成功，请重新登录');

      // 清除表单
      form.resetFields();

      // 延迟跳转到登录页
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      message.error(error.message || '密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <Card title="修改密码" className="change-password-card">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="oldPassword"
            label="原密码"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入原密码" size="large" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
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
              placeholder="请输入新密码（8-20位，建议字母+数字）"
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
            label="确认新密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_: any, value: string) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入新密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" loading={loading} block>
              确认修改
            </Button>
            <Button size="large" block style={{ marginTop: 12 }} onClick={() => navigate(-1)}>
              返回
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default ChangePassword;
