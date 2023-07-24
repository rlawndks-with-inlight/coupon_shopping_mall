import { axiosIns } from "./axios";

export const post = async (url, obj) => {
  try {
    let formData = new FormData();
    let keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      formData.append(keys[i], obj[keys[i]]);
    }
    let config = {
      headers: {
        'Content-Type': "multipart/form-data",
      }
    };
    const response = await axiosIns().post(url, formData, config);
    return response?.data;
  } catch (err) {
    return false;
  }
}
export const deleteItem = async (url, obj) => {
  try {
    const response = await axiosIns().delete(url, obj);
    return response;
  } catch (err) {
    return false;
  }
}
export const put = async (url, obj) => {
  try {
    let formData = new FormData();
    let keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      formData.append(keys[i], obj[keys[i]]);
    }
    formData.append('_method', 'PUT')
    let config = {
      headers: {
        'Content-Type': "multipart/form-data",
      }
    };
    const response = await axiosIns().post(url, formData, config);
    return response?.data;
  } catch (err) {
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
    return false;
  }
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
  return post(`/api/v1/manager/product-categories`, obj);
}
export const updateCategoryByManager = (params) => { //관리자 상품 카테고리 수정
  const { id, parent_id, category_type, category_name, category_description, category_file, category_img } = params;
  let obj = {
    parent_id, category_type, category_name, category_description, category_file, category_img
  }
  if(!category_file){
    delete obj['category_file'];
  }else{
    delete obj['category_img'];
  }
  return put(`/api/v1/manager/product-categories/${id}`, obj);
}
export const getCategoryByManager = (params) => { //관리자 상품 카테고리 단일 출력
  const { id } = params;
  const response = axiosIns().get(`/api/v1/manager/product-categories/${id}`);
  console.log(response.data);
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
  const { category_id, product_name = '', product_comment = '', product_price = 0, product_sale_price = 0, brand_name = '', origin_name = '', mfg_name = '', model_name = '', product_description = '', product_file, product_sub_file } = params;
  let obj = {
    category_id, product_name, product_comment, product_price, product_sale_price, brand_name, origin_name, mfg_name, model_name, product_description, product_file, product_sub_file
  }
  return post(`/api/v1/manager/products`, obj);
}
export const updateProductByManager = (params) => { //관리자 상품 수정
  const { id, category_id, product_name = '', product_comment = '', product_price = 0, product_sale_price = 0, brand_name = '', origin_name = '', mfg_name = '', model_name = '', product_description = '', product_file, product_img, product_sub_file } = params;
  let obj = {
    category_id, product_name, product_comment, product_price, product_sale_price, brand_name, origin_name, mfg_name, model_name, product_description, product_file, product_img, product_sub_file
  }
  if(!product_file){
    delete obj['product_file'];
  }else{
    delete obj['product_img'];
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
  const { } = params;
  let obj = {

  }
  return post(`/api/v1/manager/users`, obj);
}
export const updateUserByManager = (params) => { //관리자 유저 수정
  const { } = params;
  let obj = {
  }
  return put(`/api/v1/manager/users/${id}`, obj);
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
  const { } = params;
  let obj = {
  }
  return post(`/api/v1/manager/merchandises`, obj);
}
export const updateSellerByManager = (params) => { //관리자 셀러 수정
  const { } = params;
  let obj = {
  }
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
  const { } = params;
  let obj = {
  }
  return post(`/api/v1/manager/post-categories`, obj);
}
export const updatePostCategoryByManager = (params) => { //관리자 게시글 카테고리 수정
  const { } = params;
  let obj = {
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
export const getBrandsByManager = (params) => { //관리자 게시글 카테고리 목록 출력
  const { page, page_size, s_dt, e_dt, search } = params;
  let query = {
    page, page_size, s_dt, e_dt, search
  }
  if (!query['s_dt']) delete query['s_dt'];
  if (!query['e_dt']) delete query['e_dt'];
  if (!query['search']) delete query['search'];
  return get(`/api/v1/manager/brands`, query);
}
export const addBrandByManager = (params) => { //관리자 게시글 카테고리 추가
  const { } = params;
  let obj = {
  }
  return post(`/api/v1/manager/brands`, obj);
}
export const updateBrandByManager = (params) => { //관리자 게시글 카테고리 수정
  const { } = params;
  let obj = {
  }
  return put(`/api/v1/manager/brands/${id}`, obj);
}
export const getBrandByManager = (params) => { //관리자 게시글 카테고리 단일 출력
  const { id } = params;
  return get(`/api/v1/manager/brands/${id}`);
}
export const deleteBrandByManager = (params) => { //관리자 게시글 카테고리 삭제
  const { id } = params;
  return deleteItem(`/api/v1/manager/brands/${id}`);
}
