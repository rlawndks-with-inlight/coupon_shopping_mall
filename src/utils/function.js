import { deleteLocalStorage, getLocalStorage } from "./local-storage";
import { LOCALSTORAGE } from "src/data/data";
import { t } from "i18next";
import { toast } from "react-hot-toast";
import { deleteCookie, getCookie } from "./react-cookie";

export const objToQuery = (obj_) => {
  let obj = { ...obj_ };
  let query = "";
  for (var i = 0; i < Object.keys(obj).length; i++) {
    if (i == 0) {
      query += '?';
    }
    query += `${Object.keys(obj)[i]}=${obj[Object.keys(obj)[i]]}&`;
  }

  return query;
}
export const getProductStatus = (num) => {
  if (num == 0) {
    return {
      text: '판매중',
      color: 'info',
    }
  } else if (num == 1) {
    return {
      text: '중단됨',
      color: 'warning',
    }
  } else if (num == 2) {
    return {
      text: '품절',
      color: 'error',
    }
  }
  return {

  }
}
export const getPointType = (row) =>{
  if(row?.type == 0){
    return '결제완료건에 의한 포인트';
  }else if(row?.type == 5){
    return '결제취소건에 의한 포인트';
  }else if(row?.type == 10){
    return '구매에 사용한 포인트 감소건';
  }else if(row?.type == 15){
    return '관리자에 의해 추가';
  }else if(row?.type == 20){
    return '관리자에 의한 감소';
  } else{
    return '잘못된 타입';
  }
}
export const getMainObjIdList = (main_obj = [], type, id_list_ = [], is_children) => {// 같은 타입에서 WHERE IN 문에 사용될 ids를 세팅한다.
  let id_list = id_list_;
  for (var i = 0; i < main_obj.length; i++) {
    if (main_obj[i]?.type == type) {
      if (is_children) {
        for (var j = 0; j < main_obj[i]?.list.length; j++) {
          id_list = [...id_list, ...main_obj[i]?.list[j]?.list ?? []];
        }
      } else {
        id_list = [...id_list, ...main_obj[i]?.list ?? []];
      }
    }
  }
  id_list = new Set(id_list);
  id_list = [...id_list];
  return id_list;
}
export const getMainObjContentByIdList = (main_obj_ = [], type, content_list = [], is_children, is_new) => {//ids 를 가지고 컨텐츠로 채워 넣는다.
  let main_obj = main_obj_
  let content_obj = makeObjByList('id', content_list);
  main_obj = main_obj.map(section => {
    if (section?.type == type) {
      if (is_new) {
        let new_list = content_list.sort((a, b) => {
          if (a.id < b.id) return 1;
          if (a.id > b.id) return -1;
          return 0;
        });
        return {
          ...section,
          list: new_list.splice(0, 10)
        }
      } else if (is_children) {
        section.list = (section?.list ?? []).map(children => {
          children.list = (children?.list ?? []).map(id => {
            if (content_obj[id]) {
              return {
                ...content_obj[id][0],
              }
            } else {
              return {}
            }
          })
          return {
            ...children,
          }
        })
        return { ...section };
      } else {
        let section_list = (section?.list ?? []).map(id => {
          if (content_obj[id]) {
            return {
              ...content_obj[id][0],
            }
          } else {
            return {}
          }
        })
        return {
          ...section,
          list: section_list,
        }
      }

    } else {
      return { ...section };
    }
  })
  return main_obj;
}
export const makeObjByList = (key, list = []) => {
  let obj = {};
  for (var i = 0; i < list.length; i++) {
    if (!obj[list[i][key]]) {
      obj[list[i][key]] = [];
    }
    obj[list[i][key]].push(list[i]);
  }
  return obj;
}
export const makeMaxPage = (total, page_cut) => {
  if (total % page_cut == 0) {
    return total / page_cut;
  } else {
    return parseInt(total / page_cut) + 1;
  }
}

export const returnMoment = (num, date) => {//num 0: 오늘, num -1: 어제 , date->new Date() 인자로 받음
  try {
    var today = new Date();
    if (num) {
      let new_date = new Date(today.setDate(today.getDate() + num));
      today = new_date;
    }
    if (date) {
      today = date;
    }
    var year = today.getFullYear();
    var month = ('0' + (today.getMonth() + 1)).slice(-2);
    var day = ('0' + today.getDate()).slice(-2);
    var dateString = year + '-' + month + '-' + day;
    var hours = ('0' + today.getHours()).slice(-2);
    var minutes = ('0' + today.getMinutes()).slice(-2);
    var seconds = ('0' + today.getSeconds()).slice(-2);
    var timeString = hours + ':' + minutes + ':' + seconds;
    let moment = dateString + ' ' + timeString;
    return moment;
  } catch (err) {
    console.log(err);
    return false;
  }

}

