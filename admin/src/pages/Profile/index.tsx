/**
 * admin/src/pages/Profile/index.tsx
 * 个人中心页面
 */

import { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Space, message, Modal, Form, Input, Popconfirm } from 'antd';
import { UserOutlined, EditOutlined, LockOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { getUserInfoApi, deleteAccountApi } from '@/services/api';
import type { SafeUser } from '@shared/types/user';
import './index.scss';

function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    // 如果未登录，跳转到登录页
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleEditProfile = async (values: { realName: string; phone: string; email?: string }) => {
    setLoading(true);
    try {
      // TODO: 调用更新个人信息API
      message.success('个人信息更新成功');
      setIsEditModalOpen(false);
    } catch (error: any) {
      message.error(error.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      message.warning('请输入密码确认注销');
      return;
    }

    setLoading(true);
    try {
      await deleteAccountApi(deletePassword);

      message.success('账号已注销');

      // 清除认证状态并跳转登录页
      logout();
      setIsDeleteModalOpen(false);
      setDeletePassword('');
      navigate('/login');
    } catch (error: any) {
      message.error(error.message || '注销失败');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    form.setFieldsValue({
      realName: user?.realName,
      phone: user?.phone,
      email: user?.email,
    });
    setIsEditModalOpen(true);
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return '系统管理员';
      case 'hotel_admin':
        return '酒店管理员';
      case 'user':
        return '普通用户';
      default:
        return '未知';
    }
  };

  return (
    <div className="profile-page">
      <Card title="个人中心" loading={loading}>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="用户名">{user?.username}</Descriptions.Item>
          <Descriptions.Item label="真实姓名">{user?.realName}</Descriptions.Item>
          <Descriptions.Item label="角色">{getRoleText(user?.role || '')}</Descriptions.Item>
          <Descriptions.Item label="手机号">{user?.phone || '未设置'}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{user?.email || '未设置'}</Descriptions.Item>
          <Descriptions.Item label="注册时间">
            {user?.createdAt ? new Date(user.createdAt).toLocaleString('zh-CN') : '-'}
          </Descriptions.Item>
        </Descriptions>

        <div className="action-buttons">
          <Space>
            <Button type="primary" icon={<EditOutlined />} onClick={openEditModal}>
              编辑资料
            </Button>
            <Button icon={<LockOutlined />} onClick={() => navigate('/change-password')}>
              修改密码
            </Button>
            <Popconfirm
              title="注销账号"
              description="注销后账号将被永久删除，无法恢复。是否继续？"
              icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
              okText="确认注销"
              cancelText="取消"
              okButtonProps={{ danger: true }}
              onConfirm={() => setIsDeleteModalOpen(true)}
            >
              <Button danger icon={<ExclamationCircleOutlined />}>
                注销账号
              </Button>
            </Popconfirm>
          </Space>
        </div>
      </Card>

      <Modal
        title="编辑个人资料"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleEditProfile}>
          <Form.Item
            name="realName"
            label="真实姓名"
            rules={[{ required: true, message: '请输入真实姓名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ type: 'email', message: '请输入正确的邮箱地址' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存
              </Button>
              <Button onClick={() => setIsEditModalOpen(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="确认注销账号"
        open={isDeleteModalOpen}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeletePassword('');
        }}
        footer={null}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ marginBottom: '16px' }}>
            请输入密码以确认注销账号
          </p>
          <p style={{ color: '#ff4d4f', fontSize: '14px', marginBottom: '16px' }}>
            <ExclamationCircleOutlined style={{ marginRight: '8px' }} />
            注销后账号将被<strong>永久删除</strong>，无法恢复
          </p>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              placeholder="请输入密码确认"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              onPressEnter={() => handleDeleteAccount()}
            />
          </Form.Item>
        </div>
      </Modal>
    </div>
  );
}

export default Profile;
