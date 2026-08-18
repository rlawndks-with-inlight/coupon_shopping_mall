
export const productSortTypeList = [
    { label: '일반형', value: 0 },
    { label: '가나다 또는 abc 형', value: 1 },
]
export const userStatusList = [
    { label: '정상', value: 0 },
    { label: '가입신청대기', value: 1 },
    { label: '로그인차단', value: 2 },
    { label: '탈퇴', value: 3 },
]
// 회원목록 엑셀 내려받기에서 쓴다(화면은 Select 로 보여주지만 엑셀엔 글자가 들어가야 한다).
export const getUserStatusByNum = (num) =>
    userStatusList.find(itm => itm.value == num)?.label ?? '---'
export const userLevelList = [
    { label: '일반유저', value: 0 },
    { label: '셀러', value: 10 },
    { label: '영업자', value: 15 },
    { label: '총판', value: 20 },
    { label: '관리자', value: 40 },
    { label: '개발사', value: 50 },
]
export const productPropertyCanSelectMultipleList = [
    { label: '불가능(단일)', value: 0 },
    { label: '가능(여러개)', value: 1 },
]
export const paymentModuleTypeList = [
    { label: '수기결제(페이베리)', value: 1 },
    { label: '인증결제(페이베리)', value: 2 },
    { label: '수기결제(핀트리)', value: 3 },
    { label: '인증결제(핀트리)', value: 4 },
    { label: '수기결제(오르다)', value: 5 },
    { label: '무통장입금', value: 10 },
    { label: '상품권결제', value: 11 },
    //{ label: '수기결제(위루트)', value: 20 },
    { label: '인증결제(위루트)', value: 21 },
    { label: '인증결제(헥토)', value: 30 },
    { label: '휴대폰결제(헥토)', value: 31 },
    { label: '카드결제(페이레터-테스트)', value: 40 },
    { label: '인증결제(포스페이)', value: 41 },
    { label: 'SMS결제', value: 50 },
]
// 포스페이(41) 결제수단 — 어드민 노출/라우팅 설정용. 백엔드 FORSPAY_METHODS와 동일 키.
// icon: @iconify 아이콘명, color: 브랜드 색(매장 결제수단 목록 앞 로고에 사용)
export const forspayMethodList = [
    { key: 'card', label: '신용카드(국내발행)', icon: 'mdi:credit-card-outline', color: '#5B6472' },
    { key: 'bank', label: '실시간계좌이체', icon: 'mdi:bank-outline', color: '#5B6472' },
    { key: 'kakaopay', label: '카카오페이', icon: 'simple-icons:kakaotalk', color: '#FEE500' },
    { key: 'naverpay', label: '네이버페이', icon: 'simple-icons:naver', color: '#03C75A' },
    { key: 'linepay', label: '라인페이', icon: 'simple-icons:line', color: '#00C300' },
    { key: 'foreign_card', label: '해외발행카드', icon: 'mdi:earth', color: '#5B6472' },
    { key: 'wechat', label: '위챗페이', icon: 'simple-icons:wechat', color: '#09B83E' },
    { key: 'alipay', label: '알리페이', icon: 'simple-icons:alipay', color: '#1677FF' },
    { key: 'samsungpay', label: '삼성페이 (준비중·협력사 확인 필요)', icon: 'simple-icons:samsungpay', color: '#1428A0', pending: true },
]
// 포스페이 PG provider — 빈 값이면 모듈 기본(MID) 또는 포스페이 자동 라우팅.
export const forspayProviderList = [
    { value: '', label: '기본(모듈 MID값)' },
    { value: 1, label: 'PayLetter (페이레터)' },
    { value: 4, label: 'NICEPAY (나이스정보통신)' },
    { value: 0, label: 'NHN KCP' },
    { value: 2, label: 'KSNET' },
    { value: 3, label: 'Danal' },
]
export const bankCodeList = [
    { value: '001', label: '한국은행', },
    { value: '002', label: '산업은행', },
    { value: '003', label: '기업은행', },
    { value: '004', label: 'KB국민은행', },
    { value: '007', label: '수협은행', },
    { value: '008', label: '수출입은행', },
    { value: '011', label: 'NH농협은행', },
    { value: '012', label: '농축협(단위)', },
    { value: '020', label: '우리은행', },
    { value: '023', label: 'SC제일은행', },
    { value: '027', label: '한국씨티', },
    { value: '031', label: '대구은행', },
    { value: '032', label: '부산은행', },
    { value: '034', label: '광주은행', },
    { value: '035', label: '제주은행', },
    { value: '037', label: '전북은행', },
    { value: '039', label: '경남은행', },
    { value: '045', label: '새마을금고중앙회', },
    { value: '048', label: '신협중앙회', },
    { value: '050', label: '저축은행', },
    { value: '064', label: '산림조합중앙회', },
    { value: '071', label: '우체국', },
    { value: '081', label: '하나은행', },
    { value: '088', label: '신한은행', },
    { value: '089', label: '케이뱅크', },
    { value: '090', label: '카카오뱅크', },
    { value: '092', label: '토스뱅크', },
    { value: '105', label: '웰컴저축은행' },
]
export const genderList = [
    { label: '남자', value: 'M' },
    { label: '여자', value: 'F' },
]
export const ntvFrnrList = [
    { label: '내국인', value: 'L' },
    { label: '외국인', value: 'F' },
]
export const telComList = [
    { label: 'SKT', value: '01' },
    { label: 'KT', value: '02' },
    { label: 'LGU+', value: '03' },
    { label: '알뜰폰SKT', value: '04' },
    { label: '알뜰폰KT', value: '05' },
    { label: '알뜰폰LGU', value: '06' },
]
export const cancelTypeList = [
    { label: '주문취소', value: 0 },
    { label: '환불', value: 1 },
]
export const mainObjSchemaList = [
    {
        label: '배너슬라이드',
        type: 'banner',
        default_value: {
            type: 'banner',
            list: [],
            style: {
                min_height: 200
            }
        },
    },
    {
        label: '버튼형 배너슬라이드',
        type: 'button-banner',
        default_value: {
            type: 'button-banner',
            list: [],
            style: {}
        },
    },
    {
        label: '텍스트형 배너슬라이드',
        type: 'text-banner',
        default_value: {
            type: 'text-banner',
            list: [],
            style: {}
        },
    },
    {
        // 단일 상품 강조(item-hero) — setting.js 의 로컬 배열에만 있고 여기(공용 목록)에는 빠져 있어
        // 좌측 메뉴 '메인페이지관리' 하위에 이 섹션만 나타나지 않았다.
        // (config-navigation.js 는 format.js 의 이 배열로 서브메뉴를 만든다)
        label: '단일 상품 강조',
        type: 'item-hero',
        default_value: {
            type: 'item-hero',
            title: '',
            list: [],
            style: { hero_type: '1' }
        },
    },
    {
        label: '상품슬라이드',
        type: 'items',
        default_value: {
            type: 'items',
            title: '',
            sub_title: '',
            list: [],
            style: {}
        },
    },
    {
        label: 'ID 선택형 상품슬라이드',
        type: 'items-ids',
        default_value: {
            type: 'items-ids',
            title: '',
            sub_title: '',
            list: [],
            style: {}
        },
    },
    {
        label: '카테고리탭별 상품리스트',
        type: 'items-with-categories',
        default_value: {
            type: 'items-with-categories',
            title: '',
            sub_title: '',
            is_vertical: 0,
            list: [],
            style: {}
        },
    },
    {
        label: '에디터',
        type: 'editor',
        default_value: {
            type: 'editor',
            content: ''
        },
    },
    {
        label: '동영상 슬라이드',
        type: 'video-slide',
        default_value: {
            type: 'video-slide',
            title: '',
            sub_title: '',
            list: [],
            style: {}
        },
    },
    {
        label: '게시판',
        type: 'post',
        default_value: {
            type: 'post',
            list: [],
            style: {}
        },
    },
    {
        label: '셀러섹션',
        type: 'sellers',
        default_value: {
            type: 'sellers',
            list: [],
            style: {}
        },
    },
    {
        label: '상품후기',
        type: 'item-reviews',
        default_value: {
            type: 'item-reviews',
            list: [],
            style: {}
        },
    },
    {
        label: '선택형 상품후기',
        type: 'item-reviews-select',
        default_value: {
            type: 'item-reviews-select',
            title: '',
            sub_title: '',
            list: [],
            style: {}
        }
    },
]

