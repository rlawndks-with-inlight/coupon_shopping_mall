import { toast } from "react-hot-toast";
import axios from "./axios";
import { serialize } from 'object-to-formdata';
import { getLocalStorage } from "./local-storage";
import { when } from "jquery";

// 마지막 API 실패 사유 기록.
//
// post/get/put/delete 는 실패를 전부 false 한 가지로 뭉개서 돌려준다. 그래서 호출부는
// '금액이 바뀌어서 거절당했다'와 '네트워크가 끊겼다'를 구분할 수 없었고,
// 결제 실패라면 무조건 장바구니 전체 재동기화를 돌리는 과잉 대응을 하게 됐다.
// 응답을 바꾸면 모든 호출부가 영향을 받으므로, 사유만 따로 남겨 필요한 곳에서 읽어 간다.
let last_api_error = { message: '', at: 0 };
const setLastApiError = (message) => {
    last_api_error = { message: String(message ?? ''), at: Date.now() };
};
export const getLastApiError = () => last_api_error;

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
        const { data: response } = await axios.post(url, formData, config);
        if (response?.result > 0) {
            return response?.data;
        } else {
            setLastApiError(response?.message);
            toast.error(response?.message);
            return false;
        }
    } catch (err) {
        console.log(err)
        setLastApiError(err?.message);
        toast.error(err?.message);
        return false;
    }
}
export const deleteItem = async (url, obj) => {
    try {
        const { data: response } = await axios.delete(url, obj);
        if (response?.result > 0) {
            return response?.data;
        } else {
            toast.error(response?.message);
            return false;
        }
    } catch (err) {
        console.log(err)
        toast.error(err?.response?.data?.message || err?.message);
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
        let config = {
            headers: {
                'Content-Type': "multipart/form-data",
            }
        };
        const { data: response } = await axios.put(url, formData, config);
        if (response?.result > 0) {
            return response?.data;
        } else {
            toast.error(response?.message);
            return false;
        }
    } catch (err) {
        console.log(err)
        toast.error(err?.message);
        return false;
    }
}
export const get = async (url, params) => {
    try {
        let query = new URLSearchParams(params).toString()

        const { data: response } = await axios.get(`${url}?${query}`);

        if (response?.result > 0) {
            return response?.data;
        } else {
            toast.error(response?.message);
            return false;
        }
    } catch (err) {
        console.log(err)
        return false;
    }
}
export const apiManager = async (table, type, params) => {
    let obj = await settingParams(table, type, params);
    if (!(obj?.brand_id > 0)) {
        let dns_data = getLocalStorage('themeDnsData');
        dns_data = JSON.parse(dns_data);
        obj['brand_id'] = dns_data?.id;
        obj['root_id'] = dns_data?.root_id;
    }
    let base_url = '/api';
    if (type == 'get') {
        return get(`${base_url}/${table}/${params?.id ?? ""}`, obj);
    }
    if (type == 'list') {
        return get(`${base_url}/${table}`, obj);
    }
    if (type == 'create') {
        return post(`${base_url}/${table}`, obj);
    }
    if (type == 'update') {
        return put(`${base_url}/${table}/${params?.id ?? ""}`, obj);
    }
    if (type == 'delete') {
        return deleteItem(`${base_url}/${table}/${params?.id}`);
    }
}
export const apiShop = async (table, type = 'get', params) => {
    let obj = await settingParams(table, type, params);
    if (!(obj?.brand_id > 0)) {
        let dns_data = getLocalStorage('themeDnsData');
        dns_data = JSON.parse(dns_data);
        obj['brand_id'] = dns_data?.id;
        obj['root_id'] = dns_data?.root_id;
    }
    let base_url = '/api/shop';
    if (type == 'get') {
        return get(`${base_url}/${table}/${params?.id ?? ""}`, obj);
    }
    if (type == 'list') {
        return get(`${base_url}/${table}`, obj);
    }
    if (type == 'create') {
        return post(`${base_url}/${table}`, obj);
    }
    if (type == 'update') {
        return put(`${base_url}/${table}/${params?.id ?? ""}`, obj);
    }
    if (type == 'delete') {
        return deleteItem(`${base_url}/${table}/${params?.id}`);
    }
}
export const apiUtil = async (table, type, params) => {
    let obj = await settingParams(table, type, params);
    if (!(obj?.brand_id > 0)) {
        let dns_data = getLocalStorage('themeDnsData');
        dns_data = JSON.parse(dns_data);
        obj['brand_id'] = dns_data?.id;
        obj['root_id'] = dns_data?.root_id;
    }
    let base_url = '/api/util';
    if (type == 'get') {
        return get(`${base_url}/${table}`, obj);
    }
    if (type == 'update') {
        return post(`${base_url}/${table}`, obj);
    }
}
export const uploadMultipleFiles = async (files = []) => {
    try {
        let result = undefined;
        let result_list = [];
        for (var i = 0; i < files.length; i++) {
            result_list.push(apiManager('upload/single', 'create', {
                post_file: files[i]?.image,
            }));
        }
        for (var i = 0; i < result_list.length; i++) {
            await result_list[i];
        }
        result = (await when(result_list));
        let list = [];
        for (var i = 0; i < (await result).length; i++) {
            list.push(await result[i]);
        }
        return list;
    } catch (err) {
        toast.error('파일 등록중 에러')
        return [];
    }
}
export const uploadFileByManager = async (params) => {// 관리자 파일 단일 업로드
    const { file } = params;
    let result = await multipleFileUploadByCloudinary(file);
    return result;
}
export const uploadFilesByManager = async (params) => {// 관리자 파일 여러개 업로드
    let { images = [] } = params;
    images = images.map((item) => { return item?.image })
    let result = await multipleFileUploadByCloudinary(images);
    return result;
}
const uploadFileByCloudinary = async (file) => {
    try {
        let formData = new FormData();
        formData.append("file", file);
        formData.append('upload_preset', process.env.CLOUDINARY_PRESET); // Cloudinary 대시보드에서 설정
        let result = await axios.post(`${process.env.CLOUDINARY_URL}/${process.env.CLOUDINARY_NAME}/image/upload`, formData);
        result.data.url = result.data.url.replaceAll('http://', 'https://')
        return result?.data;
    } catch (err) {
        console.log(err);
        return false;
    }
}
const multipleFileUploadByCloudinary = async (files) => {
    let result = undefined;
    if (typeof files.length == 'number') {
        let result_list = [];
        for (var i = 0; i < files.length; i++) {
            result_list.push(uploadFileByCloudinary(files[i]));
        }
        for (var i = 0; i < result_list.length; i++) {
            await result_list[i];
        }
        result = (await when(result_list));
        let list = [];
        for (var i = 0; i < (await result).length; i++) {
            list.push(await result[i]);
        }
        return list;
    } else {
        let result = await uploadFileByCloudinary(files)
        return result;
    }
}
const settingdeleteImageObj = async (obj_) => {//이미지 존재안할시 삭제함
    let obj = obj_;
    let keys = Object.keys(obj);
    let img_list = [];
    for (var i = 0; i < keys.length; i++) {
        if (keys[i].slice(-5) == '_file' && obj[keys[i]]) {
            img_list.push({
                image: obj[keys[i]]
            })
        }
    }
    let upload_files = await uploadFilesByManager({
        images: img_list,
    })
    let upload_idx = 0;
    for (var i = 0; i < keys.length; i++) {
        if (keys[i].slice(-5) == '_file' && obj[keys[i]]) {
            let key = keys[i].split('_file')[0];
            obj[`${key}_img`] = upload_files[upload_idx]?.url
            upload_idx++;
        }
    }
    for (var i = 0; i < keys.length; i++) {
        if (keys[i].slice(-5) == '_file') {
            delete obj[keys[i]];
        }
    }
    return obj;
}
const settingParams = async (table, type, params) => {
    let obj = { ...params };
    let keys = Object.keys(obj);
    if (type == 'create') {
        obj = await settingdeleteImageObj(obj);
    }
    if (type == 'update') {
        obj = await settingdeleteImageObj(obj);
    }
    return obj
}

