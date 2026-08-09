export const objToQuery = obj_ => {
  let obj = { ...obj_ }
  let query = ''
  for (var i = 0; i < Object.keys(obj).length; i++) {
    if (i == 0) {
      query += '?'
    }
    query += `${Object.keys(obj)[i]}=${obj[Object.keys(obj)[i]]}&`
  }

  return query
}
export const getProductStatus = num => {

  if (num == 0) {
    return {
      text: '판매중',
      color: 'info'
    }
  } else if (num == 1) {
    return {
      text: '중단됨',
      color: 'warning'
    }
  } else if (num == 2) {
    return {
      text: '품절',
      color: 'error'
    }
  } else if (num == 3) {
    return {
      text: '새상품',
      color: 'info'
    }
  }
  return {}
}
export const isPurchasable = (status) => getProductStatus(status).color === 'info';

// 로그인 후 돌아갈 경로를 고른다.
//
// 예전엔 로그인하면 무조건 홈(쇼핑몰형) 또는 마이페이지(블로그형)로 갔다.
// 장바구니·게시글 쓰기처럼 로그인이 필요해 튕겨 나온 사람도 원래 보던 화면으로
// 돌아가지 못하고 처음부터 다시 찾아가야 했다.
//
// ⚠ 외부 URL 을 그대로 받으면 열린 리다이렉트가 된다(피싱 경유지로 쓰인다).
//    '내부 절대경로'만 허용한다.
export const safeRedirectPath = (value, fallback = '/shop') => {
  const raw = Array.isArray(value) ? value[0] : value;
  const path = String(raw ?? '').trim();
  if (!path) return fallback;
  // 내부 절대경로만 통과시킨다.
  //   · '/' 로 시작하지 않으면 외부 URL 이거나 상대경로다.
  //   · '//host' 와 '/\host' 는 브라우저가 프로토콜 상대 URL 로 해석해 외부로 나간다.
  if (!/^\/[^/\\]/.test(path)) return fallback;
  return path;
};
export const getPointType = row => {
  if (row?.type == 0) {
    return '결제완료건에 의한 포인트'
  } else if (row?.type == 5) {
    return '결제취소건에 의한 포인트'
  } else if (row?.type == 10) {
    return '구매에 사용한 포인트 감소건'
  } else if (row?.type == 15) {
    return '관리자에 의해 추가'
  } else if (row?.type == 20) {
    return '관리자에 의한 감소'
  } else {
    return '잘못된 타입'
  }
}
export const getMainObjIdList = (main_obj = [], type, id_list_ = [], is_children) => {
  // 같은 타입에서 WHERE IN 문에 사용될 ids를 세팅한다.
  let id_list = id_list_
  for (var i = 0; i < main_obj.length; i++) {
    if (main_obj[i]?.type == type) {
      if (is_children) {
        for (var j = 0; j < main_obj[i]?.list.length; j++) {
          id_list = [...id_list, ...(main_obj[i]?.list[j]?.list ?? [])]
        }
      } else {
        id_list = [...id_list, ...(main_obj[i]?.list ?? [])]
      }
    }
  }
  id_list = new Set(id_list)
  id_list = [...id_list]
  return id_list
}
export const getMainObjContentByIdList = (main_obj_ = [], type, content_list = [], is_children, is_new) => {
  //ids 를 가지고 컨텐츠로 채워 넣는다.
  let main_obj = main_obj_
  let content_obj = makeObjByList('id', content_list)
  main_obj = main_obj.map(section => {
    if (section?.type == type) {
      if (is_new) {
        let new_list = content_list.sort((a, b) => {
          if (a.id < b.id) return 1
          if (a.id > b.id) return -1
          return 0
        })
        return {
          ...section,
          list: new_list.splice(0, 10)
        }
      } else if (is_children) {
        section.list = (section?.list ?? []).map(children => {
          children.list = (children?.list ?? []).map(id => {
            if (content_obj[id]) {
              return {
                ...content_obj[id][0]
              }
            } else {
              return {}
            }
          })
          return {
            ...children
          }
        })
        return { ...section }
      } else {
        let section_list = (section?.list ?? []).map(id => {
          if (content_obj[id]) {
            return {
              ...content_obj[id][0]
            }
          } else {
            return {}
          }
        })
        return {
          ...section,
          list: section_list
        }
      }
    } else {
      return { ...section }
    }
  })
  return main_obj
}
export const makeObjByList = (key, list = []) => {
  let obj = {}
  for (var i = 0; i < list.length; i++) {
    if (!obj[list[i][key]]) {
      obj[list[i][key]] = []
    }
    obj[list[i][key]].push(list[i])
  }
  return obj
}
export const makeMaxPage = (total, page_cut) => {
  if (total % page_cut == 0) {
    return total / page_cut
  } else {
    return parseInt(total / page_cut) + 1
  }
}

