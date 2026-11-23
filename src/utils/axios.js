import axios from 'axios';
import { getCookie } from './react-cookie';
import { HOST_API_KEY } from 'src/config-global';
import { isDemoHost } from 'src/components/main-site/frameList';
import { 접속몰주소 } from './visit-dns';

// 모든 API 요청에 「지금 몰 주소」를 붙인다(X-Shop-Dns). 백엔드는 dns 쿠키가 없을 때만 이 값으로 몰을 정한다
// (utils.js/dns-fallback.js — 쿠키를 안 싣는 네이버 검색 로봇이 몰을 빈 화면으로 보던 문제, 2026-11-23).
// 아래 instance 들을 만들기 전에 기본값에 넣어야 그 instance 들에도 실린다(axios.create 는 만들 때 기본값을 복사한다).
// 머리말 값은 ASCII 여야 한다 — 한글 도메인(IDN)은 브라우저가 이미 punycode 로 준다.
if (typeof window !== 'undefined') {
  const 몰주소 = 접속몰주소(window.location.host).toLowerCase();
  if (/^[a-z0-9.-]+$/.test(몰주소) && 몰주소.includes('.')) axios.defaults.headers.common['X-Shop-Dns'] = 몰주소;
}

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
