import { useCallback, useEffect, useState } from 'react';
import { apiManager } from 'src/utils/api';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useSettingsContext } from 'src/components/settings';
import { isReviewEnabled } from 'src/utils/review';

// 내 주문 줄마다 '후기를 쓸 수 있나'(서버 판정). 주문내역 화면이 한 번 불러 줄마다 버튼을 그린다.
// 반환 { byOrder: { [order_id]: line }, lines, writableCount, refresh, ready }
export default function useReviewWritable({ productId } = {}) {
  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const enabled = isReviewEnabled(themeDnsData);
  const [data, setData] = useState(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled || !(user?.id > 0)) { setData(null); setReady(true); return null; }
    const res = await apiManager('product-reviews/writable', 'list', productId ? { product_id: productId } : {});
    setData(res || null);
    setReady(true);
    return res || null;
  }, [enabled, user?.id, productId]);

  useEffect(() => { refresh(); }, [refresh]);

  const lines = data?.lines ?? [];
  const byOrder = {};
  for (const l of lines) byOrder[l.order_id] = l;
  return { byOrder, lines, writableCount: data?.writable_count ?? 0, refresh, ready, enabled };
}