// 번역본 꺼내기. lang_obj 는 { 컬럼명: { 언어코드: '번역문' } } 구조다.
//
// ⚠ lang_obj 가 **문자열로 올 때가 있다.** DB 컬럼이 TEXT 라 그대로 내려오는데,
//    파싱해 주는 컨트롤러(product.controller)와 안 해 주는 컨트롤러(product_category.controller 등)가
//    섞여 있다. 문자열에 ['category_name'] 을 하면 undefined 라 조용히 한국어로 되돌아갔고,
//    그래서 '카테고리는 다국어가 아예 안 먹는다' 로 보였다(번역문은 DB 에 들어 있었는데도).
//    읽는 쪽에서 흡수한다 — 컨트롤러마다 파싱을 맞추는 것보다 새는 곳이 없다.
// 현재 화면 언어 코드. utils/function.js 와 같은 이유로 locales/i18n 을 직접 import 하지 않는다
// (i18n → config-lang → components/settings → … 으로 순환한다). i18n 이 쓰는 저장소를 그대로 읽는다.
const currentLangCode = () => {
    if (typeof window === 'undefined') return 'ko';
    try {
        const raw = window.localStorage.getItem('i18nextLng')
            || JSON.parse(window.localStorage.getItem('themeDnsData') || '{}')?.setting_obj?.default_lang;
        return String(raw || 'ko').split('-')[0];
    } catch (e) {
        return 'ko';
    }
};