export const returnMoment = (num, date) => {
  //num 0: 오늘, num -1: 어제 , date->new Date() 인자로 받음
  try {
    var today = new Date()
    if (num) {
      let new_date = new Date(today.setDate(today.getDate() + num))
      today = new_date
    }
    if (date) {
      today = date
    }
    var year = today.getFullYear()
    var month = ('0' + (today.getMonth() + 1)).slice(-2)
    var day = ('0' + today.getDate()).slice(-2)
    var dateString = year + '-' + month + '-' + day
    var hours = ('0' + today.getHours()).slice(-2)
    var minutes = ('0' + today.getMinutes()).slice(-2)
    var seconds = ('0' + today.getSeconds()).slice(-2)
    var timeString = hours + ':' + minutes + ':' + seconds
    let moment = dateString + ' ' + timeString
    return moment
  } catch (err) {
    console.log(err)
    return false
  }
}

export const commarNumber = num => {
  if (!num) {
    return 0
  }
  if (num > 0 && num < 0.000001) {
    return '0.00'
  }
  if (!num && num != 0) {
    return undefined
  }
  let str = ''
  if (typeof num == 'string') {
    str = num
  } else {
    str = num.toString()
  }

  let decimal = ''
  if (str.includes('.')) {
    decimal = '.' + str.split('.')[1].substring(0, 2)
    str = str.split('.')[0]
  } else {
    decimal = ''
  }
  if (str?.length <= 3) {
    return str + decimal
  }
  let result = ''
  let count = 0
  for (var i = str?.length - 1; i >= 0; i--) {
    if (count % 3 == 0 && count != 0 && !isNaN(parseInt(str[i]))) result = ',' + result
    result = str[i] + result
    count++
  }
  return result + decimal
}

export const getDomain = () => {
  let domain = window.location.hostname

  return domain()
}

export const getUserLevelByNumber = num => {
  if (num == 0) return '일반유저'
  else if (num == 10) return '셀러'
  else if (num == 15) return '영업자'
  else if (num == 20) return '총판'
  else if (num == 40) return '관리자'
  else if (num == 50) return '개발사'
  else return '잘못된레벨'
}
export const getTrxStatusByNumber = num => {
  if (num == 0) return '결제대기'
  else if (num == 1) return '취소요청'
  else if (num == 5) return '결제완료'
  else if (num == 10) return '입고'
  else if (num == 15) return '출고'
  else if (num == 20) return '배송중'
  else if (num == 25) return '배송완료'
  else return '---'
}
export const getMyPageParamByNumber = num => {
  if (num == 0) return 'users'
  else if (num == 10) return 'sellers'
  else if (num == 15) return 'users'
  else if (num == 20) return 'users'
  else if (num == 30) return 'users'
  else if (num == 35) return 'operators'
  else if (num == 40) return 'operators'
  else if (num == 45) return 'operators'
  else if (num == 50) return 'operators'
  else return '잘못된레벨'
}
export const getPostCategoryTypeByNumber = num => {
  if (num == 0) return '일반형'
  else if (num == 1) return '갤러리형'
  else return '잘못된타입'
}
export const getPostCategoryReadTypeByNumber = num => {
  if (num == 0) return '모두'
  else if (num == 1) return '자신 및 관리자만'
  else return '잘못된타입'
}
export const useEditPageImg = img_ => {
  try {
    let img = img_ ? img_[0] : ''
    if (typeof img == 'string') {
      img = ''
    }

    return img
  } catch (err) {
    console.log(err)

    return ''
  }
}

