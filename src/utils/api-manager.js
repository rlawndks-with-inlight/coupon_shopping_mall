import { axiosIns } from "./axios";

const post = async (url, obj) => {
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
const deleteItem = async (url, obj) => {
  try {
    const response = await axiosIns().delete(url, obj);
    return response?.data;
  } catch (err) {
    return false;
  }
}
const put = async (url, obj) => {
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
    const response = await axiosIns().put(url, formData, config);
    return response?.data;
  } catch (err) {
    return false;
  }
}
const get = async (url, params) => {
  try {

    let query = new URLSearchParams(params).toString()
    const response = await axiosIns().get(`${url}?${query}`);
    return response?.data;
  } catch (err) {
    console.log(err)
    return false;
  }
}
export const getCategoriesByManager = (params) => {
  const { page, page_size, s_dt, e_dt, search } = params;
  let query = {
    page, page_size, s_dt, e_dt, search
  }
  if(!query['s_dt']) delete query['s_dt'];
  if(!query['e_dt']) delete query['e_dt'];
  if(!query['search']) delete query['search'];

  return get(`/api/v1/manager/product-categories`, query);
}
export const addCategoryByManager = (params) => {
  const { parent_id, category_type, category_name, category_description, category_file='' } = params;
  let obj = {
    parent_id, category_type, category_name, category_description, category_file
  }
  if(!parent_id){
    delete obj['parent_id'];
  }
  return post(`/api/v1/manager/product-categories`, obj);
}
export const updateCategoryByManager = (params) => {
  const { id, parent_id, category_type, category_name, category_description, category_file } = params;
  let obj = {
    parent_id, category_type, category_name, category_description, category_file
  }
  return put(`/api/v1/manager/product-categories/${id}`, obj);
}
export const getCategoryByManager = (params) => {
  const { id } = params;
  const response = axiosIns().get(`/api/v1/manager/product-categories/${id}`);
  console.log(response.data);
}
export const deleteCategoryByManager = (params) => {
  const { id } = params;
  return deleteItem(`/api/v1/manager/product-categories/${id}`);
  console.log(response.data);
}
export const getProductsByManager = (params) => {
  const { page, page_size, s_dt, e_dt, search, category_id } = params;
  let query = {
    page, page_size, s_dt, e_dt, search, category_id
  }
  if(!query['s_dt']) delete query['s_dt'];
  if(!query['e_dt']) delete query['e_dt'];
  if(!query['search']) delete query['search'];
  if(!query['category_id']) delete query['category_id'];

  return get(`/api/v1/manager/products`, query);
}
export const addProductByManager = (params) => {
  const { } = params;
  const response = axiosIns().get(`/api/v1/manager`);
  console.log(response.data);
}
export const updateProductByManager = (params) => {
  const { } = params;
}
export const getProductByManager = (params) => {
  const { } = params;

}
export const deleteProductByManager = (params) => {
  const { } = params;

}