// 특성(character)의 선택지 목록. 화면에 보일 글자와 실제로 저장할 값을 나눠 돌려준다.
//
// [왜 나눠야 하나]
// 특성 값은 콤마로 구분된 문자열 하나다(예: '블랙,화이트'). 고객이 고른 값은
// 그대로 주문에 저장되고 가맹점 주문서·배송 목록에 그 값이 찍힌다.
// 그래서 번역본을 저장해 버리면 가맹점 화면이 일본어·중국어가 된다 —
// 보이는 건 번역, 저장되는 건 원문이어야 한다.
//
// 번역이 콤마 개수를 바꿔 놓으면(번역기가 구분자를 합치거나 늘리는 일이 있다)
// 원문↔번역 짝이 어긋난다. 그때는 번역을 통째로 포기하고 원문만 쓴다
// — 짝이 틀린 라벨을 보여주면 엉뚱한 값이 주문에 들어간다.
export const characterChoices = (character = {}, lang) => {
    const split = (v) => String(v ?? '').split(/[,/]\s*/).map((s) => s.trim()).filter(Boolean);
    const values = split(character?.character_value);
    const translated = split(formatLang(character, 'character_value', lang));
    const paired = translated.length === values.length;
    return values.map((value, i) => ({ value, label: paired ? translated[i] : value }));
};

// 번역 원문 언어. 백엔드 settingLangs 가 lang_obj 의 ko 슬롯에 원문을 넣고
// translateChunk 가 source:'ko' 로 보낸다 — 여기서만 바꾸면 되도록 상수로 둔다.
const SOURCE_LANG = 'ko';

const parseLangObj = (lang_obj) => {
    if (!lang_obj) return null;
    if (typeof lang_obj === 'object') return lang_obj;
    if (typeof lang_obj === 'string') {
        try { return JSON.parse(lang_obj); } catch (e) { return null; }
    }
    return null;
}

// 첫 글자만 대문자로. 단어마다 올리는 capitalize 를 쓰면 안 된다 —
// 스페인어 'aviso de envío' 가 'Aviso De Envío' 가 되어 오히려 틀린 표기가 된다.
// 한국어·중국어·일본어에는 대문자가 없어 toUpperCase 가 아무 일도 하지 않는다(무해).
const upperFirst = (text) => {
    const s = String(text ?? '');
    const i = s.search(/\S/);          // 앞 공백은 건너뛴다
    if (i < 0) return s;
    return s.slice(0, i) + s.charAt(i).toUpperCase() + s.slice(i + 1);
};

export const formatLang = (obj = {}, column, lang) => {
    const lang_obj = parseLangObj(obj?.lang_obj);
    // lang 은 useLocales().currentLang 객체({value:'cn',...})로 들어오지만
    // 호출부에 따라 'cn' 문자열이 그대로 들어오는 곳도 있다. 둘 다 받는다.
    //
    // 세 번째 인자를 생략하면 현재 화면 언어를 스스로 읽는다.
    // 예전 기본값은 'ko' 였는데, 그 탓에 언어를 넘기지 않은 호출부는 조용히 원문만 보여줬다.
    // 카테고리·옵션 표시를 번역 경유로 바꾸는 곳이 130곳이 넘는데, 그 파일 대부분은
    // currentLang 을 안 들고 있다(useLocales 는 훅이라 컴포넌트 밖에서는 쓸 수도 없다).
    const code = (lang && typeof lang === 'object') ? lang?.value : (lang ?? currentLangCode());
    // 원문 언어(ko)는 lang_obj 를 보지 않고 항상 현재 컬럼 값을 쓴다.
    //
    // lang_obj 의 ko 슬롯은 '번역할 때의 원문 사본'이라 원본 컬럼보다 뒤처질 수 있다.
    // 번역은 대기열(lang_processes)에 담겨 스케줄러가 1분 주기로 채우는데, 그 사이
    // 가맹점이 상품명을 고치면 products.product_name 은 새 값인데 lang_obj.ko 는 옛 값이다.
    // 그때 ko 슬롯을 우선하면 **한국어 화면에 옛 이름이 그대로 뜬다** — 가맹점이 방금 고친 걸
    // 못 보고 다시 저장하게 만든다. 게시글·카테고리는 원래부터 대기열을 써서 같은 창이 있었다.
    // ko 슬롯은 정의상 원문 사본이므로 컬럼을 우선해도 표시가 달라지는 경우는 이 '뒤처짐'뿐이다.
    if (code === SOURCE_LANG) return obj?.[column];
    const 번역본 = lang_obj?.[column]?.[code];
    // 기계번역 결과는 첫 글자가 소문자로 나온다('공지사항' → 'announcement').
    // 사전에서 온 이웃 문구는 'Orders & Delivery' 처럼 대문자로 시작하니 한 줄 걸러
    // 어색하다. 번역본을 쓸 때만 첫 글자를 올린다 — 원문(가맹점이 직접 쓴 이름)은
    // 'adidas' 처럼 일부러 소문자인 경우가 있으므로 건드리지 않는다.
    if (번역본) return upperFirst(번역본);
    return obj?.[column];
}