/**
 * mini-app/src/hooks/useLocation.ts
 * LBS定位Hook
 */

import { useState, useCallback } from 'react';
import { useLocationStore } from '@/store/useLocationStore';
import { getLocationApi } from '@/services/api';

/**
 * 定位Hook
 */
export const useLocation = () => {
  const { location, loading, error, setLocation, setLoading, setError } = useLocationStore();

  /**
   * 获取当前位置
   */
  const getLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const loc = await getLocationApi();
      setLocation(loc);
    } catch (err: any) {
      setError(err.message || '定位失败');
    } finally {
      setLoading(false);
    }
  }, [setLocation, setLoading, setError]);

  /**
   * 清除定位
   */
  const clearLocation = useCallback(() => {
    // 由store处理
  }, []);

  return {
    location,
    loading,
    error,
    getLocation,
    clearLocation,
  };
};
