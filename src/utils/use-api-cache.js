import useSWR from 'swr';
import { apiShop, apiManager } from './api';

// SWR fetcher for apiShop
const shopFetcher = ([table, type, params]) => {
  if (type === 'list') return apiShop(table, 'list', params);
  if (type === 'get') return apiShop(table, 'get', params);
  return null;
};

// SWR fetcher for apiManager
const managerFetcher = ([table, type, params]) => {
  if (type === 'list') return apiManager(table, 'list', params);
  if (type === 'get') return apiManager(table, 'get', params);
  return null;
};

/**
 * SWR-cached apiShop hook
 * - 동일 key 요청 중복 제거 (2000명이 같은 상품 조회 시 브라우저당 1회만)
 * - 30초간 캐시 유지 (stale-while-revalidate)
 * - 탭 포커스 시 자동 갱신
 */
export function useShopAPI(table, type, params, options = {}) {
  const key = params ? [table, type, params] : null;
  const { data, error, isLoading, mutate } = useSWR(key, shopFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
    ...options,
  });
  return { data, error, isLoading, mutate };
}

/**
 * SWR-cached apiManager hook
 */
export function useManagerAPI(table, type, params, options = {}) {
  const key = params ? [table, type, params] : null;
  const { data, error, isLoading, mutate } = useSWR(key, managerFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
    ...options,
  });
  return { data, error, isLoading, mutate };
}