export const commarNumber = (num) => {
  if (!num) {
    return 0;
  }
  if (num > 0 && num < 0.000001) {
    return "0.00";
  }
  if (!num && num != 0) {
    return undefined;
  }
  let str = "";
  if (typeof num == "string") {
    str = num;
  } else {
    str = num.toString();
  }

  let decimal = "";
  if (str.includes(".")) {
    decimal = "." + str.split(".")[1].substring(0, 2);
    str = str.split(".")[0];
  } else {
    decimal = "";
  }
  if (str?.length <= 3) {
    return str + decimal;
  }
  let result = "";
  let count = 0;
  for (var i = str?.length - 1; i >= 0; i--) {
    if (count % 3 == 0 && count != 0 && !isNaN(parseInt(str[i]))) result = "," + result;
    result = str[i] + result;
    count++;
  }
  return result + decimal;
}

export const getDomain = () => {
  let domain = window.location.hostname;

  return domain();
}

export const getUserLevelByNumber = (num) => {
  if (num == 0)
    return '일반유저'
  else if (num == 10)
    return '셀러'
  else if (num == 40)
    return '관리자'
  else if (num == 50)
    return '개발사'
  else
    return '잘못된레벨'
}
export const getTrxStatusByNumber = (num) => {
  if (num == 0)
    return '결제대기'
  else if (num == 1)
    return '취소요청'
  else if (num == 5)
    return '결제완료'
  else if (num == 10)
    return '입고'
  else if (num == 15)
    return '출고'
  else if (num == 20)
    return '배송중'
  else if (num == 25)
    return '배송완료'
  else
    return '---'
}
export const getMyPageParamByNumber = (num) => {
  if (num == 0)
    return 'users'
  else if (num == 10)
    return 'sellers'
  else if (num == 15)
    return 'users'
  else if (num == 20)
    return 'users'
  else if (num == 30)
    return 'users'
  else if (num == 35)
    return 'operators'
  else if (num == 40)
    return 'operators'
  else if (num == 45)
    return 'operators'
  else if (num == 50)
    return 'operators'
  else
    return '잘못된레벨'
}
export const getPostCategoryTypeByNumber = (num) => {
  if (num == 0)
    return '일반형'
  else if (num == 1)
    return '갤러리형'
  else
    return '잘못된타입'
}
export const getPostCategoryReadTypeByNumber = (num) => {
  if (num == 0)
    return '모두'
  else if (num == 1)
    return '자신 및 관리자만'
  else
    return '잘못된타입'
}
export const useEditPageImg = (img_) => {
  try {
    let img = img_ ? img_[0] : '';
    if (typeof img == 'string') {
      img = '';
    }

    return img;
  } catch (err) {
    console.log(err);

    return '';
  }
}
export const processCatch = async (err) => {
  toast.error(err?.response?.data?.message || err?.message);
  let push_link = '';
  if (err?.response?.status == 401) {
    await deleteLocalStorage(LOCALSTORAGE.USER_DATA);
    push_link = `/${window.location.pathname.split('/')[1]}/login`;
  }
  if (err?.response?.status == 403) {
    push_link = `/${window.location.pathname.split('/')[1]}/login`;
  }
  return push_link
}

export function base64toFile(base_data, filename) {
  var arr = base_data.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}
