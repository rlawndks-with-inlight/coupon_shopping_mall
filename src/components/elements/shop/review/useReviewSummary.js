import { useCallback, useEffect, useState } from 'react';
import { apiManager } from 'src/utils/api';

// 상품 하나의 후기 요약(평균·건수·분포·사진). 상세의 탭 라벨·별점 줄·후기 영역이 같은 값을 쓰므로
// 60초 동안은 한 번만 부른다(같은 화면에서 셋이 각각 부르면 세 번 나간다).
const cache = new Map(); // product_id → { at, data }
const TTL = 60 * 1000;

export const clearReviewSummary = (productId) => { if (productId) cache.delete(String(productId)); else cache.clear(); };

export default function useReviewSummary(productId, enabled = true) {
  const [summary, setSummary] = useState(() => {
    const hit = cache.get(String(productId));
    return hit && Date.now() - hit.at < TTL ? hit.data : null;
  });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async (force = false) => {
    if (!enabled || !productId) return null;
    const key = String(productId);
    const hit = cache.get(key);
    if (!force && hit && Date.now() - hit.at < TTL) { setSummary(hit.data); return hit.data; }
    setLoading(true);
    const data = await apiManager('product-reviews/summary', 'list', { product_id: productId });
    setLoading(false);
    if (data) { cache.set(key, { at: Date.now(), data }); setSummary(data); }
    return data || null;
  }, [productId, enabled]);

  useEffect(() => { refresh(); }, [refresh]);

  return { summary, loading, refresh };
}
