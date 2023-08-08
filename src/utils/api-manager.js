import { toast } from "react-hot-toast";
import { axiosIns } from "./axios";
import { serialize } from 'object-to-formdata';

export const post = async (url, obj) => {
  try {
    let formData = new FormData();
    let form_data_options = {
      indices: true,
    }
    formData = serialize(obj, form_data_options);
    let config = {
      headers: {
        'Content-Type': "multipart/form-data",
      }
    };
    const response = await axiosIns().post(url, formData, config);
    return response?.data;
  } catch (err) {
    console.log(err)
    toast.error(err?.response?.data?.message);
    return false;
  }
}
export const deleteItem = async (url, obj) => {
  try {
    const response = await axiosIns().delete(url, obj);
    return response;
  } catch (err) {
    console.log(err)
    toast.error(err?.response?.data?.message);
    return false;
  }
}
export const put = async (url, obj) => {
  try {
    let formData = new FormData();
    let form_data_options = {
      indices: true,
    }
    formData = serialize(obj, form_data_options);
    formData.append('_method', 'PUT')
    let config = {
      headers: {
        'Content-Type': "multipart/form-data",
      }
    };
    const response = await axiosIns().post(url, formData, config);
    return response?.data;
  } catch (err) {
    console.log(err)
    toast.error(err?.response?.data?.message);
    return false;
  }
}
export const get = async (url, params) => {
  try {
    let query = new URLSearchParams(params).toString()
    const response = await axiosIns().get(`${url}?${query}`);
    return response?.data;
  } catch (err) {
    console.log(err)
    if (err?.response?.status == 401) {
      if (window.location.pathname.split('/')[1] == 'manager') {
        window.location.href = `/manager/login`;
      }
    }
    return false;
  }
}
const settingImageObj = (images, obj_) => {//이미지 존재여부에따라 img 또는 file로 리턴함
  let obj = obj_;
  for (var i = 0; i < images.length; i++) {
    if (!obj[`${images[i]}_file`]) {
      delete obj[`${images[i]}_file`];
    } else {
      delete obj[`${images[i]}_img`];
    }
  }
  return obj;
}
const settingdeleteImageObj = (images, obj_) => {//이미지 존재안할시 삭제함
  let obj = obj_;
  for (var i = 0; i < images.length; i++) {
    if (!obj[`${images[i]}_file`]) {
      delete obj[`${images[i]}_file`];
    }
  }
  return obj;
}
export const getCategoriesByManager = (params) => { //관리자 상품 카테고리 목록출력
  const { page, page_size, s_dt, e_dt, search } = params;
  let query = {
    page, page_size, s_dt, e_dt, search
  }
  if (!query['s_dt']) delete query['s_dt'];
  if (!query['e_dt']) delete query['e_dt'];
  if (!query['search']) delete query['search'];

  return get(`/api/v1/manager/product-categories`, query);
}
export const addCategoryByManager = (params) => { //관리자 상품 카테고리 추가
  const { parent_id, category_type, category_name, category_description, category_file = '' } = params;
  let obj = {
    parent_id, category_type, category_name, category_description, category_file
  }
  if (!parent_id) {
    delete obj['parent_id'];
  }
  let images = [
    'category'
  ]
  obj = settingdeleteImageObj(images, obj);
  return post(`/api/v1/manager/product-categories`, obj);
}
export const updateCategoryByManager = (params) => { //관리자 상품 카테고리 수정
  const { id, parent_id, category_type, category_name, category_description, category_file, category_img } = params;
  let obj = {
    parent_id, category_type, category_name, category_description, category_file, category_img
  }
  let images = [
    'category'
  ]
  obj = settingImageObj(images, obj);
  return put(`/api/v1/manager/product-categories/${id}`, obj);
}
export const getCategoryByManager = (params) => { //관리자 상품 카테고리 단일 출력
  const { id } = params;
  return get(`/api/v1/manager/product-categories/${id}`);
}
export const deleteCategoryByManager = (params) => { //관리자 상품 카테고리 삭제
  const { id } = params;
  return deleteItem(`/api/v1/manager/product-categories/${id}`);
}
export const getProductsByManager = (params) => { //관리자 상품목록 출력
  const { page, page_size, s_dt, e_dt, search, category_id } = params;
  let query = {
    page, page_size, s_dt, e_dt, search, category_id
  }
  if (!query['s_dt']) delete query['s_dt'];
  if (!query['e_dt']) delete query['e_dt'];
  if (!query['search']) delete query['search'];
  if (!query['category_id']) delete query['category_id'];

  return get(`/api/v1/manager/products`, query);
}
export const addProductByManager = (params) => { //관리자 상품 추가
  const { category_id, product_name = '', product_comment = '', product_price = 0, product_sale_price = 0, brand_name = '', origin_name = '', mfg_name = '', model_name = '', product_description = '',
    product_file,
    sub_images = [],
    groups = []
  } = params;
  let obj = {
    category_id, product_name, product_comment, product_price, product_sale_price, brand_name, origin_name, mfg_name, model_name, product_description,
    product_file,
    sub_images,
    groups,
  }
  let images = [
    'product'
  ]
  obj = settingdeleteImageObj(images, obj);
  return post(`/api/v1/manager/products`, obj);
}
export const updateProductByManager = (params) => { //관리자 상품 수정
  const { id, category_id, product_name = '', product_comment = '', product_price = 0, product_sale_price = 0, brand_name = '', origin_name = '', mfg_name = '', model_name = '', product_description = '',
    product_file, product_img,
    sub_images = [],
    groups = []
  } = params;
  let obj = {
    category_id, product_name, product_comment, product_price, product_sale_price, brand_name, origin_name, mfg_name, model_name, product_description,
    product_file, product_img,
    sub_images,
    groups,
  }
  let images = [
    'product'
  ]
  obj = settingImageObj(images, obj);
  for (var i = 0; i < sub_images.length; i++) {
    obj.sub_images[i] = settingImageObj([
      'product_sub'
    ], obj.sub_images[i]);
  }
  for (var i = 0; i < groups.length; i++) {
    obj.groups[i] = settingImageObj([
      'group'
    ], obj.groups[i]);
    let options = obj.groups[i]?.options ?? [];
    for (var j = 0; j < options.length; j++) {
      obj.groups[i].options[j] = settingImageObj([
        'option'
      ], obj.groups[i].options[j]);
    }
  }
  return put(`/api/v1/manager/products/${id}`, obj);
}
export const getProductByManager = (params) => { //관리자 상품 단일 출력
  const { id } = params;
  return get(`/api/v1/manager/products/${id}`);
}
export const deleteProductByManager = (params) => { //관리자 상품 삭제
  const { id } = params;
  return deleteItem(`/api/v1/manager/products/${id}`);
}
export const getUsersByManager = (params) => { //관리자 유저목록 출력
  const { page, page_size, s_dt, e_dt, search } = params;
  let query = {
    page, page_size, s_dt, e_dt, search
  }
  if (!query['s_dt']) delete query['s_dt'];
  if (!query['e_dt']) delete query['e_dt'];
  if (!query['search']) delete query['search'];

  return get(`/api/v1/manager/users`, query);
}
export const addUserByManager = (params) => { //관리자 유저 추가
  const {
    user_name, phone_num, nick_name, user_pw, note,
    profile_file,
  } = params;
  let obj = {
    user_name, phone_num, nick_name, user_pw, note,
    profile_file,
  }
  let images = [
    'profile'
  ]
  obj = settingdeleteImageObj(images, obj);
  return post(`/api/v1/manager/users`, obj);
}
export const updateUserByManager = (params) => { //관리자 유저 수정
  const {
    id, user_name, phone_num, nick_name, note,
    profile_file, profile_img
  } = params;
  let obj = {
    user_name, phone_num, nick_name, note,
    profile_file, profile_img
  }
  let images = [
    'profile'
  ]
  obj = settingImageObj(images, obj);
  return put(`/api/v1/manager/users/${id}`, obj);
}
export const changePasswordUserByManager = (params) => { //관리자 유저 비밀번호 변경
  const {
    id, user_pw
  } = params;
  let obj = {
    id, user_pw
  }
  return post(`/api/v1/manager/users/password-change`, obj);
}
export const getUserByManager = (params) => { //관리자 유저 단일 출력
  const { id } = params;
  return get(`/api/v1/manager/users/${id}`);
}
export const deleteUserByManager = (params) => { //관리자 유저 삭제
  const { id } = params;
  return deleteItem(`/api/v1/manager/users/${id}`);
}
export const getSellersByManager = (params) => { //관리자 셀러 목록 출력
  const { page, page_size, s_dt, e_dt, search } = params;
  let query = {
    page, page_size, s_dt, e_dt, search
  }
  if (!query['s_dt']) delete query['s_dt'];
  if (!query['e_dt']) delete query['e_dt'];
  if (!query['search']) delete query['search'];

  return get(`/api/v1/manager/merchandises`, query);
}
export const addSellerByManager = (params) => { //관리자 셀러 추가
  const { user_name, nick_name, mcht_name, addr, resident_num, business_num, acct_bank_name, acct_bank_code, acct_num, acct_name, phone_num, note, user_pw,
    passbook_file,
    contract_file,
    bsin_lic_file,
    id_file,
    profile_file,
  } = params;
  let obj = {
    user_name, nick_name, mcht_name, addr, resident_num, business_num, acct_bank_name, acct_bank_code, acct_num, acct_name, phone_num, note, user_pw,
    passbook_file,
    contract_file,
    bsin_lic_file,
    id_file,
    profile_file,
  }
  let images = [
    'passbook',
    'contract',
    'bsin_lic',
    'id',
    'profile',
  ]
  obj = settingdeleteImageObj(images, obj);
  return post(`/api/v1/manager/merchandises`, obj);
}