export function base64toFile(base_data, filename) {
  var arr = base_data.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new File([u8arr], filename, { type: mime })
}
export const getBackgroundColor = theme => {
  if (theme.palette.mode == 'dark') {
    return '#2f3349'
  } else {
    return '#fff'
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
            longitude: position.coords.longitude
          })
        },
        function (error) {
          console.error(error)
          resolve({
            latitude: 36.48509,
            longitude: 127.30035
          })
        },
        {
          enableHighAccuracy: false,
          maximumAge: 0,
          timeout: Infinity
        }
      )
    }).then(async coords => {
      return coords
    })
  }
  console.info('GPS를 지원하지 않습니다')
  return {
    latitude: 36.48509,
    longitude: 127.30035
  }
}
export const dateMinus = (s_dt, e_dt) => {
  //두날짜의 시간차 s_dt - e_dt //포맷:0000-00-00

  let f_d = new Date(s_dt).getTime()
  let s_d = new Date(e_dt).getTime()
  let hour = (f_d - s_d) / (1000 * 3600)
  let minute = (f_d - s_d) / (1000 * 60)
  let day = (f_d - s_d) / (1000 * 3600 * 24)

  return day
}
export const getKakaoInfo = () => {
  let KAKAO_CLIENT_ID = `73b89581dcdc34aea90a3e61cdc168e2`
  let KAKAO_REDIRECT_URI = `${window.location.origin}`
  let KAKAO_AUTH_URL = ``
  return {
    KAKAO_CLIENT_ID: KAKAO_CLIENT_ID,
    KAKAO_REDIRECT_URI: KAKAO_REDIRECT_URI,
    KAKAO_AUTH_URL: KAKAO_AUTH_URL
  }
}

export const detetimeFormat = datetime => {
  return `${datetime.substring(0, 4)}년 ${datetime.substring(5, 7)}월 ${datetime.substring(
    8,
    10
  )}일 ${datetime.substring(11, 19)}`
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
  return window.innerWidth > 1000
}
export function getAllIdsWithParents(categories) {
  const result = []
  function traverseCategories(category, parentIds = []) {
    const idsWithParents = [...parentIds, category]
    result.push(idsWithParents)

    if (category.children && category.children.length > 0) {
      for (const child of category.children) {
        traverseCategories(child, idsWithParents)
      }
    }
  }
  for (const category of categories) {
    traverseCategories(category)
  }
  return result
}
export const getDownToTopChildren = (children_id, themeCategoryList) => {
  let top_down_ids = getAllIdsWithParents(themeCategoryList)
  let result = []
  for (var i = 0; i < top_down_ids.length; i++) {
    if (top_down_ids[i][top_down_ids[i].length - 1]?.id == children_id) {
      result = top_down_ids[i]
      break
    }
  }
  result = result.map(item => {
    return item?.id
  })
  return result
}
export function hexToRgb(hex) {
  // hex 값의 # 기호를 제거합니다.
  hex = hex.replace('#', '')

  // hex 값을 R, G, B로 나눕니다.
  var r = parseInt(hex.substring(0, 2), 16)
  var g = parseInt(hex.substring(2, 4), 16)
  var b = parseInt(hex.substring(4, 6), 16)

  // RGB 값을 객체로 반환합니다.
  return { r, g, b }
}
export function findChildIds(data, id) {
  const children = data.filter(item => item.parent_id == id).map(item => item.id)
  children.forEach(child => {
    children.push(...findChildIds(data, child))
  })
  return children
}
export function findParent(data, item) {
  if (!(item.parent_id > 0)) {
    return item
  } else {
    let result = data.filter(itm => itm.id == item.parent_id)
    return findParent(data, result[0])
  }
}

