import { useState, useEffect } from 'react';
import { useSettingsContext } from 'src/components/settings';
import { apiShop } from 'src/utils/api';
import { formatLang } from 'src/utils/format';

const fixImgUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  return url;
};

// setting_obj에서 대표 상품 id 목록을 정규화 (신규 featured_product_ids 우선, 없으면 legacy featured_product_id 1개)
const getFeaturedIds = (setting_obj) => {
  const ids = setting_obj?.featured_product_ids;
  if (Array.isArray(ids) && ids.length > 0) return ids;
  const single = setting_obj?.featured_product_id;
  return single ? [single] : [];
};

/**
 * 대표 상품 1개를 반환하는 훅 (단일 상품 데모의 히어로용)
 * 1. featured_product_ids[0] 또는 legacy featured_product_id가 있으면 조회
 * 2. 없으면 themeDnsData.products[0]
 */
export const useFeaturedProduct = () => {
  const { themeDnsData } = useSettingsContext();
  const [fetchedProduct, setFetchedProduct] = useState(null);
  const products = themeDnsData?.products ?? [];
  const featuredId = getFeaturedIds(themeDnsData?.setting_obj)[0];

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

/**
 * 대표 상품 목록(1~N)을 반환하는 훅 (소수 상품 데모의 하단 그리드용)
 * setting_obj.featured_product_ids를 themeDnsData.products에서 해석한다.
 * 지정이 없거나 1개뿐이면 빈 배열을 반환 → 그리드 미노출(단일 상품 데모 기존 동작 그대로 유지).
 * @param {{ excludeId?: any, limit?: number }} opts
 */
export const useFeaturedProducts = ({ excludeId, limit } = {}) => {
  const { themeDnsData } = useSettingsContext();
  const products = themeDnsData?.products ?? [];
  const ids = themeDnsData?.setting_obj?.featured_product_ids;
  // 대표 상품을 2개 이상 명시적으로 지정한 경우에만 그리드를 구성한다.
  if (!Array.isArray(ids) || ids.length < 2) return [];
  let list = ids
    .map(id => products.find(p => String(p?.id) === String(id)))
    .filter(Boolean);
  if (excludeId !== undefined && excludeId !== null) {
    list = list.filter(p => String(p?.id) !== String(excludeId));
  }
  if (limit) list = list.slice(0, limit);
  return list;
};

/**
 * 대표 상품 카드 렌더에 필요한 파생값 계산 (fixImgUrl·가격·할인율 중복 제거용 공용 헬퍼)
 */
export const getFeaturedCardData = (item, currentLang) => {
  const img = fixImgUrl(item?.product_img);
  const name = formatLang(item, 'product_name', currentLang);
  const sale = item?.product_sale_price || item?.product_price || 0;
  const orig = item?.product_price || 0;
  const hasSale = orig > sale && sale > 0;
  const disc = hasSale ? Math.round((orig - sale) * 100 / orig) : 0;
  return { id: item?.id, img, name, sale, orig, hasSale, disc };
};
