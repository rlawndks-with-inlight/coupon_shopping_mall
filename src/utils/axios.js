import axios from 'axios';
import { getCookie } from './react-cookie';
import { HOST_API_KEY } from 'src/config-global';

export const axiosIns = (host, protocol) => {
  let dns_info = {
    // You can add your headers here
    // ================================
    baseURL: (protocol || window.location.protocol) + "//" + (host || window.location.host),
    timeout: 30000,
    headers: {
      "Authorization": `Bearer ${getCookie('o')}`,
      'Accept': 'application/json',
      "Content-Type": "application/json",
    },
    withCredentials: true,
  }
  const axiosIns = axios.create(dns_info)

  return axiosIns;
}
export const notiAxiosIns = (host, protocol) => {
  let dns_info = {
    // You can add your headers here
    // ================================
    baseURL: (protocol || window.location.protocol) + "//" + (host || window.location.host),
    timeout: 30000,
    headers: {
      "Authorization": `Bearer ${getCookie('o')}`,
      'Accept': 'application/json',
      "Content-Type": "application/json",
    },
    withCredentials: false
  }

  const axiosIns = axios.create(dns_info)

  return axiosIns;
}

const axiosInstance = axios.create({ baseURL: HOST_API_KEY });

// GET 요청 중복 제거: 동일 URL 요청이 진행 중이면 기존 Promise 재사용
const pendingRequests = new Map();
const originalGet = axiosInstance.get.bind(axiosInstance);
axiosInstance.get = function (url, config) {
  const key = url + (config?.params ? JSON.stringify(config.params) : '');
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  const promise = originalGet(url, config).finally(() => {
    pendingRequests.delete(key);
  });
  pendingRequests.set(key, promise);
  return promise;
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;
