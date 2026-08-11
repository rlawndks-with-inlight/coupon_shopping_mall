import { toast } from "react-hot-toast";
import i18n from "src/locales/i18n";
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

// 서버가 보내는 실패 사유를 화면 언어로 바꿔 띄운다.
//
// 백엔드에는 언어 개념이 없어서 메시지가 한국어 한 벌뿐이다. 그래서 영어로 쇼핑몰을
// 보다가 무언가 실패하면 그 알림만 한국어로 떴다.
// 사전(locales/langs/*)에 같은 문장이 키로 있으면 그 언어로 바꾸고, 없으면 원문 그대로 둔다
// — i18next 는 못 찾은 키를 그대로 돌려주므로, 사전에 없는 메시지는 지금과 똑같이 동작한다.
const serverMessage = (message) => {
    const text = String(message ?? '').trim();
    if (!text) return message;
    try {
        return i18n.t(text);
    } catch {
        return message;
    }
};

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
            toast.error(serverMessage(response?.message));
            return false;
        }
    } catch (err) {
        console.log(err)
        setLastApiError(err?.message);
        toast.error(serverMessage(err?.message));
        return false;
    }
}
export const deleteItem = async (url, obj) => {
    try {
        const { data: response } = await axios.delete(url, obj);
        if (response?.result > 0) {
            return response?.data;
        } else {
            toast.error(serverMessage(response?.message));
            return false;
        }
    } catch (err) {
        console.log(err)
        toast.error(serverMessage(err?.response?.data?.message || err?.message));
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
            toast.error(serverMessage(response?.message));
            return false;
        }
    } catch (err) {
        console.log(err)
        toast.error(serverMessage(err?.message));
        return false;
    }
}
// 쿼리스트링을 만든다.
//
// ⚠ new URLSearchParams({ user_id: undefined }) 는 키를 빼는 게 아니라
//   `user_id=undefined` 라는 **문자열**을 만든다(null 이면 'null'). 서버는 그 값을
//   Number('undefined') = NaN 으로 읽고 조건을 못 만족시켜 거절한다.
//   실제로 배송지 조회가 이 이유로 계속 실패하고 있었다(로그인 전에 호출 → user_id=undefined
//   → '권한이 없습니다'). 백엔드는 'user_id 를 안 주면 본인' 규칙이라 아예 안 보내는 게 맞다.
//   빈 문자열('')은 '조건 없음'이라는 뜻이 있어 그대로 둔다.
const toQuery = (params) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params ?? {})) {
        if (value === undefined || value === null) continue;
        query.append(key, value);
    }
    return query.toString();
};

export const get = async (url, params) => {
    try {
        let query = toQuery(params)

        const { data: response } = await axios.get(`${url}?${query}`);

        if (response?.result > 0) {
            return response?.data;
        } else {
            toast.error(serverMessage(response?.message));
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
    // 업로드 실패를 조용히 넘기지 않는다.
    //
    // [증상] Cloudinary 업로드가 실패해도 아무 안내 없이 '저장 되었습니다' 가 떴다.
    //        가맹점은 이미지가 올라간 줄 알고 넘어가는데 실제로는 안 올라가 있다.
    // [원인] uploadFileByCloudinary 가 실패 시 false 를 돌려주고, 여기서 `?.url` 로 벗겨
    //        undefined 를 그대로 `${key}_img` 에 넣었다. 알림도 없었다.
    // [수정] 실패한 항목은 **키를 아예 넣지 않는다.** 백엔드 updateQuery 는 보내지 않은 컬럼을
    //        SET 절에서 빼므로 기존 이미지가 그대로 유지된다(undefined 를 넣으면 신규 등록에서
    //        빈 값이 되고, 수정에서도 의도가 모호해진다). 그리고 몇 장이 실패했는지 알린다.
    let upload_idx = 0;
    let failed_uploads = 0;
    for (var i = 0; i < keys.length; i++) {
        if (keys[i].slice(-5) == '_file' && obj[keys[i]]) {
            let key = keys[i].split('_file')[0];
            const uploaded = upload_files?.[upload_idx];
            upload_idx++;
            if (uploaded?.url) {
                obj[`${key}_img`] = uploaded.url;
            } else {
                failed_uploads++;
            }
        }
    }
    if (failed_uploads > 0) {
        toast.error(`이미지 ${failed_uploads}장을 올리지 못했습니다. 나머지 내용만 저장되니 이미지는 다시 등록해 주세요.`);
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