export const updateSellerByManager = (params) => { //관리자 셀러 수정
  const { user_name, nick_name, mcht_name, addr, resident_num, business_num, acct_bank_name, acct_bank_code, acct_num, acct_name, phone_num, note, user_pw,
    passbook_file, passbook_img,
    contract_file, contract_img,
    bsin_lic_file, bsin_lic_img,
    id_file, id_img,
    profile_file, profile_img,
    id
  } = params;
  let obj = {
    user_name, nick_name, mcht_name, addr, resident_num, business_num, acct_bank_name, acct_bank_code, acct_num, acct_name, phone_num, note, user_pw,
    passbook_file, passbook_img,
    contract_file, contract_img,
    bsin_lic_file, bsin_lic_img,
    id_file, id_img,
    profile_file, profile_img,
  }
  let images = [
    'passbook',
    'contract',
    'bsin_lic',
    'id',
    'profile',
  ]
  obj = settingImageObj(images, obj);
  return put(`/api/v1/manager/merchandises/${id}`, obj);
}
export const getSellerByManager = (params) => { //관리자 셀러 단일 출력
  const { id } = params;
  return get(`/api/v1/manager/merchandises/${id}`);
}
export const deleteSellerByManager = (params) => { //관리자 셀러 삭제
  const { id } = params;
  return deleteItem(`/api/v1/manager/merchandises/${id}`);
}
export const getPostCategoriesByManager = (params) => { //관리자 게시글 카테고리 목록 출력
  const { page, page_size, s_dt, e_dt, search } = params;
  let query = {
    page, page_size, s_dt, e_dt, search
  }
  if (!query['s_dt']) delete query['s_dt'];
  if (!query['e_dt']) delete query['e_dt'];
  if (!query['search']) delete query['search'];
  return get(`/api/v1/manager/post-categories`, query);
}
export const addPostCategoryByManager = (params) => { //관리자 게시글 카테고리 추가
  const { parent_id, post_category_title } = params;
  let obj = {
    parent_id, post_category_title
  }
  if (!parent_id) {
    delete obj['parent_id'];
  }
  return post(`/api/v1/manager/post-categories`, obj);
}
export const updatePostCategoryByManager = (params) => { //관리자 게시글 카테고리 수정
  const { parent_id, post_category_title, id } = params;
  let obj = {
    parent_id, post_category_title
  }
  return put(`/api/v1/manager/post-categories/${id}`, obj);
}
export const getPostCategoryByManager = (params) => { //관리자 게시글 카테고리 단일 출력
  const { id } = params;
  return get(`/api/v1/manager/post-categories/${id}`);
}
export const deletePostCategoryByManager = (params) => { //관리자 게시글 카테고리 삭제
  const { id } = params;
  return deleteItem(`/api/v1/manager/post-categories/${id}`);
}
export const getPostsByManager = (params) => { //관리자 게시글 목록 출력
  const { page, page_size, s_dt, e_dt, search, category_id } = params;
  let query = {
    page, page_size, s_dt, e_dt, search, category_id
  }
  if (!query['s_dt']) delete query['s_dt'];
  if (!query['e_dt']) delete query['e_dt'];
  if (!query['search']) delete query['search'];
  return get(`/api/v1/manager/posts`, query);
}
export const addPostByManager = (params) => { //관리자 게시글 추가
  const { category_id, parent_id, post_title, post_content, is_reply } = params;
  let obj = {
    category_id, parent_id, post_title, post_content, is_reply
  }
  if (!parent_id) {
    delete obj['parent_id'];
  }
  return post(`/api/v1/manager/posts`, obj);
}
export const updatePostByManager = (params) => { //관리자 게시글 수정
  const { category_id, parent_id, post_title, post_content, is_reply, id } = params;
  let obj = {
    category_id, parent_id, post_title, post_content, is_reply
  }
  return put(`/api/v1/manager/posts/${id}`, obj);
}
export const getPostByManager = (params) => { //관리자 게시글 단일 출력
  const { id } = params;
  return get(`/api/v1/manager/posts/${id}`);
}
export const deletePostByManager = (params) => { //관리자 게시글 삭제
  const { id } = params;
  return deleteItem(`/api/v1/manager/posts/${id}`);
}
export const getBrandsByManager = (params) => { //관리자 브랜드 목록 출력
  const { page, page_size, s_dt, e_dt, search } = params;
  let query = {
    page, page_size, s_dt, e_dt, search
  }
  if (!query['s_dt']) delete query['s_dt'];
  if (!query['e_dt']) delete query['e_dt'];
  if (!query['search']) delete query['search'];
  return get(`/api/v1/manager/brands`, query);
}
export const addBrandByManager = (params) => { //관리자 브랜드 추가
  const { name, dns, og_description, company_name, pvcy_rep_name, ceo_name, addr, resident_num, business_num, phone_num, fax_num, note,
    user_name, user_pw,
    theme_css = {},
    main_obj = [],
    setting_obj = {},
    logo_file,
    dark_logo_file,
    favicon_file,
    og_file,
  } = params;
  let obj = {
    name, dns, og_description, company_name, pvcy_rep_name, ceo_name, addr, resident_num, business_num, phone_num, fax_num, note,
    user_name, user_pw,
    theme_css,
    main_obj,
    setting_obj,
    logo_file,
    dark_logo_file,
    favicon_file,
    og_file,
  }
  let images = [
    'logo',
    'dark_logo',
    'favicon',
    'og',
  ]
  obj = settingdeleteImageObj(images, obj);

  return post(`/api/v1/manager/brands`, obj);
}
export const updateBrandByManager = (params) => { //관리자 브랜드수정
  const { name, dns, og_description, company_name, pvcy_rep_name, ceo_name, addr, resident_num, business_num, phone_num, fax_num, note,
    theme_css = {},
    main_obj = [],
    setting_obj = {},
    logo_file, logo_img,
    dark_logo_file, dark_logo_img,
    favicon_file, favicon_img,
    og_file, og_img,
    id
  } = params;
  let obj = {
    name, dns, og_description, company_name, pvcy_rep_name, ceo_name, addr, resident_num, business_num, phone_num, fax_num, note,
    theme_css,
    main_obj,
    setting_obj,
    logo_file, logo_img,
    dark_logo_file, dark_logo_img,
    favicon_file, favicon_img,
    og_file, og_img,
  }
  let images = [
    'logo',
    'dark_logo',
    'favicon',
    'og',
  ]
  obj = settingImageObj(images, obj);
  return put(`/api/v1/manager/brands/${id}`, obj);
}
export const getBrandByManager = (params) => { //관리자 브랜드 단일 출력
  const { id } = params;
  return get(`/api/v1/manager/brands/${id}`);
}
export const deleteBrandByManager = (params) => { //관리자 브랜드 삭제
  const { id } = params;
  return deleteItem(`/api/v1/manager/brands/${id}`);
}
export const getProductReviewsByManager = (params) => { //관리자 상품리뷰 목록 출력
  const { page, page_size, s_dt, e_dt, search, product_id } = params;
  let query = {
    page, page_size, s_dt, e_dt, search, product_id
  }
  if (!query['s_dt']) delete query['s_dt'];
  if (!query['e_dt']) delete query['e_dt'];
  if (!query['search']) delete query['search'];
  return get(`/api/v1/manager/product-reviews`, query);
}
export const addProductReviewByManager = (params) => { //관리자 상품리뷰 추가
  const { category_id, parent_id, post_title, post_content, is_reply } = params;
  let obj = {
    category_id, parent_id, post_title, post_content, is_reply
  }
  if (!parent_id) {
    delete obj['parent_id'];
  }
  return post(`/api/v1/manager/product-reviews`, obj);
}
export const updateProductReviewByManager = (params) => { //관리자 상품리뷰 수정
  const { category_id, parent_id, post_title, post_content, is_reply, id } = params;
  let obj = {
    category_id, parent_id, post_title, post_content, is_reply
  }
  return put(`/api/v1/manager/product-reviews/${id}`, obj);
}
export const getProductReviewByManager = (params) => { //관리자 상품리뷰 단일 출력
  const { id } = params;
  return get(`/api/v1/manager/product-reviews/${id}`);
}
export const deleteProductReviewByManager = (params) => { //관리자 상품리뷰 삭제
  const { id } = params;
  return deleteItem(`/api/v1/manager/product-reviews/${id}`);
}

