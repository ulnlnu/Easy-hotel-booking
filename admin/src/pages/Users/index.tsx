/**
 * admin/src/pages/Users/index.tsx
 * 账号管理页面（仅系统管理员）
 */

import { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  message,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '@/store/useAuthStore';
import { getAllUsersApi, updateUserApi, deleteUserApi } from '@/services/api';
import { registerApi } from '@/services/api';
import type { SafeUser, UserRole } from '@shared/types/user';
import type { RegisterRequest } from '@shared/types/user';
import './index.scss';

interface UsersResponse {
  success: true;
  data: SafeUser[];
}

function Users() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SafeUser | null>(null);
  const [form] = Form.useForm<RegisterRequest & { confirmPassword?: string }>();

  useEffect(() => {
    // 检查权限
    if (user?.role !== 'admin') {
      message.error('无权访问');
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response: UsersResponse = await getAllUsersApi();
      setUsers(response.data);
    } catch (error: any) {
      message.error(error.message || '获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (values: RegisterRequest & { confirmPassword?: string }) => {
    setLoading(true);
    try {
      const { confirmPassword, ...userData } = values;

      if (editingUser) {
        // 更新用户
        await updateUserApi(editingUser.id, userData);
        message.success('用户更新成功');
      } else {
        // 创建用户
        await registerApi(userData);
        message.success('用户创建成功');
      }

      setIsModalOpen(false);
      setEditingUser(null);
      form.resetFields();
      fetchUsers();
    } catch (error: any) {
      message.error(error.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteUserApi(id);
      message.success('用户删除成功');
      fetchUsers();
    } catch (error: any) {
      message.error(error.message || '删除失败');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (user: SafeUser) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      realName: user.realName,
      role: user.role,
      phone: user.phone,
      email: user.email,
    });
    setIsModalOpen(true);
  };

  const getRoleTag = (role: string) => {
    switch (role) {
      case 'admin':
        return <Tag color="red">系统管理员</Tag>;
      case 'hotel_admin':
        return <Tag color="blue">酒店管理员</Tag>;
      case 'user':
        return <Tag color="green">普通用户</Tag>;
      default:
        return <Tag>{role}</Tag>;
    }
  };

  const columns: ColumnsType<SafeUser> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150,
    },
    {
      title: '真实姓名',
      dataIndex: 'realName',
      key: 'realName',
      width: 120,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => getRoleTag(role),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (email: string | undefined) => email || '-',
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_: any, record: SafeUser) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            编辑
          </Button>
          {record.id !== user?.id && (
            <Popconfirm
              title="确定要删除该用户吗？"
              description="删除后用户将无法登录"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  if (user?.role !== 'admin') {
    return (
      <div className="users-page">
        <Card>
          <p>您无权访问此页面</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="users-page">
      <Card
        title="账号管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            创建用户
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '创建用户'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateOrUpdate}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 20, message: '用户名长度为3-20个字符' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
            ]}
          >
            <Input disabled={!!editingUser} placeholder="用户名（3-20个字符）" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: !editingUser, message: '请输入密码' },
              { min: 6, max: 20, message: '密码长度为6-20个字符' },
            ].filter(rule => editingUser || rule.required)}
          >
            <Input.Password
              placeholder={editingUser ? '留空则不修改密码' : '密码（6-20个字符）'}
            />
          </Form.Item>

          <Form.Item
            name="realName"
            label="真实姓名"
            rules={[
              { required: true, message: '请输入真实姓名' },
              { min: 2, max: 20, message: '姓名长度为2-20个字符' },
            ]}
          >
            <Input placeholder="真实姓名" />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select
              placeholder="请选择角色"
              options={[
                { label: '系统管理员', value: 'admin' },
                { label: '酒店管理员', value: 'hotel_admin' },
                { label: '普通用户', value: 'user' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
            ]}
          >
            <Input placeholder="手机号" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ type: 'email', message: '请输入正确的邮箱地址' }]}
          >
            <Input placeholder="邮箱（可选）" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingUser ? '更新' : '创建'}
              </Button>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingUser(null);
                  form.resetFields();
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Users;
