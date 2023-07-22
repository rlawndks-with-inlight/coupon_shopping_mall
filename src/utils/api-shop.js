import { get, post, put, deleteItem } from './api-manager';

export const getCategoriesByUser = (params) => {
  const { brand_id } = params;
  let query = {
    brand_id
  }
  return get(`/api/v1/shop/shop`, query);
}
export const getProductsByUser = (params) => {
  const { brand_id, category_id } = params;
  let query = {
    brand_id, category_id
  }
  return get(`/api/v1/shop/shop/category`, query);
}
export const getProductByUser = (params) => {
  const { product_id } = params;
  let query = {
    product_id
  }
  return get(`/api/v1/shop/shop/product`, query);
}