export const getMainObjType = (type_ = "") => {
  let type = type_;
  let type_split_list = type.split('-');
  for (var i = 0; i < type_split_list.length; i++) {
    if (!isNaN(parseInt(type_split_list[i]))) {
      type_split_list[i] = ':num';
    }
  }
  type = type_split_list.join('-');
  return type;
}
export const getNumberByPercent = (num = 0, percent = 0) => {
  return Math.round(num * (percent).toFixed(0) / 100);
}
export const getPercentByNumber = (num = 1, sub_num = 0) => {
  return Math.round(sub_num / num * 100);
}

// 표시 금액. **언어와 상관없이 언제나 원화(KRW) 그대로다.**
//
// [예전 동작] 하드코딩 환율표(en 0.00074 / cn 0.0054 / ja 0.11 / vi 18.42)로 화면 금액을 환산했다.
//   그래서 언어를 영어로 바꾸면 10,000원짜리가 "$7.4" 로 보였다.
// [문제] 실제 청구는 환산을 전혀 거치지 않는다 — makePayData·calculatorPrice 는 DB 원본 숫자를
//   그대로 쓰고 PG 도 전부 원화 결제다. 즉 **본 금액과 결제되는 금액이 통화부터 달랐다.**
//   환율표도 갱신 지점이 없어 시세와 계속 벌어졌고, 목록·상세·장바구니가 각각 다른 시점에
//   반올림해 합계가 안 맞았다. es(스페인어)는 표에 아예 없어 원화 숫자에 다른 단위가 붙었다.
// [확인] 운영 DB 상품 148,131건 전부 price_lang='ko' 다(관리자 화면에 통화 입력칸 자체가 없고
//   생성·수정 기본값이 'ko'). 즉 저장된 숫자는 예외 없이 원화이므로 그대로 보여주는 것이 맞다.
//
// 인자를 그대로 두는 이유: 호출부가 41곳이라 시그니처를 바꾸면 그 전부를 손대야 한다.
// 나중에 실제 다통화가 필요해지면 여기 한 곳에 실시간 환율을 붙이고,
// **결제 금액도 같은 함수를 거치게** 만들어야 한다(그러지 않으면 같은 문제가 되풀이된다).
export const setProductPriceByLang = (product_ = {}, price_column = 'product_sale_price', from_lang_ = 'ko', to_lang_ = 'ko') => {
  const product = product_ ?? {};
  return parseFloat(product[price_column] ?? 0) || 0;
}
function countDecimalPlaces(number) {
  const numberString = number.toString();
  const decimalIndex = numberString.indexOf('.');

  if (decimalIndex === -1) {
    return 0;
  }

  return numberString.length - decimalIndex - 1;
}
// 금액 단위. 결제는 어느 언어에서나 원화로 이뤄지므로 단위도 원화만 쓴다.
// 한국어는 기존처럼 '원', 그 외 언어는 국제 표기 'KRW'.
// (예전엔 $ · ¥ · VND 를 붙였는데, 붙는 숫자는 환산된 값이고 실제 청구는 원화라
//  고객이 보는 통화와 결제되는 통화가 달랐다 — setProductPriceByLang 주석 참고)
export const getPriceUnitByLang = (lang_ = 'ko') => {
  return lang_ === 'ko' ? '원' : 'KRW';
}

export function generateRandomString(length = 1) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}

// 전화번호 입력 정제 — 숫자와 하이픈만 남긴다.
// 비회원 주문서에서 아무 글자나 입력되던 문제(한글·영문·특수문자 모두 통과) 대응.
// 입력 중에는 하이픈을 허용해야 하므로(010-1234-5678 직접 타이핑) 숫자만 남기지 않는다.
// 길이는 20자로 제한 — DB 컬럼과 PG 전송 규격 모두 이 이하다.
export const sanitizePhoneInput = (value = '') =>
  String(value ?? '').replace(/[^0-9-]/g, '').slice(0, 20);

// 저장/전송 직전 정규화 — 하이픈까지 제거한 숫자만.
export const normalizePhone = (value = '') => String(value ?? '').replace(/[^0-9]/g, '');

