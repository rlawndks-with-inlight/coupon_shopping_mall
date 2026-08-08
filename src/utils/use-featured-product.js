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

// 한 번에 불러올 브랜드 판매 상품 수.
//  이 훅을 쓰는 데모(블로그 4~9)는 단일·소수 상품용이라 이 정도면 실제 가맹점은 전부 들어온다.
//  ※ 이 목록 API 는 products.* 를 내려주므로(product_description 포함) 크게 잡으면 홈 응답이 무거워진다.
//    상품이 이 수를 넘는 브랜드에서 목록 밖의 상품을 대표상품으로 지정하면 하단 그리드에서만 빠진다
//    (메인 히어로는 아래 useFeaturedProduct 가 id 로 상세를 직접 조회하므로 영향 없다).
const BRAND_PRODUCTS_SIZE = 20;

/**
 * 브랜드의 실제 판매 상품 목록 조회 (필요할 때만).
 * themeDnsData.products 는 shop.controller.setting 이 shop_obj/blog_obj(홈 섹션)에
 * 배치된 상품 id 만 IN 절에 넣어 만든 목록이라, 섹션 배치 UI 가 없는 블로그 4~9 프레임에서는 항상 0건이다.
 * → 대표 상품 id 를 그 목록에서 못 풀면 여기서 스토어프론트 공개 목록으로 보충한다.
 */
const useBrandProducts = (enabled) => {
  const [list, setList] = useState([]);
  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    apiShop('product', 'list', { page: 1, page_size: BRAND_PRODUCTS_SIZE })
      .then((result) => {
        if (alive && result?.content) setList(result.content);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [enabled]);
  return list;
};

/**
 * 대표 상품 1개를 반환하는 훅 (단일 상품 데모의 히어로용)
 * 1. featured_product_ids[0] 또는 legacy featured_product_id가 있으면 조회
 * 2. 없으면 themeDnsData.products[0]
 * 3. 그것도 없으면 브랜드 판매 상품의 첫 번째 (지정 전에도 홈이 '준비중'으로 남지 않게)
 */
export const useFeaturedProduct = () => {
  const { themeDnsData } = useSettingsContext();
  const [fetchedProduct, setFetchedProduct] = useState(null);
  const products = themeDnsData?.products ?? [];
  const featuredId = getFeaturedIds(themeDnsData?.setting_obj)[0];
  // 대표상품 지정도 없고 홈 섹션 상품도 없을 때(= 지금까지 '준비중'만 뜨던 경우)에만 보충 조회한다.
  const brandProducts = useBrandProducts(!featuredId && products.length === 0);

  useEffect(() => {
    if (!featuredId) {
      setFetchedProduct(null);
      return;
    }
    // sub_images(서브이미지) 등 전체 필드는 list 데이터에 없으므로 항상 상세를 조회한다.
    apiShop('product', 'get', { id: featuredId }).then(result => {
      if (result) setFetchedProduct(result);
    }).catch(() => {});
  }, [featuredId]);

  if (featuredId && fetchedProduct) return fetchedProduct;
  if (featuredId) {
    // 상세 로드 전 임시로 list 데이터 사용(대표이미지·가격 등만, 서브이미지는 상세 로드 후)
    const found = products.find(p => String(p?.id) === String(featuredId));
    if (found) return found;
  }
  return products[0] ?? brandProducts[0];
};

/**
 * 대표 상품 목록(1~N)을 반환하는 훅 (소수 상품 데모의 하단 그리드용)
 * setting_obj.featured_product_ids를 themeDnsData.products에서 해석하고,
 * 거기서 못 풀린 id는 브랜드 판매 상품 목록으로 보충한다.
 * 지정이 없거나 1개뿐이면 빈 배열을 반환 → 그리드 미노출(단일 상품 데모 기존 동작 그대로 유지).
 * @param {{ excludeId?: any, limit?: number }} opts
 */
export const useFeaturedProducts = ({ excludeId, limit } = {}) => {
  const { themeDnsData } = useSettingsContext();
  const products = themeDnsData?.products ?? [];
  const ids = themeDnsData?.setting_obj?.featured_product_ids;
  // 대표 상품을 2개 이상 명시적으로 지정한 경우에만 그리드를 구성한다.
  const featuredIds = (Array.isArray(ids) && ids.length >= 2) ? ids.map(id => String(id)) : [];
  // 지정된 id 중 하나라도 themeDnsData.products 로 못 풀면 브랜드 판매 상품을 조회해 보충한다.
  //  (섹션 배치 UI 가 없는 프레임에서는 products 가 항상 비어 있어 그리드가 통째로 사라졌다.)
  //  ※ 훅 호출 순서가 흔들리지 않도록 조기 return 보다 위에서 호출한다.
  const needFetch = featuredIds.some(id => !products.some(p => String(p?.id) === id));
  const brandProducts = useBrandProducts(needFetch);

  if (featuredIds.length === 0) return [];
  const pool = [...products, ...brandProducts];
  let list = featuredIds
    .map(id => pool.find(p => String(p?.id) === id))
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
