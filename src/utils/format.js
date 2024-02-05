
export const productSortTypeList = [
    { label: '일반형', value: 0 },
    { label: '가나다 또는 abc 형', value: 1 },
]
export const userLevelList = [
    { label: '일반유저', value: 0 },
    { label: '셀러', value: 10 },
    { label: '관리자', value: 40 },
    { label: '개발사', value: 50 },
]
export const productPropertyCanSelectMultipleList = [
    { label: '불가능(단일)', value: 0 },
    { label: '가능(여러개)', value: 1 },
]
export const paymentModuleTypeList = [
    { label: '수기결제', value: 1 },
    { label: '인증결제', value: 2 },
    { label: '가상계좌', value: 10 },
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

export const formatLang = (obj = {}, column, lang = 'ko') => {
    return (obj?.lang_obj && obj?.lang_obj[column] && obj?.lang_obj[column][lang?.value]) || obj[column];
}