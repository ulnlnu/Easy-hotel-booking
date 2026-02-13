/**
 * admin/src/utils/index.ts
 * 工具函数
 */

/**
 * 格式化日期
 */
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 格式化日期为简短形式
 */
export const formatShortDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN');
};

/**
 * 将逗号分隔的字符串转为数组
 */
export const parseCommaSeparated = (str: string): string[] => {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
};

/**
 * 将数组转为逗号分隔的字符串
 */
export const toCommaSeparated = (arr: string[]): string => {
  return arr.join(',');
};

/**
 * 处理图片URL字符串（换行分隔转为数组）
 */
export const parseImageUrls = (str: string): string[] => {
  if (!str) return [];
  return str.split('\n').map(s => s.trim()).filter(Boolean);
};

/**
 * 将图片URL数组转为换行分隔的字符串
 */
export const toImageUrlsString = (arr: string[]): string => {
  return arr.join('\n');
};
