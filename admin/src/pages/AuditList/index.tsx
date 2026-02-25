/**
 * admin/src/pages/AuditList/index.tsx
 * 审核/发布/下线列表页面
 */

import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, message, Tabs, Radio, Tooltip } from 'antd';
import { CheckOutlined, StopOutlined, EyeOutlined } from '@ant-design/icons';
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
  const [allHotels, setAllHotels] = useState<Hotel[]>([]);
  const [activeTab, setActiveTab] = useState('pending');

  const [auditModalVisible, setAuditModalVisible] = useState(false);
  const [currentHotel, setCurrentHotel] = useState<Hotel | null>(null);
  const [auditForm] = Form.useForm();
  const auditAction = Form.useWatch('action', auditForm);

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
        // 保存完整列表用于统计各状态数量
        setAllHotels(response.data);

        // 根据当前标签页筛选展示数据
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
      title: '星级',
      dataIndex: 'starLevel',
      key: 'starLevel',
      width: 70,
      render: (v: number) => v ? `${v}星` : '-',
    },
    {
      title: '开业时间',
      dataIndex: 'openingDate',
      key: 'openingDate',
      width: 110,
      render: (v: string) => v ? new Date(v).toLocaleDateString('zh-CN') : '-',
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
      title: '房型/价格',
      dataIndex: 'roomTypes',
      key: 'roomTypes',
      width: 140,
      render: (roomTypes: any[]) => {
        if (!roomTypes?.length) return '-';
        const prices = roomTypes.map((r: any) => r.price);
        return `${roomTypes.length}种 · ¥${Math.min(...prices)}起`;
      },
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
            <Tooltip title="下线仅隐藏展示，不删除数据，可随时在「已下线」中恢复上线">
              <Button
                type="link"
                danger
                icon={<StopOutlined />}
                onClick={() => handleStatusChange(record, 'offline')}
              >
                下线
              </Button>
            </Tooltip>
          )}
          {record.status === HotelStatus.OFFLINE && (
            <Tooltip title="恢复展示，酒店将重新对用户可见">
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleStatusChange(record, 'online')}
              >
                上线
              </Button>
            </Tooltip>
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
    { key: 'pending', label: `待审核 (${allHotels.filter(h => h.status === HotelStatus.PENDING).length})` },
    { key: 'approved', label: `已通过 (${allHotels.filter(h => h.status === HotelStatus.APPROVED).length})` },
    { key: 'rejected', label: `已拒绝 (${allHotels.filter(h => h.status === HotelStatus.REJECTED).length})` },
    { key: 'offline', label: `已下线 (${allHotels.filter(h => h.status === HotelStatus.OFFLINE).length})` },
  ];

  return (
    <div className="audit-list-page">
      <div className="page-header">
        <h2>审核管理</h2>
      </div>
      <p style={{ marginBottom: 16, fontSize: 13, color: '#64748b' }}>
        已通过的酒店可执行「下线」：仅隐藏展示、不删除数据，可随时在「已下线」中恢复「上线」。
      </p>

      <Tabs activeKey={activeTab} items={tabItems} onChange={setActiveTab} />

      <Table
        key={activeTab}
        columns={columns}
        dataSource={allHotels.filter(h => {
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
        width={680}
        className="audit-modal"
      >
        {currentHotel && (
          <div className="audit-modal-content">
            {/* 酒店信息卡片 */}
            <div className="audit-hotel-info">
              <div className="audit-hotel-header">
                <div className="audit-hotel-name">{currentHotel.name}</div>
                {currentHotel.starLevel && (
                  <Tag color="gold" className="audit-hotel-star">{currentHotel.starLevel}星级酒店</Tag>
                )}
              </div>

              <div className="audit-hotel-details">
                <div className="audit-detail-item">
                  <span className="audit-detail-label">地址</span>
                  <span className="audit-detail-value">{currentHotel.address}</span>
                </div>
                <div className="audit-detail-row">
                  <div className="audit-detail-item audit-detail-half">
                    <span className="audit-detail-label">开业时间</span>
                    <span className="audit-detail-value">
                      {currentHotel.openingDate ? new Date(currentHotel.openingDate).toLocaleDateString('zh-CN') : '未填写'}
                    </span>
                  </div>
                  <div className="audit-detail-item audit-detail-half">
                    <span className="audit-detail-label">所在城市</span>
                    <span className="audit-detail-value">{currentHotel.city || '未填写'}</span>
                  </div>
                </div>
              </div>

              {/* 房型信息 */}
              <div className="audit-room-section">
                <div className="audit-room-title">房型及价格</div>
                {(currentHotel.roomTypes || []).length > 0 ? (
                  <div className="audit-room-list">
                    {currentHotel.roomTypes.map((rt, i) => (
                      <div key={rt.id || i} className="audit-room-item">
                        <div className="audit-room-name">{rt.name}</div>
                        <div className="audit-room-info">
                          <span className="audit-room-price">¥{rt.price}/晚</span>
                          {rt.area && <span className="audit-room-area">{typeof rt.area === 'number' ? rt.area : rt.area}㎡</span>}
                          {(rt.bedType || rt.beds) && <span className="audit-room-bed">{rt.bedType || rt.beds}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="audit-room-empty">暂无房型信息</div>
                )}
              </div>
            </div>

            {/* 审核表单 */}
            <div className="audit-form-section">
              <Form form={auditForm} layout="vertical">
                <Form.Item
                  name="action"
                  label="审核结果"
                  rules={[{ required: true, message: '请选择审核结果' }]}
                >
                  <Radio.Group className="audit-radio-group">
                    <Radio value="approve" className="audit-radio-approve">通过</Radio>
                    <Radio value="reject" className="audit-radio-reject">拒绝</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  name="reason"
                  label="拒绝原因"
                  dependencies={['action']}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (getFieldValue('action') !== 'reject') return Promise.resolve();
                        if (value && String(value).trim()) return Promise.resolve();
                        return Promise.reject(new Error('审核不通过时必须填写拒绝理由'));
                      },
                    }),
                  ]}
                >
                  <Input.TextArea
                    placeholder="请输入拒绝原因（拒绝时必填）"
                    rows={3}
                    disabled={auditAction !== 'reject'}
                    className="audit-reason-input"
                  />
                </Form.Item>
              </Form>
            </div>
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
