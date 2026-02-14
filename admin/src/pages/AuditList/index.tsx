/**
 * admin/src/pages/AuditList/index.tsx
 * 审核/发布/下线列表页面
 */

import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, message, Tabs, Radio } from 'antd';
import { CheckOutlined, CloseOutlined, StopOutlined, EyeOutlined } from '@ant-design/icons';
import { getHotelListApi, auditHotelApi, updateHotelStatusApi } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import type { Hotel } from '@shared/types/hotel';
import { UserRole } from '@shared/types/user';
import { HotelStatus } from '@shared/types/hotel';
import './index.scss';

function AuditList() {
  const { user } = useAuthStore(); // ✅ 获取当前登录用户
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [activeTab, setActiveTab] = useState('pending');

  const [auditModalVisible, setAuditModalVisible] = useState(false);
  const [currentHotel, setCurrentHotel] = useState<Hotel | null>(null);
  const [auditForm] = Form.useForm();

  // ✅ 查看拒绝原因的 Modal
  const [reasonModalVisible, setReasonModalVisible] = useState(false);
  const [currentReason, setCurrentReason] = useState<string>('');

  useEffect(() => {
    fetchHotels();
  }, [activeTab]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const statusMap: Record<string, HotelStatus> = {
        pending: HotelStatus.PENDING,
        approved: HotelStatus.APPROVED,
        rejected: HotelStatus.REJECTED,
        offline: HotelStatus.OFFLINE,
      };

      const params: any = {
        page: 1,
        pageSize: 100,
        includeAll: true,
      };

      // ✅ 酒店管理员只能看到自己创建的酒店
      if (user?.role === UserRole.HOTEL_ADMIN) {
        params.createdBy = user.id;
      }

      const response = await getHotelListApi(params);

      if (response.success) {
        // 根据当前标签页筛选
        const filtered = response.data.filter(h => h.status === statusMap[activeTab]);
        setHotels(filtered);
      }
    } catch (error: any) {
      message.error(error.message || '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAudit = (hotel: Hotel) => {
    setCurrentHotel(hotel);
    setAuditModalVisible(true);
  };

  const handleAuditSubmit = async () => {
    const values = await auditForm.validateFields();
    if (!currentHotel) return;

    setLoading(true);
    try {
      const response = await auditHotelApi(
        currentHotel.id,
        values.action,
        values.reason
      );
      if (response.success) {
        message.success(response.message);
        setAuditModalVisible(false);
        auditForm.resetFields();
        fetchHotels();
      }
    } catch (error: any) {
      message.error(error.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReason = (hotel: Hotel) => {
    setCurrentReason(hotel.rejectionReason || '无拒绝原因');
    setReasonModalVisible(true);
  };

  const handleStatusChange = async (hotel: Hotel, status: 'online' | 'offline') => {
    setLoading(true);
    try {
      const response = await updateHotelStatusApi(hotel.id, status);
      if (response.success) {
        message.success(response.message);
        fetchHotels();
      }
    } catch (error: any) {
      message.error(error.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
      width: 100,
    },
    {
      title: '房型数量',
      dataIndex: 'roomTypes',
      key: 'roomTypes',
      width: 100,
      render: (roomTypes: any[]) => roomTypes?.length || 0,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: Hotel) => (
        <Space>
          {record.status === HotelStatus.PENDING && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleAudit(record)}
              >
                审核
              </Button>
            </>
          )}
          {record.status === HotelStatus.APPROVED && (
            <Button
              type="link"
              danger
              icon={<StopOutlined />}
              onClick={() => handleStatusChange(record, 'offline')}
            >
              下线
            </Button>
          )}
          {record.status === HotelStatus.OFFLINE && (
            <Button
              type="link"
              icon={<CheckOutlined />}
              onClick={() => handleStatusChange(record, 'online')}
            >
              上线
            </Button>
          )}
          {record.status === HotelStatus.REJECTED && (
            <>
              <Tag color="red">已拒绝</Tag>
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => handleViewReason(record)}
              >
                查看拒绝原因
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: 'pending', label: `待审核 (${hotels.filter(h => h.status === HotelStatus.PENDING).length})` },
    { key: 'approved', label: `已通过 (${hotels.filter(h => h.status === HotelStatus.APPROVED).length})` },
    { key: 'rejected', label: `已拒绝 (${hotels.filter(h => h.status === HotelStatus.REJECTED).length})` },
    { key: 'offline', label: `已下线 (${hotels.filter(h => h.status === HotelStatus.OFFLINE).length})` },
  ];

  return (
    <div className="audit-list-page">
      <div className="page-header">
        <h2>审核管理</h2>
      </div>

      <Tabs activeKey={activeTab} items={tabItems} onChange={setActiveTab} />

      <Table
        columns={columns}
        dataSource={hotels.filter(h => {
          if (activeTab === 'pending') return h.status === HotelStatus.PENDING;
          if (activeTab === 'approved') return h.status === HotelStatus.APPROVED;
          if (activeTab === 'rejected') return h.status === HotelStatus.REJECTED;
          if (activeTab === 'offline') return h.status === HotelStatus.OFFLINE;
          return true;
        })}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title="酒店审核"
        open={auditModalVisible}
        onOk={handleAuditSubmit}
        onCancel={() => {
          setAuditModalVisible(false);
          auditForm.resetFields();
        }}
        okText="确定"
        cancelText="取消"
      >
        {currentHotel && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <p>
                <strong>酒店名称：</strong>
                {currentHotel.name}
              </p>
              <p>
                <strong>地址：</strong>
                {currentHotel.address}
              </p>
            </div>

            <Form form={auditForm} layout="vertical">
              <Form.Item
                name="action"
                label="审核结果"
                rules={[{ required: true, message: '请选择审核结果' }]}
              >
                <Radio.Group>
                  <Radio value="approve">通过</Radio>
                  <Radio value="reject">拒绝</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="reason"
                label="拒绝原因（可选）"
                dependencies={['action']}
              >
                <Input.TextArea
                  placeholder="请输入拒绝原因"
                  rows={3}
                  disabled={auditForm.getFieldValue('action') !== 'reject'}
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* ✅ 查看拒绝原因的 Modal */}
      <Modal
        title="拒绝原因"
        open={reasonModalVisible}
        onCancel={() => setReasonModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setReasonModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        <p style={{ fontSize: 16, lineHeight: 1.8 }}>
          {currentReason}
        </p>
      </Modal>
    </div>
  );
}

export default AuditList;
