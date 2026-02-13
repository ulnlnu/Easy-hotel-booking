/**
 * admin/src/components/PageHeader/index.tsx
 * 页面头部组件
 */

import { ReactNode } from 'react';
import { Breadcrumb } from 'antd';
import type { BreadcrumbProps } from 'antd';
import './index.scss';

interface PageHeaderProps {
  title: string;
  extra?: ReactNode;
  breadcrumb?: BreadcrumbProps['items'];
  subtitle?: string;
}

function PageHeader({ title, extra, breadcrumb, subtitle }: PageHeaderProps) {
  return (
    <div className="page-header-wrapper">
      {breadcrumb && (
        <Breadcrumb
          items={breadcrumb}
          style={{ marginBottom: 12 }}
        />
      )}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-header-title">
            <h2>{title}</h2>
            {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
          </div>
        </div>
        {extra && <div className="page-header-right">{extra}</div>}
      </div>
    </div>
  );
}

export default PageHeader;
