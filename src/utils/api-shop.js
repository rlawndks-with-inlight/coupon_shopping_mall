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
export const getProductReviewsByUser = (params) => { // 유저 상품 리뷰 목록 출력
  const { product_id, page = 1, page_size = 10, scope } = params;
  let query = {
    page, page_size, product_id
  }
  return get(`/api/v1/shop/shop/products/${product_id}/reviews`, query);
}
export const addProductReviewByUser = (params) => { // 유저 상품 리뷰 추가
  const { product_id, trans_id, brand_id, scope, nick_name, profile_img, content, password } = params;
  let query = {
    trans_id, brand_id, scope, nick_name, profile_img, content, password
  }
  return post(`/api/v1/shop/shop/products/${product_id}/reviews`, query);
}
export const getProductReviewByUser = (params) => { // 유저 상품 리뷰 단일 출력
  const { product_id, id } = params;

  return get(`/api/v1/shop/shop/products/${product_id}/reviews/${id}`);
}
export const updateProductReviewByUser = (params) => { // 유저 상품 리뷰 업데이트
  const { product_id, id, trans_id, brand_id, scope, nick_name, profile_img, content, password } = params;
  let query = {
    trans_id, brand_id, scope, nick_name, profile_img, content, password
  }
  return put(`/api/v1/shop/shop/products/${product_id}/reviews/${id}`, query);
}
export const deleteProductReviewByUser = (params) => { // 유저 상품 리뷰 삭제
  const { product_id, id } = params;

  return deleteItem(`/api/v1/shop/shop/products/${product_id}/reviews/${id}`);
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
export const onPayItemByCard = (params) => { //유저 바로구매 카드결제
  const { product_id, brand_id, user_id, amount, item_name, buyer_name, installment, buyer_phone, card_num, yymm, auth_num, card_pw, addr, detail_addr, temp, password } = params;
  let obj = {
    brand_id, user_id, amount, item_name, buyer_name, installment, buyer_phone, card_num, yymm, auth_num, card_pw, addr, detail_addr, temp, password
  }
  if (!user_id) {
    delete obj['user_id'];
  }
  if (!auth_num) {
    delete obj['auth_num'];
  }
  if (!card_pw) {
    delete obj['card_pw'];
  }
  if (!detail_addr) {
    delete obj['detail_addr'];
  }
  return post(`/api/v1/shop/shop/products/${product_id}/hand`, obj);
}
export const getPayHistoriesByUser = (params) => {//회원 주문목록 출력
  const { page = 1, page_size = 10 } = params;
  let obj = {
    page, page_size
  }
  return get(`/api/v1/shop/shop/transactions`, obj);
}
export const getPayHistoryByNoneUser = (params) => {// 비회원 주문 출력
  const { brand_id, ord_num, password } = params;
  let obj = {
    brand_id, ord_num, password
  }
  return get(`/api/v1/shop/shop/non-member-transactions`, obj);
}