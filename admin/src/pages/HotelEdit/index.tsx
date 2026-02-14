/**
 * admin/src/pages/HotelEdit/index.tsx
 * 酒店信息录入/编辑页面
 */

import { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Table,
  Space,
  Modal,
  message,
  Popconfirm,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useHotelStore } from '@/store/useHotelStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getHotelListApi, createHotelApi, updateHotelApi, deleteHotelApi } from '@/services/api';
import type { Hotel, CreateHotelRequest } from '@shared/types/hotel';
import { UserRole } from '@shared/types/user';
import './index.scss';

function HotelEdit() {
  const { hotels, total, loading, setHotels, setLoading, addHotel, updateHotel, removeHotel } =
    useHotelStore();
  const { user } = useAuthStore(); // ✅ 获取当前登录用户

  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      // ✅ 根据用户角色决定是否过滤酒店
      const params: any = {
        page: 1,
        pageSize: 100,
        includeAll: true, // 包含所有状态：pending, approved, rejected, offline
      };

      // 酒店管理员只能看到自己创建的酒店
      if (user?.role === UserRole.HOTEL_ADMIN) {
        params.createdBy = user.id;
      }

      const response = await getHotelListApi(params);
      if (response.success) {
        setHotels(response.data, response.total);
      }
    } catch (error: any) {
      message.error(error.message || '获取酒店列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // [数据转换] 将表单字符串格式转换为 API 需要的格式
      const formattedValues = {
        ...values,
        // 将逗号分隔的字符串转换为数组
        tags: typeof values.tags === 'string' ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : values.tags || [],
        images: typeof values.images === 'string' ? values.images.split('\n').map(i => i.trim()).filter(Boolean) : values.images || [],
        facilities: typeof values.facilities === 'string' ? values.facilities.split(',').map(f => f.trim()).filter(Boolean) : values.facilities || [],
        // 从独立的经纬度输入框构建 location 对象
        location: {
          lat: values.locationLat,
          lng: values.locationLng,
        },
        // 添加默认房型信息（表单暂未实现房型录入）
        roomTypes: [
          {
            name: '标准间',
            price: 200,
            area: 25,
            beds: '大床 1.8m',
            maxOccupancy: 2,
            amenities: ['WiFi', '空调'],
          },
        ],
      };

      console.log('[前端调试] 格式化后的数据:', JSON.stringify(formattedValues, null, 2));

      if (editingId) {
        const response = await updateHotelApi(editingId, formattedValues);
        if (response.success) {
          message.success('更新成功');
          updateHotel(editingId, response.data);
          setIsModalOpen(false);
          form.resetFields();
          setEditingId(null);
        }
      } else {
        const response = await createHotelApi(formattedValues as CreateHotelRequest);
        if (response.success) {
          message.success('创建成功');
          addHotel(response.data);
          setIsModalOpen(false);
          form.resetFields();
        }
      }
    } catch (error: any) {
      message.error(error.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: Hotel) => {
    setEditingId(record.id);

    // 将 location 对象拆分为 locationLat 和 locationLng，以便在独立输入框中显示
    const formValue = {
      ...record,
      locationLat: record.location?.lat,
      locationLng: record.location?.lng,
      // 移除原有的 location 字段，避免冲突
      location: undefined,
    };

    form.setFieldsValue(formValue);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    // ✅ 权限检查：只有系统管理员可以删除酒店
    if (user?.role !== UserRole.ADMIN) {
      message.error('只有系统管理员可以删除酒店');
      return;
    }

    setLoading(true);
    try {
      const response = await deleteHotelApi(id);
      if (response.success) {
        message.success('删除成功');
        removeHotel(id);
      }
    } catch (error: any) {
      message.error(error.message || '删除失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          pending: { text: '待审核', color: 'orange' },
          approved: { text: '已通过', color: 'green' },
          rejected: { text: '已拒绝', color: 'red' },
          offline: { text: '已下线', color: 'gray' },
        };
        const s = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: '创建者',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 150,
      render: (createdBy: string) => (
        <span>{createdBy === user?.id ? '我' : createdBy}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: Hotel) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {/* ✅ 只有系统管理员可以删除酒店 */}
          {user?.role === UserRole.ADMIN && (
            <Popconfirm
              title="确定要删除这个酒店吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="hotel-edit-page">
      <div className="page-header">
        <h2>酒店信息管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增酒店
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={hotels}
        rowKey="id"
        loading={loading}
        pagination={{
          total,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: total => `共 ${total} 条`,
        }}
      />

      <Modal
        title={editingId ? '编辑酒店' : '新增酒店'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingId(null);
        }}
        width={800}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="酒店名称"
            rules={[{ required: true, message: '请输入酒店名称' }]}
          >
            <Input placeholder="请输入酒店名称" />
          </Form.Item>

          <Form.Item
            name="address"
            label="详细地址"
            rules={[{ required: true, message: '请输入详细地址' }]}
          >
            <Input placeholder="请输入详细地址" />
          </Form.Item>

          <Space style={{ width: '100%' }}>
            <Form.Item
              name="province"
              label="省份"
              rules={[{ required: true, message: '请输入省份' }]}
            >
              <Input placeholder="请输入省份" />
            </Form.Item>

            <Form.Item
              name="city"
              label="城市"
              rules={[{ required: true, message: '请输入城市' }]}
            >
              <Input placeholder="请输入城市" />
            </Form.Item>
          </Space>

          <Form.Item
            name="tags"
            label="标签"
            rules={[{ required: true, message: '请输入标签' }]}
          >
            <Input placeholder="请输入标签，用逗号分隔（如：近地铁,含早餐）" />
          </Form.Item>

          <Form.Item
            name="images"
            label="图片URL"
            rules={[{ required: true, message: '请输入图片URL' }]}
          >
            <Input.TextArea
              placeholder="请输入图片URL，多个用换行分隔"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="facilities"
            label="设施"
            rules={[{ required: true, message: '请输入设施' }]}
          >
            <Input placeholder="请输入设施，用逗号分隔（如：WiFi,空调,电视）" />
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <h4 style={{ marginBottom: 8 }}>房型信息</h4>
            <p style={{ color: '#999', fontSize: 12 }}>
              房型信息将在后续完善，此处暂时跳过
            </p>
          </div>

          <Space style={{ width: '100%' }}>
            <Form.Item
              name="locationLat"
              label="纬度"
              rules={[{ required: true, message: '请输入纬度' }]}
              tooltip="请输入数字，如：39.9042"
            >
              <Input
                placeholder="请输入纬度"
                type="number"
                step="0.0001"
                min={-90}
                max={90}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              name="locationLng"
              label="经度"
              rules={[{ required: true, message: '请输入经度' }]}
              tooltip="请输入数字，如：116.4074"
            >
              <Input
                placeholder="请输入经度"
                type="number"
                step="0.0001"
                min={-180}
                max={180}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}

export default HotelEdit;
