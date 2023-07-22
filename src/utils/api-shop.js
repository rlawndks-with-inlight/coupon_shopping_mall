import { get, post, put, deleteItem } from './api-manager';

export const getCategoriesByUser = (params) => { // 유저 상품 카테고리 출력
  const { brand_id } = params;
  let query = {
    brand_id
  }
  return get(`/api/v1/shop/shop`, query);
}
export const getProductsByUser = (params) => { // 유저 카테고리 기반 상품 목록 출력
  const { brand_id, category_id } = params;
  let query = {
    brand_id, category_id
  }
  return get(`/api/v1/shop/shop/category`, query);
}
export const getProductByUser = (params) => { // 유저 상품 단일 출력
  const { product_id } = params;
  let query = {
    product_id
  }
  return get(`/api/v1/shop/shop/product`, query);
}
