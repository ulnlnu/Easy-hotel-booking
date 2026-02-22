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
  DatePicker,
  Select,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
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

      // 格式化房型数据
      const roomTypes = (values.roomTypes || []).map((rt: any) => ({
        name: rt.name,
        area: typeof rt.area === 'number' ? rt.area : Number(rt.area) || 0,
        price: Number(rt.price) || 0,
        bedType: rt.bedType || rt.beds || '',
        maxOccupancy: Number(rt.maxOccupancy) || 2,
        amenities: typeof rt.amenities === 'string' ? rt.amenities.split(',').map((a: string) => a.trim()).filter(Boolean) : rt.amenities || [],
      }));

      // [数据转换] 将表单字符串格式转换为 API 需要的格式
      const formattedValues = {
        ...values,
        tags: typeof values.tags === 'string' ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : values.tags || [],
        images: typeof values.images === 'string' ? values.images.split('\n').map(i => i.trim()).filter(Boolean) : values.images || [],
        facilities: typeof values.facilities === 'string' ? values.facilities.split(',').map(f => f.trim()).filter(Boolean) : values.facilities || [],
        location: {
          lat: Number(values.locationLat),
          lng: Number(values.locationLng),
        },
        roomTypes: roomTypes.length > 0 ? roomTypes : [
          { name: '标准间', price: 200, area: 25, bedType: '大床 1.8m', maxOccupancy: 2, amenities: ['WiFi', '空调'] },
        ],
        openingDate: values.openingDate ? dayjs(values.openingDate).format('YYYY-MM-DD') : undefined,
        starLevel: values.starLevel ? Number(values.starLevel) : undefined,
      };

      // 移除表单专用字段
      delete formattedValues.locationLat;
      delete formattedValues.locationLng;

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

    // 转换房型数据用于表单
    const roomTypes = (record.roomTypes || []).map(rt => ({
      name: rt.name,
      area: typeof rt.area === 'string' ? parseFloat(rt.area) || 0 : rt.area,
      price: rt.price,
      bedType: rt.bedType || rt.beds || '',
      maxOccupancy: rt.maxOccupancy ?? rt.maxGuests ?? 2,
      amenities: Array.isArray(rt.amenities) ? rt.amenities.join(', ') : '',
    }));

    const formValue = {
      ...record,
      locationLat: record.location?.lat,
      locationLng: record.location?.lng,
      location: undefined,
      roomTypes: roomTypes.length > 0 ? roomTypes : [{ name: '标准间', area: 25, price: 200, bedType: '大床 1.8m', maxOccupancy: 2, amenities: 'WiFi, 空调' }],
      openingDate: record.openingDate ? dayjs(record.openingDate) : undefined,
      starLevel: record.starLevel,
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
    form.setFieldsValue({
      roomTypes: [{ name: '标准间', area: 25, price: 200, bedType: '大床 1.8m', maxOccupancy: 2, amenities: 'WiFi, 空调' }],
    });
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'name',
      key: 'name',
      width: 160,
    },
    {
      title: '星级',
      dataIndex: 'starLevel',
      key: 'starLevel',
      width: 80,
      render: (v: number) => v ? `${v}星` : '-',
    },
    {
      title: '开业时间',
      dataIndex: 'openingDate',
      key: 'openingDate',
      width: 110,
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      ellipsis: true,
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
      title: '拒绝原因',
      dataIndex: 'rejectionReason',
      key: 'rejectionReason',
      width: 200,
      ellipsis: true,
      render: (reason: string, record: Hotel) =>
        record.status === 'rejected' && reason ? (
          <span title={reason} style={{ color: '#dc2626', fontSize: 12 }}>
            <ExclamationCircleOutlined style={{ marginRight: 4 }} />
            {reason}
          </span>
        ) : (
          '-'
        ),
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
        scroll={{ x: 1300 }}
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
        width={900}
        okText="确定"
        cancelText="取消"
      >
        {editingId && (() => {
          const editingHotel = hotels.find(h => h.id === editingId);
          if (editingHotel?.status === 'rejected' && editingHotel?.rejectionReason) {
            return (
              <div
                style={{
                  marginBottom: 16,
                  padding: 12,
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 8,
                  color: '#dc2626',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  <ExclamationCircleOutlined style={{ marginRight: 6 }} />
                  审核拒绝原因
                </div>
                <div style={{ fontSize: 14 }}>{editingHotel.rejectionReason}</div>
              </div>
            );
          }
          return null;
        })()}
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

          <Space style={{ width: '100%' }} size="middle">
            <Form.Item
              name="openingDate"
              label="开业时间"
            >
              <DatePicker style={{ width: '100%' }} placeholder="选择开业日期" />
            </Form.Item>
            <Form.Item
              name="starLevel"
              label="酒店星级"
              rules={[{ required: true, message: '请选择星级' }]}
            >
              <Select placeholder="请选择星级（1-5星）" allowClear>
                {[1, 2, 3, 4, 5].map(n => (
                  <Select.Option key={n} value={n}>{n}星</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Space>

          <Form.Item
            label="房型信息"
            required
            rules={[{ validator: (_, value) => (value?.length > 0 ? Promise.resolve() : Promise.reject(new Error('请至少添加一个房型'))) }]}
          >
            <Form.List name="roomTypes" initialValue={[{ name: '标准间', area: 25, price: 200, bedType: '大床 1.8m', maxOccupancy: 2, amenities: 'WiFi, 空调' }]}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                      <Form.Item {...restField} name={[name, 'name']} rules={[{ required: true, message: '房型' }]} style={{ marginBottom: 0, width: 120 }}>
                        <Input placeholder="房型名称" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'area']} rules={[{ required: true, message: '面积' }]} style={{ marginBottom: 0, width: 80 }}>
                        <Input type="number" placeholder="面积㎡" min={1} />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'price']} rules={[{ required: true, message: '价格' }]} style={{ marginBottom: 0, width: 100 }}>
                        <Input type="number" placeholder="价格元/晚" min={0} />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'bedType']} style={{ marginBottom: 0, width: 120 }}>
                        <Input placeholder="床型" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'maxOccupancy']} style={{ marginBottom: 0, width: 80 }}>
                        <Input type="number" placeholder="人数" min={1} />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'amenities']} style={{ marginBottom: 0, flex: 1, minWidth: 120 }}>
                        <Input placeholder="设施，逗号分隔" />
                      </Form.Item>
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                    </div>
                  ))}
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      添加房型
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>

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