export const getBackgroundColor = (theme) => {
  if (theme.palette.mode == 'dark') {
    return '#2f3349';
  } else {
    return '#fff';
  }
}
export const handleLogout = async (router, link_) => {
  let link = link_ ?? '/';
  try {
    const response = await axiosIns().post('/api/v1/auth/sign-out', {
      headers: {
        "Authorization": `Bearer ${getCookie('o')}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      }
    });
    if (response?.status == 200) {
      await deleteCookie('o');
      await deleteLocalStorage(LOCALSTORAGE.USER_DATA);
      router.push(link);
    }
  } catch (err) {
    //toast.error(err?.response?.data?.message || err?.message);
    if ([401, 403, 409].includes(err?.response?.status)) {
      await deleteCookie('o');
      await deleteLocalStorage(LOCALSTORAGE.USER_DATA);
      router.push(link);
    }
  }
}

export function getLocation() {
  if (navigator.geolocation) {
    // GPS를 지원하면
    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        function (error) {
          console.error(error);
          resolve({
            latitude: 36.48509,
            longitude: 127.30035,
          });
        },
        {
          enableHighAccuracy: false,
          maximumAge: 0,
          timeout: Infinity,
        },
      );
    }).then(async coords => {
      return coords;
    });
  }
  console.info('GPS를 지원하지 않습니다');
  return {
    latitude: 36.48509,
    longitude: 127.30035,
  };
}
export const dateMinus = (s_dt, e_dt) => {//두날짜의 시간차 s_dt - e_dt //포맷:0000-00-00

  let f_d = new Date(s_dt).getTime();
  let s_d = new Date(e_dt).getTime();
  let hour = (f_d - s_d) / (1000 * 3600);
  let minute = (f_d - s_d) / (1000 * 60);
  let day = (f_d - s_d) / (1000 * 3600 * 24);

  return day;
}
export const getKakaoInfo = () => {
  let KAKAO_CLIENT_ID = `73b89581dcdc34aea90a3e61cdc168e2`;
  let KAKAO_REDIRECT_URI = `${window.location.origin}`;
  let KAKAO_AUTH_URL = ``;
  return {
    KAKAO_CLIENT_ID: KAKAO_CLIENT_ID,
    KAKAO_REDIRECT_URI: KAKAO_REDIRECT_URI,
    KAKAO_AUTH_URL: KAKAO_AUTH_URL,
  }
}

export const detetimeFormat = (datetime) => {
  return `${datetime.substring(0, 4)}년 ${datetime.substring(5, 7)}월 ${datetime.substring(8, 10)}일 ${datetime.substring(11, 19)}`
}
import { useEffect, useState } from 'react'

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

export default function useCountNum(end, start = 0, duration = 2000) {
  const [count, setCount] = useState(start)
  const frameRate = 1000 / 60
  const totalFrame = Math.round(duration / frameRate)

  useEffect(() => {
    let currentNumber = start
    const counter = setInterval(() => {
      const progress = easeOutExpo(++currentNumber / totalFrame)
      setCount(Math.round(end * progress))

      if (progress === 1) {
        clearInterval(counter)
      }
    }, frameRate)
  }, [end, frameRate, start, totalFrame])

  return count
}
export const isPc = () => {
  return window.innerWidth > 1000;
}
export function getAllIdsWithParents(categories) {
  const result = [];
  function traverseCategories(category, parentIds = []) {
    const idsWithParents = [...parentIds, category];
    result.push(idsWithParents);

    if (category.children && category.children.length > 0) {
      for (const child of category.children) {
        traverseCategories(child, idsWithParents);
      }
    }
  }
  for (const category of categories) {
    traverseCategories(category);
  }
  return result;
}
export const getDownToTopChildren = (children_id, themeCategoryList) => {
  let top_down_ids = getAllIdsWithParents(themeCategoryList);
  let result = [];
  for (var i = 0; i < top_down_ids.length; i++) {
    if (top_down_ids[i][top_down_ids[i].length - 1]?.id == children_id) {
      result = top_down_ids[i];
      break;
    }
  }
  result = result.map(item => {
    return item?.id;
  })
  return result;
}
export function hexToRgb(hex) {
  // hex 값의 # 기호를 제거합니다.
  hex = hex.replace("#", "");

  // hex 값을 R, G, B로 나눕니다.
  var r = parseInt(hex.substring(0, 2), 16);
  var g = parseInt(hex.substring(2, 4), 16);
  var b = parseInt(hex.substring(4, 6), 16);

  // RGB 값을 객체로 반환합니다.
  return { r, g, b };
}
export function findChildIds(data, id) {
  const children = data.filter(item => item.parent_id == id).map(item => item.id);
  children.forEach(child => {
    children.push(...findChildIds(data, child));
  });
  return children;
}
export function findParent(data, item) {
  if (!(item.parent_id > 0)) {
    return item;
  } else {
    let result = data.filter(itm => itm.id == item.parent_id);
    return findParent(data, result[0]);
  }
}