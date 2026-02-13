/**
 * admin/src/components/ImageUpload/index.tsx
 * 图片上传组件（简化版，输入URL）
 */

import { useState } from 'react';
import { Input, Button, Space, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { parseImageUrls, toImageUrlsString } from '@/utils';
import './index.scss';

interface ImageUploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxCount?: number;
}

function ImageUpload({ value = [], onChange, maxCount = 5 }: ImageUploadProps) {
  const [inputValue, setInputValue] = useState('');
  const [urls, setUrls] = useState<string[]>(value);

  const handleAdd = () => {
    if (!inputValue.trim()) {
      message.warning('请输入图片URL');
      return;
    }

    if (urls.length >= maxCount) {
      message.warning(`最多上传${maxCount}张图片`);
      return;
    }

    const newUrls = [...urls, inputValue.trim()];
    setUrls(newUrls);
    onChange?.(newUrls);
    setInputValue('');
  };

  const handleRemove = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls);
    onChange?.(newUrls);
  };

  return (
    <div className="image-upload">
      <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
        <Input
          placeholder="请输入图片URL"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onPressEnter={handleAdd}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加
        </Button>
      </Space.Compact>

      <div className="image-list">
        {urls.map((url, index) => (
          <div key={index} className="image-item">
            <img src={url} alt={`图片${index + 1}`} />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRemove(index)}
              className="delete-btn"
            >
              删除
            </Button>
          </div>
        ))}
      </div>
      <div className="image-count">
        {urls.length} / {maxCount}
      </div>
    </div>
  );
}

export default ImageUpload;