export const getPopupsByManager = (params) => { //관리자 팝업 목록 출력
  const { page, page_size, s_dt, e_dt, search, product_id } = params;
  let query = {
    page, page_size, s_dt, e_dt, search, product_id
  }
  if (!query['s_dt']) delete query['s_dt'];
  if (!query['e_dt']) delete query['e_dt'];
  if (!query['search']) delete query['search'];
  return get(`/api/v1/manager/popups`, query);
}
export const addPopupByManager = (params) => { //관리자 팝업 추가
  const { popup_title, popup_content, open_s_dt, open_e_dt } = params;
  let obj = {
    popup_title, popup_content, open_s_dt, open_e_dt
  }
  return post(`/api/v1/manager/popups`, obj);
}
export const updatePopupByManager = (params) => { //관리자 팝업 수정
  const { popup_title, popup_content, open_s_dt, open_e_dt, id } = params;
  let obj = {
    popup_title, popup_content, open_s_dt, open_e_dt
  }
  return put(`/api/v1/manager/popups/${id}`, obj);
}
export const getPopupByManager = (params) => { //관리자 팝업 단일 출력
  const { id } = params;
  return get(`/api/v1/manager/popups/${id}`);
}
export const deletePopupByManager = (params) => { //관리자 팝업 삭제
  const { id } = params;
  return deleteItem(`/api/v1/manager/popups/${id}`);
}
export const getTrxsByManager = (params) => { //관리자 결제내역 목록 출력
  const { page, page_size, s_dt, e_dt, search, trx_status } = params;
  let query = {
    page, page_size, s_dt, e_dt, search, trx_status
  }
  if (!query['s_dt']) delete query['s_dt'];
  if (!query['e_dt']) delete query['e_dt'];
  if (!query['search']) delete query['search'];
  if (!query['trx_status']) delete query['trx_status'];
  return get(`/api/v1/manager/transactions`, query);
}
export const addTrxByManager = (params) => { //관리자 결제내역 추가
  const { user_id, brand_id, product_id, trx_dt, trx_tm, cxl_dt, cxl_tm, amount, ord_num, trx_id, card_num, installment, issuer, acquirer, appr_num, password, buyer_name, buyer_phone, item_name, user_pw, } = params;
  let obj = {
    user_id, brand_id, product_id, trx_dt, trx_tm, cxl_dt, cxl_tm, amount, ord_num, trx_id, card_num, installment, issuer, acquirer, appr_num, password, buyer_name, buyer_phone, item_name, user_pw,
  }
  return post(`/api/v1/manager/transactions`, obj);
}
export const updateTrxByManager = (params) => { //관리자 결제내역 수정
  const { user_id, brand_id, product_id, trx_dt, trx_tm, cxl_dt, cxl_tm, amount, ord_num, trx_id, card_num, installment, issuer, acquirer, appr_num, password, buyer_name, buyer_phone, item_name, id } = params;
  let obj = {
    user_id, brand_id, product_id, trx_dt, trx_tm, cxl_dt, cxl_tm, amount, ord_num, trx_id, card_num, installment, issuer, acquirer, appr_num, password, buyer_name, buyer_phone, item_name,
  }
  return put(`/api/v1/manager/transactions/${id}`, obj);
}
export const getTrxByManager = (params) => { //관리자 결제내역 단일 출력
  const { id } = params;
  return get(`/api/v1/manager/transactions/${id}`);
}
export const deleteTrxByManager = (params) => { //관리자 결제내역 삭제
  const { id } = params;
  return deleteItem(`/api/v1/manager/transactions/${id}`);
}

export const uploadFileByManager = (params) => {// 관리자 파일 단일 업로드
  const { file } = params;
  let obj = {
    file
  }
  let config = {
    headers: {
      'Content-Type': "multipart/form-data",
    }
  };
  return post('/api/v1/manager/posts/upload', obj, config);
}
export const uploadsFileByManager = (params) => {// 관리자 파일 여러개 업로드
  const { images } = params;
  let obj = {
    images
  }
  let config = {
    headers: {
      "Accept": "application/json",
      'Content-Type': "multipart/form-data",
    }
  };
  return post('/api/v1/manager/posts/bulk-upload', obj, config);
}
