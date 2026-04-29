import { useState, useEffect } from 'react';
import { useSettingsContext } from 'src/components/settings';
import { apiShop } from 'src/utils/api';

/**
 * 대표 상품을 반환하는 훅
 * 1. setting_obj.featured_product_id가 있으면 API로 직접 조회
 * 2. 없으면 themeDnsData.products[0]
 */
export const useFeaturedProduct = () => {
  const { themeDnsData } = useSettingsContext();
  const [fetchedProduct, setFetchedProduct] = useState(null);
  const products = themeDnsData?.products ?? [];
  const featuredId = themeDnsData?.setting_obj?.featured_product_id;

  useEffect(() => {
    if (!featuredId) {
      setFetchedProduct(null);
      return;
    }
    // 먼저 products 배열에서 찾고, 없으면 API 호출
    const found = products.find(p => String(p?.id) === String(featuredId));
    if (found) {
      setFetchedProduct(found);
    } else {
      apiShop('product', 'get', { id: featuredId }).then(result => {
        if (result) setFetchedProduct(result);
      }).catch(() => {});
    }
  }, [featuredId, products?.length]);

  if (featuredId && fetchedProduct) return fetchedProduct;
  if (featuredId) {
    const found = products.find(p => String(p?.id) === String(featuredId));
    if (found) return found;
  }
  return products[0];
};
