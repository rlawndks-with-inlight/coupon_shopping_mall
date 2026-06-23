import axios from 'axios';
import { getCookie } from './react-cookie';
import { HOST_API_KEY } from 'src/config-global';
import { isDemoHost } from 'src/components/main-site/frameList';

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

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

// 데모 미리보기(demo-N.* 서브도메인)에서는 쓰기 요청(로그인/가입/주문/리뷰 등)을 차단해
// 실제 브랜드 데이터가 변경되지 않도록 한다. 조회(GET)는 허용.
axiosInstance.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();
  if (isDemoHost() && method !== 'get') {
    return Promise.reject(new Error('데모 미리보기에서는 이용할 수 없습니다.'));
  }
  return config;
});

export default axiosInstance;
