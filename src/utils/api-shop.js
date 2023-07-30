import { get, post, put, deleteItem } from './api-manager';

export const getShopCategoriesByUser = (params) => { // 유저 연결되어있는 하위 카테고리가 모두 출력됩니다. (게시글 카테고리, 상품 카테고리) 팝업 정보가 출력됩니다.
  const { brand_id, root_id } = params;
  let query = {
    brand_id,
    root_id
  }
  return get(`/api/v1/shop/shop`, query);
}
export const getProductsByUser = (params) => { // 유저 카테고리 기반 상품 목록 출력
  const { category_id, page = 1, page_size = 10 } = params;
  let query = {
    category_id, page, page_size
  }
  if(!category_id){
    delete query['category_id'];
  }
  return get(`/api/v1/shop/shop/product-categories`, query);
}
export const getPostsByUser = (params) => { // 유저 카테고리 기반 게시글 목록 출력
  const { category_id, page = 1, page_size = 10 } = params;
  let query = {
    category_id, page, page_size
  }
  if(!category_id){
    delete query['category_id'];
  }
  return get(`/api/v1/shop/shop/post-categories`, query);
}
export const getProductByUser = (params) => { // 유저 상품 단일 출력
  const { product_id } = params;
  let query = {
    product_id
  }
  return get(`/api/v1/shop/shop/products/${product_id}`, {});
}
export const getProductReviewsByUser = (params) => { // 유저 상품 리뷰 출력
  const { product_id, page = 1, page_size = 10 } = params;
  let query = {
    page, page_size
  }
  return get(`/api/v1/shop/shop/products/${product_id}/reviews`, query);
}
export const getPostByUser = (params) => { // 유저 게시글 단일 출력
  const { post_id } = params;
  let query = {
    post_id
  }
  return get(`/api/v1/shop/shop/posts/${post_id}`, {});
}
