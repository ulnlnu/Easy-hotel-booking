/**
 * mini-app/src/hooks/useRequest.ts
 * 请求Hook - 封装异步请求状态
 */

import { useState, useCallback } from 'react';

interface UseRequestOptions<T> {
  manual?: boolean; // 是否手动触发
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

interface UseRequestResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  run: (...args: any[]) => Promise<void>;
  reset: () => void;
}

/**
 * 请求Hook
 */
export const useRequest = <T = any>(
  serviceFunc: (...args: any[]) => Promise<T>,
  options: UseRequestOptions<T> = {}
): UseRequestResult<T> => {
  const { manual = false, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 执行请求
   */
  const run = useCallback(
    async (...args: any[]) => {
      setLoading(true);
      setError(null);

      try {
        const result = await serviceFunc(...args);
        setData(result);
        onSuccess?.(result);
      } catch (err: any) {
        const errorMessage = err?.message || '请求失败';
        setError(errorMessage);
        onError?.(err);
      } finally {
        setLoading(false);
      }
    },
    [serviceFunc, onSuccess, onError]
  );

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // 自动执行（非手动模式）
  useEffect(() => {
    if (!manual) {
      run();
    }
  }, [manual, run]);

  return {
    data,
    loading,
    error,
    run,
    reset,
  };
};