// 국내 휴대폰/일반전화로 성립하는 자릿수인지. (숫자 기준 9~11자리)
// 형식 강제가 아니라 '명백히 잘못된 값'만 걸러내는 용도.
export const isValidPhoneNumber = (value = '') => {
  const digits = normalizePhone(value);
  return digits.length >= 9 && digits.length <= 11;
};

// ── 주문번호 생성 ───────────────────────────────────────────────────────────
// 기존 형식: `${user_id || password}${타임스탬프11자리}`
//   → 비회원 주문은 접두부가 '주문조회 비밀번호' 그 자체였다.
//     주문번호는 주문완료 화면·관리자 목록·PG 요청 URL 경로에까지 노출되므로,
//     뒤 11자를 떼면 누구나 비밀번호를 알 수 있었고 주문조회 인증이 무력화됐다.
//     회원 주문도 접두부가 작은 정수(user_id)라 추측이 쉬웠다.
//
// 새 형식: <날짜시각 14자리><난수 6자리>  예) 20260807153012K7X2M9
//   · 신원·비밀 정보를 전혀 담지 않는다
//   · 영숫자만 사용 → 페이레터·포스페이의 영숫자 필터와 길이 제한(50/64자)에 안전
//   · 같은 100ms 안에 여러 건이 들어와도 난수 6자리(36^6 ≈ 21.7억)로 충돌을 피한다
const ORD_NUM_ALPHABET = 'ABCDEFGHIJKLMNPQRSTUVWXYZ23456789'; // 혼동 문자(O,0,I,1) 제외

const randomOrdSuffix = (len = 6) => {
  let out = '';
  const n = ORD_NUM_ALPHABET.length;
  // 브라우저 CSPRNG 우선, 없으면 Math.random 폴백(SSR·구형 브라우저 대비)
  const cryptoObj = (typeof window !== 'undefined' && window.crypto) ? window.crypto : null;
  if (cryptoObj?.getRandomValues) {
    const buf = new Uint32Array(len);
    cryptoObj.getRandomValues(buf);
    for (let i = 0; i < len; i++) out += ORD_NUM_ALPHABET[buf[i] % n];
  } else {
    for (let i = 0; i < len; i++) out += ORD_NUM_ALPHABET[Math.floor(Math.random() * n)];
  }
  return out;
};

/**
 * 주문번호를 만든다. prefix 는 PG 구분자(예: 'PL', 'FS')가 필요할 때만 쓴다.
 * 반환 길이 = prefix + 20자.
 */
export const makeOrdNum = (prefix = '') => {
  const d = new Date();
  const p = (v, l = 2) => String(v).padStart(l, '0');
  const stamp = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  return `${prefix}${stamp}${randomOrdSuffix(6)}`.replace(/[^a-zA-Z0-9]/g, '');
};

// ── 회원가입 payload 보정 ────────────────────────────────────────────────────
// 가입폼에서 '닉네임' 칸을 없애고 이름 하나만 받기로 했다(전 프레임 공통).
// 그런데 코드 전반 — 마이페이지 인사말, 회원정보 표시(라벨이 아예 '이름'인데 값은
// nickname 이다), 주문자명 폴백(user?.name ?? user?.nickname) — 이 nickname 을
// 표시용 이름으로 쓰고 있다. 비워 보내면 이름이 안 나오는 화면이 생긴다.
// → nickname 에 이름을 그대로 넣어 저장한다. 기존 회원 데이터는 건드리지 않는다.
export const withSignUpName = (user) => ({ ...user, nickname: user?.name ?? '' });

// 관리자 영역인지. JwtContext 가 예전부터 이 이름으로 import 하고 있었는데 정의가 없어
// 비로그인 초기화 때마다 TypeError 가 났고, 그 줄의 /manager/login 리다이렉트가 죽어 있었다.
// (지금은 ManagerLayout 이 대신 밀어주지만 그 레이아웃을 안 쓰는 화면이 생기면 무방비다)
export const isManagerRouter = (router) =>
  String(router?.pathname ?? '').startsWith('/manager');
