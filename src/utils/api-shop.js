import { get, post, put, deleteItem, category_id_depth } from './api-manager';

export const getShopCategoriesByUser = (params) => { // 유저 연결되어있는 하위 카테고리가 모두 출력됩니다. (게시글 카테고리, 상품 카테고리) 팝업 정보가 출력됩니다.
  const { product_review_ids = [], product_ids = [], brand_id, root_id } = params;
  let query = {
    product_review_ids,
    product_ids,
    brand_id, 
    root_id,
  }
  query.product_review_ids = JSON.stringify(query.product_review_ids);
  query.product_ids = JSON.stringify(query.product_ids);
  
  return get(`/api/v1/shop/shop`, query);
}
export const getSellerInfoByUser = async (params) => { // 셀러 정보가 출력됩니다. (게시글 카테고리, 상품 카테고리) 팝업 정보가 출력됩니다.
  const { mcht_id } = params;
  let query = {
    mcht_id,
    dns: window.location.host.split(':')[0]
  }
  let data = await get(`/api/v1/auth/domain`, query);
  return data?.mcht;
}
export const getSellerCategoriesByUser = async (params) => { // 셀러 연결되어있는 하위 카테고리가 모두 출력됩니다. (게시글 카테고리, 상품 카테고리) 팝업 정보가 출력됩니다.
  const { mcht_id } = params;
  let query = {
    mcht_id
  }
  return get(`/api/v1/shop/shop`, query);
}
export const getProductsByUser = (params) => { // 유저 카테고리 기반 상품 목록 출력
  const { page = 1, page_size = 10, mcht_id, search } = params;
  let query = {
    page, page_size, mcht_id,
    search,
  }
  for (var i = 0; i < category_id_depth; i++) {
    if (params[`category_id${i}`] > 0) {
      query[`category_id${i}`] = params[`category_id${i}`];
    }
  }
  if (!mcht_id) {
    delete query['mcht_id'];
  }
  if(!search){
    delete query['search'];
  }
  return get(`/api/v1/shop/product-categories`, query);
}
export const getPostsByUser = (params) => { // 유저 카테고리 기반 게시글 목록 출력
  const { category_id, page = 1, page_size = 10 } = params;
  let query = {
    category_id, page, page_size
  }
  if (!category_id) {
    delete query['category_id'];
  }
  return get(`/api/v1/shop/post-categories`, query);
}
export const getProductByUser = (params) => { // 유저 상품 단일 출력
  const { product_id } = params;
  let query = {
    product_id
  }
  return get(`/api/v1/shop/products/${product_id}`, {});
}
export const getProductReviewsByUser = (params) => { // 유저 상품 리뷰 목록 출력
  const { product_id, page = 1, page_size = 10, scope } = params;
  let query = {
    page, page_size, product_id
  }
  return get(`/api/v1/shop/products/${product_id}/reviews`, query);
}
export const addProductReviewByUser = (params) => { // 유저 상품 리뷰 추가
  const { product_id, trans_id, scope, nick_name, profile_img, content, password } = params;
  let query = {
    trans_id, scope, nick_name, profile_img, content, password
  }
  return post(`/api/v1/shop/products/${product_id}/reviews`, query);
}
export const getProductReviewByUser = (params) => { // 유저 상품 리뷰 단일 출력
  const { product_id, id } = params;

  return get(`/api/v1/shop/products/${product_id}/reviews/${id}`);
}
export const updateProductReviewByUser = (params) => { // 유저 상품 리뷰 업데이트
  const { product_id, id, trans_id, scope, nick_name, profile_img, content, password } = params;
  let query = {
    trans_id, scope, nick_name, profile_img, content, password
  }
  return put(`/api/v1/shop/products/${product_id}/reviews/${id}`, query);
}
export const deleteProductReviewByUser = (params) => { // 유저 상품 리뷰 삭제
  const { product_id, id } = params;

  return deleteItem(`/api/v1/shop/products/${product_id}/reviews/${id}`);
}
export const getPostByUser = (params) => { // 유저 게시글 단일 출력
  const { post_id } = params;
  let query = {
    post_id
  }
  return get(`/api/v1/shop/posts/${post_id}`, {});
}
export const addPostByUser = (params) => { // 유저 게시글 추가
  const { category_id, post_title, post_content, is_reply } = params;
  let query = {
    category_id, post_title, post_content, is_reply
  }
  return post(`/api/v1/shop/posts`, query);
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
  const { product_id, user_id, amount = 100, item_name, buyer_name, installment, buyer_phone, card_num, yymm, auth_num, card_pw, addr, detail_addr, temp, password } = params;
  let obj = {
    user_id, amount, item_name, buyer_name, installment, buyer_phone, card_num, yymm,
    // auth_num, card_pw, 
    addr, detail_addr, temp, password
  }
  obj['card_num'] = obj['card_num'].replaceAll(' ', '')
  obj['yymm'] = obj['yymm'].split('/')[1] + obj['yymm'].split('/')[0]
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
  if (!password) {
    delete obj['password'];
  }
  return post(`/api/v1/shop/products/${product_id}/hand`, obj);
}
export const getPayHistoriesByUser = (params) => {//회원 주문목록 출력
  const { page = 1, page_size = 10 } = params;
  let obj = {
    page, page_size
  }
  return get(`/api/v1/shop/transactions`, obj);
}
export const getPayHistoryByNoneUser = (params) => {// 비회원 주문 출력
  const { ord_num, password } = params;
  let obj = {
    ord_num, password
  }
  return get(`/api/v1/shop/non-member-transactions`, obj);
}
export const getAddressesByUser = (params) => {//회원 주소 리스트 불러오기
  const { page = 1, page_size = 10, user_id } = params;
  let obj = {
    page, page_size, user_id
  }
  return get(`/api/v1/shop/users/addresses`, obj);
}
export const addAddressByUser = (params) => {//회원 주소 리스트 불러오기
  const { user_id, addr, detail_addr } = params;
  let obj = {
    user_id, addr, detail_addr
  }
  return post(`/api/v1/shop/users/addresses`, obj);
}
export const deleteAddressByUser = (params) => {//회원 주소 삭제
  const { id } = params;

  return deleteItem(`/api/v1/shop/users/addresses/${id}`);
}
