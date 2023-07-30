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
  if (!category_id) {
    delete query['category_id'];
  }
  return get(`/api/v1/shop/shop/product-categories`, query);
}
export const getPostsByUser = (params) => { // 유저 카테고리 기반 게시글 목록 출력
  const { category_id, page = 1, page_size = 10 } = params;
  let query = {
    category_id, page, page_size
  }
  if (!category_id) {
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
export const sendPhoneVerifyCodeByUser = (params) => { // 유저 휴대폰 인증번호 전송
  const { dns = window.location.host.split(':')[0], phone_num } = params;
  let obj = {
    dns, phone_num
  }
  return post(`/api/v1/shop/auth/verify/code`, obj);
}
export const checkPhoneVerifyCodeByUser = (params) => { // 유저 휴대폰 인증번호 확인
  const { phone_num, rand_num } = params;
  let obj = {
    phone_num, rand_num
  }
  return post(`/api/v1/shop/auth/verify`, obj);
}
export const signUpByUser = (params) => { // 유저 회원가입
  const { user_name, phone_num, nick_name, user_pw, brand_id } = params;
  let obj = {
    user_name, phone_num, nick_name, user_pw, brand_id
  }
  return post(`/api/v1/shop/auth/sign-up`, obj);
}
