/**
 * admin/src/pages/ChangePassword/index.tsx
 * 修改密码页面
 */

import { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { changePasswordApi } from '@/services/api';
import './index.scss';

interface ChangePasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function ChangePassword() {
  const navigate = useNavigate();
  const [form] = Form.useForm<ChangePasswordForm>();
  const [loading, setLoading] = useState(false);

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
              { min: 6, max: 20, message: '密码长度为6-20个字符' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入新密码（6-20个字符）"
              size="large"
            />
          </Form.Item>

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
