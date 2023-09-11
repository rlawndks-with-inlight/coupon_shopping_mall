import axios from 'axios';
import { getCookie } from './react-cookie';

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

