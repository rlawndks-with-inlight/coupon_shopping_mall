import { Icon } from '@iconify/react'
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardHeader,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogContent,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography, ListSubheader } from '@mui/material'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import { Row, themeObj } from 'src/components/elements/styled-components'
import { Upload } from 'src/components/upload'
import { createDefaultManagerObj } from 'src/data/manager-data'
import { base64toFile, getMainObjType } from 'src/utils/function'
import _, { constant } from 'lodash'
import { useSettingsContext } from 'src/components/settings'
import { isShopgoBrand, isShopgoMerchant } from 'src/utils/is-shopgo'
import { 본사화면 } from 'src/utils/manager-visibility'
import { useRouter } from 'next/router'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/CustomBreadcrumbs'
import { toast } from 'react-hot-toast'
import { useModal } from 'src/components/dialog/ModalProvider'
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext'
import HomeBanner from 'src/views/section/shop/HomeBanner'
import HomeEditor from 'src/views/section/shop/HomeEditor'
import HomeItems from 'src/views/section/shop/HomeItems'
import HomeButtonBanner from 'src/views/section/shop/HomeButtonBanner'
import HomeItemsWithCategories from 'src/views/section/shop/HomeItemsWithCategories'
import HomeVideoSlide from 'src/views/section/shop/HomeVideoSlide'
import HomeItemHero from 'src/views/section/shop/HomeItemHero'
import { homeItemsSetting, homeItemsWithCategoriesSetting } from 'src/views/section/shop/utils'
import ReactQuillComponent from '../react-quill'
import { apiManager, uploadFilesByManager } from 'src/utils/api'
import { getDefaultBanners, getBannerRatio } from 'src/data/default-banners'
import { 추천섹션 } from 'src/data/frame-sections'
import BannerFitNotice from 'src/components/manager/BannerFitNotice'
import { HERO_TYPES, heroPreviewSrc, sectionPreviewSrc } from 'src/data/section-preview'

// 고른 디자인 타입이 어떤 모양인지 보여준다.
//
// 이미지는 scripts/section-preview/capture.cjs 가 만들어 public/section-preview 에 둔다.
// 아직 안 만들어졌거나 파일이 없으면 **아무것도 그리지 않는다** —
// 깨진 이미지 아이콘이 뜨면 가맹점은 자기가 뭘 잘못한 줄 안다.
// 고른 섹션이 어떤 모양인지 보여준다. HeroTypePreview 와 같은 규칙이다 —
// 이미지가 없으면 아무것도 그리지 않는다(깨진 아이콘을 보여주지 않는다).
const SectionPreview = ({ type }) => {
  const [있음, set있음] = useState(true)
  useEffect(() => { set있음(true) }, [type])
  if (!있음 || !type) return null
  return (
    <Box sx={{ mt: 1, border: '1px solid #eee', borderRadius: 1, overflow: 'hidden', lineHeight: 0 }}>
      <img src={sectionPreviewSrc(type)} alt="" onError={() => set있음(false)}
        style={{ width: '100%', display: 'block' }} />
    </Box>
  )
}

const HeroTypePreview = ({ value }) => {
  const [있음, set있음] = useState(true)
  const src = heroPreviewSrc(value || '1')
  // 타입을 바꾸면 다시 시도해야 한다. 안 그러면 한 번 없던 타입을 본 뒤로
  // 있는 타입까지 영영 안 보인다.
  useEffect(() => { set있음(true) }, [value])
  if (!있음) return null
  return (
    <Box sx={{ mt: 1, border: '1px solid #eee', borderRadius: 1, overflow: 'hidden', lineHeight: 0 }}>
      <img
        src={src}
        alt=""
        onError={() => set있음(false)}
        style={{ width: '100%', display: 'block' }}
      />
    </Box>
  )
}

const Tour = dynamic(() => import('reactour'), { ssr: false })
//메인화면
const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8

const hasTypeCount = (list, type_name) => {
  let count = 0
  for (var i = 0; i < list.length; i++) {
    if (list[i]?.type == type_name) {
      count++
    }
  }
  return count
}
const curTypeNum = (list, type_name, idx) => {
  let count = 0
  for (var i = 0; i < list.length; i++) {
    if (list[i]?.type == type_name) {
      count++
      if (idx == i) {
        break
      }
    }
  }
  return count
}
// 섹션 헤더의 조작줄(정렬·스타일 입력·순서이동·삭제).
//
// ⚠ 반드시 모듈 스코프에 있어야 한다. MainObjSetting 안에 두면 부모가 리렌더될 때마다
//   새 함수 = 새 컴포넌트 타입이 되어 React 가 하위를 통째로 언마운트→마운트하고,
//   그 순간 입력칸이 새로 만들어져 한 글자마다 포커스가 빠진다.
const SectionProcess = props => {
  const { idx, item, isProductList = 0, contentList, setContentList, onUpSection, onDownSection, deleteSection, userLevel } = props
  return (
    <>
      <Row style={{ marginLeft: 'auto', columnGap: '0.25rem' }}>
        {/* <Tooltip title="미리 보시려면 클릭해 주세요.">
          <IconButton sx={{ padding: '0.25rem' }} onClick={() => { onClickPreview(idx) }}>
            <Icon icon={'icon-park-outline:preview-open'} />
          </IconButton>
        </Tooltip> */}
        {isProductList == 1 &&
          <>
            <FormControl variant='outlined' sx={{ width: '30%' }} size='small'>
              <InputLabel>{`상품 설명 배치`}</InputLabel>
              <Select
                size='small'
                label={`상품 설명 배치`}
                value={item?.style?.text_align ?? 'center'}
                onChange={(e) => {
                  let content_list = [...contentList]
                  content_list[idx]['style']['text_align'] = e.target.value
                  setContentList(content_list)
                }}
              >
                <MenuItem value={'left'}>왼쪽</MenuItem>
                <MenuItem value={'right'}>오른쪽</MenuItem>
                <MenuItem value={'center'}>가운데</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size='small'
              label='배경색상'
              value={item?.style?.back_color ?? '#FFFFFF'}
              type='color'
              style={{
                border: 'none',
                minWidth: '80px'
              }}
              onChange={e => {
                let content_list = [...contentList]
                content_list[idx]['style']['back_color'] = e.target.value
                setContentList(content_list)
              }}
            />
            <TextField
              size='small'
              sx={{ maxWidth: '150px' }}
              label='슬라이더 속도'
              type='number'
              value={item?.style?.slider_speed ?? 0}
              onChange={e => {
                let content_list = [...contentList]
                if (!content_list[idx]?.style) {
                  content_list[idx]['style'] = {}
                }
                content_list[idx]['style']['slider_speed'] = e.target.value
                setContentList(content_list)
                //console.log(item)
              }}
              InputProps={{
                endAdornment: <>초</>
              }}
            />
            <TextField
              size='small'
              sx={{ maxWidth: '150px' }}
              label='컨텐츠 개수'
              type='number'
              value={item?.style?.rows ?? 1}
              onChange={e => {
                let content_list = [...contentList]
                if (!content_list[idx]?.style) {
                  content_list[idx]['style'] = {}
                }
                content_list[idx]['style']['rows'] = e.target.value
                setContentList(content_list)
              }}
              InputProps={{
                endAdornment: <>행</>
              }}
            />
          </>
        }
        {/*<TextField
          size='small'
          sx={{ maxWidth: '150px' }}
          label='상품 개수'
          type='number'
          value={item?.style?.columns ?? 0}
          onChange={e => {
            let content_list = [...contentList]
            if (!content_list[idx]?.style) {
              content_list[idx]['style'] = {}
            }
            content_list[idx]['style']['columns'] = e.target.value
            setContentList(content_list)
          }}
          InputProps={{
            endAdornment: <>열</>
          }}
        />*/}
        <TextField
          size='small'
          sx={{ maxWidth: '150px' }}
          label='윗마진'
          placeholder='px(픽셀) 단위'
          type='number'
          value={item?.style?.margin_top ?? 0}
          onChange={e => {
            let content_list = [...contentList]
            if (!content_list[idx]?.style) {
              content_list[idx]['style'] = {}
            }
            content_list[idx]['style']['margin_top'] = e.target.value
            setContentList(content_list)
            //console.log(item)
          }}
          InputProps={{
            endAdornment: <>px</>
          }}
        />
        <Tooltip title='해당 섹션을 한칸 올리시려면 클릭해 주세요.'>
          <IconButton
            sx={{ padding: '0.25rem' }}
            disabled={idx == 0}
            onClick={() => {
              onUpSection(idx)
            }}
          >
            <Icon icon={'grommet-icons:link-up'} />
          </IconButton>
        </Tooltip>
        <Tooltip title='해당 섹션을 한칸 내리시려면 클릭해 주세요.'>
          <IconButton
            sx={{ padding: '0.25rem' }}
            disabled={idx == contentList.length - 1}
            onClick={() => {
              onDownSection(idx)
            }}
          >
            <Icon icon={'grommet-icons:link-down'} />
          </IconButton>
        </Tooltip>
        {userLevel >= 40 && (
          <>
            <Tooltip title='해당 섹션을 삭제하시려면 클릭해 주세요.'>
              <IconButton
                sx={{ padding: '0.25rem' }}
                onClick={() => {
                  deleteSection(idx)
                }}
              >
                <Icon icon={'ph:x-bold'} />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Row>
    </>
  )
}

const MainObjSetting = props => {
  const mainObjSchemaList = [
    {
      label: '배너슬라이드',
      type: 'banner',
      default_value: {
        type: 'banner',
        list: []
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
  const { MAIN_OBJ_TYPE } = props
  const { setModal } = useModal()
  const { themeDnsData, themePostCategoryList, themePropertyList } = useSettingsContext()
  const { user } = useAuthContext()
  const router = useRouter()
  // 현재 스토어 데모 비율에 맞는 기본 배너 세트/권장크기 (demo-4·5·6·9 = 2:1, 그 외 = 2.35:1)
  // 이 프레임에서 먼저 권하는 섹션. "데모3처럼 하고 싶은데 어떻게 해요?" 에 답이 되는 자리다.
  // 막는 게 아니라 순서를 바꾸는 것이다 — 나머지도 아래에서 그대로 고를 수 있다.
  const 추천목록 = 추천섹션(themeDnsData)

  const defaultBanners = getDefaultBanners(themeDnsData?.shop_demo_num)
  const bannerRatio = getBannerRatio(themeDnsData?.shop_demo_num)

  // 모듈 전역 기본객체(defaultManagerObj.brands)를 그대로 state 에 넣으면 이 화면에서 변형될 때
  // 원본이 오염된다. 그러면 같은 SPA 세션에서 '브랜드 추가'에 들어갔을 때 직전 브랜드 값이 id째로 남아
  // 신규 브랜드 정보가 기존 가맹점에 PUT 된다. 반드시 깊은 복사본으로 시작한다.
  const [item, setItem] = useState(() => createDefaultManagerObj('brands'))
  const [contentList, setContentList] = useState([])
  const [sectionType, setSectionType] = useState('banner')
  // 「그 밖의 섹션」 펼침 여부. 기본은 접힘 —
  // 가맹점 요청(2026-08-24): "해당 타입별로 추가할 수 있는 섹션만 있으면 될듯 합니다.
  // 나머지는 안보이는게 가맹점들의 혼란은 없앨 수 있을 듯 합니다."
  // 없애지 않고 접기만 하는 이유는 목록을 만드는 자리의 주석 참고.
  const [그밖열림, set그밖열림] = useState(false)
  const [productContent, setProductContent] = useState({
    total: 100,
    content: []
  })
  const [productReviewContent, setProductReviewContent] = useState({})
  const [searchTextList, setSearchTextList] = useState([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    settingPage()
  }, [])
  // ⚠ 인자로 받은 객체를 변형하지 않는다(복사본에 채워 새 객체를 돌려준다).
  //    예전엔 `let obj = item` 이라 state(=모듈 전역 기본객체)를 그대로 in-place 변형했고,
  //    그 결과 defaultManagerObj.brands 에 이 브랜드 값이 id 까지 남았다.
  const settingBrandObj = (item, brand_data) => {
    let obj = { ...item }
    let brand_data_keys = Object.keys(brand_data ?? {})
    for (var i = 0; i < brand_data_keys.length; i++) {
      if (brand_data[brand_data_keys[i]]) {
        obj[brand_data_keys[i]] = brand_data[brand_data_keys[i]]
      }
    }
    return obj
  }
  // 편집 대상 브랜드 id. 브랜드설정에서 타 가맹점의 '메인페이지 수정'으로 들어오면
  // router.query.type 이 그 가맹점 id 이고, 자기 브랜드를 편집할 땐 없다.
  // 로드와 저장이 반드시 이 하나를 같이 써야 한다(어긋나면 엉뚱한 브랜드가 덮어써진다).
  const getTargetBrandId = () =>
    (!isNaN(parseInt(router.query.type)) ? router.query.type : '') || themeDnsData?.id;

  const settingPage = async () => {
    // [증상] 섹션에 넣을 상품을 고르려는데 후보 목록이 비어 있거나, 이미 홈에 배치한 상품만 나왔다.
    //        섹션을 처음 만드는 가맹점은 후보가 0건이라 아무것도 고를 수 없다.
    // [원인] themeDnsData.products 를 후보로 썼다. 그 배열은 백엔드가 shop_obj/blog_obj 를 훑어
    //        '이미 홈 섹션에 배치된 상품 id' 만 모아 조회한 것이다(shop.controller 의 홈 섹션 쿼리).
    //        디자인관리 › 대표 상품이 늘 비어 있던 것과 같은 원인이다.
    // [수정] 상품 목록 API 로 받아 후보를 채운다. 검색은 onSearchProducts 가 추가로 채운다.
    //
    // ⚠ 기존 값(themeDnsData.products)을 버리면 안 된다. 이 배열은 homeItemsSetting 이
    //   '이미 배치된 상품 id → 표시용 정보'로 되풀 때 쓰는 사전이다(views/section/shop/utils.js).
    //   API 목록에 없는 상품(상품 수가 많아 첫 페이지 밖에 있는 경우)이 배치돼 있으면
    //   _.find 가 undefined 를 돌려줘 그 섹션이 상품 정보를 통째로 잃는다.
    //   그래서 '배치된 것 + 새로 고를 수 있는 것'을 합친다.
    const product_list = await apiManager('products', 'list', {
      page: 1,
      page_size: 100,
      order: 'id',
    })
    const placed = themeDnsData?.products ?? []
    const fetched = product_list?.content ?? []
    const merged = [...placed, ...fetched].reduce((acc, cur) => {
      if (!acc.some((x) => Number(x?.id) === Number(cur?.id))) acc.push(cur)
      return acc
    }, [])
    setProductContent({
      total: Number(product_list?.total) || merged.length,
      content: merged,
    })
    let brand_data = await apiManager('brands', 'get', {
      id: getTargetBrandId()
    })

    brand_data = settingBrandObj(item, brand_data)
    let content_list = brand_data[`${MAIN_OBJ_TYPE}`] ?? []
    setItem(brand_data)
    //console.log(content_list)
    setContentList(content_list)
    setLoading(false)
  }

  const getSettingPropertyList = (themePropertyList = []) => {
    let property_groups = themePropertyList;
    let result = [];
    for (var i = 0; i < property_groups.length; i++) {
      let property_group = property_groups[i];
      for (var j = 0; j < property_group?.product_properties?.length; j++) {
        let property = property_group?.product_properties[j];
        result.push({
          label: `${property_group?.property_group_name} - ${property?.property_name}`,
          type: `items-property-group-${property?.id}`,
          default_value: {
            type: `items-property-group-${property?.id}`,
            list: [],
            style: {},
            title: `${property?.property_name}`,
          },
        },)
      }
    }
    return result;
  }
  const addSection = () => {
    closeTour()
    setContentList([...contentList, (_.find([...mainObjSchemaList, ...getSettingPropertyList(themePropertyList)], { type: sectionType }).default_value ?? {})])
  }
  const deleteSection = idx => {
    let content_list = [...contentList]
    content_list.splice(idx, 1)
    setContentList(content_list)
  }
  const onUpSection = idx => {
    let content_list = [...contentList]
    if (idx == 0) {
      return
    }
    let temp = content_list[idx - 1]
    content_list[idx - 1] = content_list[idx]
    content_list[idx] = temp
    setContentList(content_list)
  }
  const onDownSection = idx => {
    let content_list = [...contentList]
    if (idx == content_list.length - 1) {
      return
    }
    let temp = content_list[idx + 1]
    content_list[idx + 1] = content_list[idx]
    content_list[idx] = temp
    setContentList(content_list)
  }
  const handleDropMultiFile = (acceptedFiles, idx) => {
    let content_list = [...contentList]
    for (var i = 0; i < acceptedFiles.length; i++) {
      content_list[idx]['list'] = content_list[idx]['list'] ?? []
      content_list[idx]['list'].push(
        Object.assign(acceptedFiles[i], {
          preview: URL.createObjectURL(acceptedFiles[i]),
          title: '',
          title_color: '#ffffff',
          sub_title: '',
          sub_title_color: '#ffffff',
          link: ''
        })
      )
    }
    setContentList(content_list)
  }
  const handleRemoveFile = (inputFile, idx, file_index) => {
    let content_list = [...contentList]
    let list = content_list[idx]?.list ?? []
    // 썸네일에서 넘어온 순번이 있으면 그대로 사용 (같은 이미지가 여러개여도 클릭한 배너만 삭제됨)
    let find_index = typeof file_index == 'number' && file_index >= 0 && file_index < list.length ? file_index : -1
    if (find_index < 0) {
      // Upload 에 넘긴 목록(img?.src || img)과 동일한 형태로 비교
      find_index = _.findIndex(list, img => (img?.src || img) === inputFile)
    }
    if (find_index < 0) {
      find_index = _.findIndex(list, {
        path: inputFile?.path,
        preview: inputFile?.preview
      })
    }
    if (find_index < 0) {
      // 못찾았을때 마지막 배너가 지워지는것 방지
      toast.error('삭제할 배너를 찾지 못했습니다. 새로고침 후 다시 시도해 주세요.')
      return
    }
    list.splice(find_index, 1)
    setContentList(content_list)
  }
  const handleRemoveAllFiles = idx => {
    let content_list = [...contentList]
    content_list[idx]['list'] = []
    setContentList(content_list)
  }
  const handleChangeItemMultiSelect = (value, idx) => {
    let content_list = [...contentList]
    let list = [...value]
    content_list[idx]['list'] = list
    setContentList(content_list)
  }
  // 기본 배너(완성 이미지)를 배너슬라이드에 추가. src가 이미 있어 저장 시 업로드 없이 반영됨.
  const addDefaultBanner = (banner, idx) => {
    let content_list = [...contentList]
    content_list[idx]['list'] = content_list[idx]['list'] ?? []
    content_list[idx]['list'].push({
      src: banner.src,
      title: '',
      title_color: '#ffffff',
      sub_title: '',
      sub_title_color: '#ffffff',
      link: ''
    })
    setContentList(content_list)
  }
  const onSave = async () => {
    let content_list = [...contentList]
    let images = []

    let file_index_list = []
    for (var i = 0; i < content_list.length; i++) {
      if (['banner', 'button-banner'].includes(content_list[i]?.type)) {
        for (var j = 0; j < content_list[i]?.list?.length; j++) {
          let list_item = content_list[i].list[j]
          // 새로 올린 파일만 업로드 대상. src 없는 기존 항목은 업로드 불가하므로 그대로 둠
          if (!list_item?.src && (list_item instanceof File || list_item instanceof Blob)) {
            file_index_list.push({
              i: i,
              j: j
            })
            images.push({
              image: list_item
            })
          }
        }
      }
      if (content_list[i]?.type == 'video-slide' || content_list[i]?.type == 'post') {
        if (content_list[i]?.file) {
          file_index_list.push({
            i: i
          })
          images.push({
            image: content_list[i].file
          })
        }
      }
      if (content_list[i]?.type == 'items-ids') {
        if (typeof content_list[i]?.list == 'string') {
          content_list[i].list = content_list[i]?.list?.split(',')
        }
      }
    }
    if (file_index_list.length > 0) {
      let file_result = await uploadFilesByManager({
        images
      })

      if (!Array.isArray(file_result) || !(file_result.length > 0)) {
        toast.error('이미지 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.')
        return
      }
      let fail_index_list = [] //업로드 실패한 배너 위치
      let fail_text_list = [] //업로드 실패 안내 문구
      for (var i = 0; i < file_index_list.length; i++) {
        let upload_url = file_result[i]?.url
        if (file_index_list[i]['i'] >= 0 && file_index_list[i]['j'] >= 0) {
          let prev_item = content_list[file_index_list[i]['i']].list[file_index_list[i]['j']] ?? {}
          if (!upload_url) {
            // 업로드 실패한 배너는 빈 이미지로 저장하지 않고 목록에서 제외
            let section_type = content_list[file_index_list[i]['i']]?.type
            let section_label = section_type == 'button-banner' ? '버튼형 배너슬라이드' : '배너슬라이드'
            fail_index_list.push(file_index_list[i])
            fail_text_list.push(
              `${section_label} ${curTypeNum(content_list, section_type, file_index_list[i]['i'])}의 ${file_index_list[i]['j'] + 1
              }번째 이미지`
            )
            continue
          }
          content_list[file_index_list[i]['i']].list[file_index_list[i]['j']] = {
            title: prev_item?.title ?? '',
            sub_title: prev_item?.sub_title ?? '',
            link: prev_item?.link ?? '',
            title_color: prev_item?.title_color ?? '#ffffff',
            sub_title_color: prev_item?.sub_title_color ?? '#ffffff',
            ...(prev_item?.pc_text_align ? { pc_text_align: prev_item?.pc_text_align } : {}),
            ...(prev_item?.mobile_text_align ? { mobile_text_align: prev_item?.mobile_text_align } : {}),
            src: upload_url
          }
          continue
        }
        if (file_index_list[i]['i'] >= 0) {
          if (!upload_url) {
            // 업로드 실패시 기존에 저장된 src 는 그대로 유지
            delete content_list[file_index_list[i]['i']].file
            fail_text_list.push(`${file_index_list[i]['i'] + 1}번째 섹션의 파일`)
            continue
          }
          content_list[file_index_list[i]['i']].src = upload_url
          delete content_list[file_index_list[i]['i']].file
          continue
        }
      }
      // 뒤에서부터 제거해야 앞쪽 순번이 밀리지 않음
      for (var i = fail_index_list.length - 1; i >= 0; i--) {
        content_list[fail_index_list[i]['i']].list.splice(fail_index_list[i]['j'], 1)
      }
      if (fail_text_list.length > 0) {
        toast.error(`${fail_text_list.join(', ')} 업로드에 실패하여 저장에서 제외되었습니다. 다시 등록해 주세요.`)
      }
    }
    let brand_data = { ...item, [`${MAIN_OBJ_TYPE}`]: content_list }
    // 저장 대상은 반드시 '불러온 대상'과 같아야 한다.
    // 예전엔 로드만 router.query.type(=편집 대상 가맹점)이고 저장은 themeDnsData.id(=현재 접속 브랜드)라,
    // 브랜드설정에서 타 가맹점의 메인페이지를 열어 저장하면 그 가맹점이 아니라
    // '내 브랜드'가 상대 데이터로 통째로 덮어써졌다(dns·상호·프레임번호까지).
    let result = await apiManager('brands', 'update', { ...brand_data, id: getTargetBrandId() })
    if (result) {
      toast.success('성공적으로 저장 되었습니다.')
      window.location.reload()
    }
    else {
      //console.log(result)
    }
  }
  const [tourOpen, setTourOpen] = useState(false)
  const [tourSteps, setTourSteps] = useState([])
  const openTour = (class_name, text) => {
    setTourSteps([
      {
        selector: `.${class_name}`,
        content: text
      }
    ])
    setTourOpen(true)
  }
  const closeTour = () => {
    setTourOpen(false)
    setTourSteps([])
  }

  const conditionOfSection = (type_ = "", item) => {
    let type = getMainObjType(type_);
    return (
      getMainObjType(item.type) == type &&
      (router.query.type == type ||
        router.query.type == 'all' ||
        !router.query.type ||
        !isNaN(parseInt(router.query.type)))
    )
  }

  // SectionProcess 가 클로저 대신 props 로 받는 값들(모듈 스코프로 올린 이유는 정의부 주석 참고).
  const sectionCtl = { contentList, setContentList, onUpSection, onDownSection, deleteSection, userLevel: user?.level };

  const [sliderOpen, setSliderOpen] = useState(true)
  const handleSlider = (e) => {
    setSliderOpen(e.target.checked)
  }


  const [previewSection, setPreviewSection] = useState(undefined)
  const onClickPreview = idx => {
    let column = contentList[idx]
    let type = contentList[idx]?.type
    column.src = column?.file?.preview || column?.src

    const data = {}
    const func = {}
    if (type == 'banner') setPreviewSection(<HomeBanner column={column} data={data} func={func} is_manager={true} />)
    if (type == 'editor') setPreviewSection(<HomeEditor column={column} data={data} func={func} is_manager={true} />)
    if (type == 'item-hero') {
      column = homeItemsSetting(column, productContent?.content ?? [])
      setPreviewSection(<HomeItemHero column={column} data={data} func={func} is_manager={true} />)
    }
    if (type == 'items') {
      column = homeItemsSetting(column, productContent?.content ?? [])
      setPreviewSection(<HomeItems column={column} data={data} func={func} is_manager={true} />)
    }
    if (type == 'button-banner')
      setPreviewSection(<HomeButtonBanner column={column} data={data} func={func} is_manager={true} />)
    if (type == 'items-with-categories') {
      column = homeItemsWithCategoriesSetting(column, productContent?.content ?? [])
      setPreviewSection(<HomeItemsWithCategories column={column} data={data} func={func} is_manager={true} />)
    }
    if (type == 'video-slide')
      setPreviewSection(<HomeVideoSlide column={column} data={data} func={func} is_manager={true} />)
    return
  }
  const onChangeItem = data => {
    let { idx, value, key } = data
    let content_list = [...contentList]
    content_list[idx][key] = value
    setContentList(content_list)
  }
  const onSearchProducts = async e => {
    let value = String(e.target.value ?? '').trim()
    // [증상] 상품 검색이 '정확히 3글자'일 때만 동작했다. 2글자는 물론이고
    //        4글자 이상으로 계속 치면 다시 조회하지 않는다 — 3글자를 지나가는 순간 딱 한 번만 검색된다.
    //        placeholder 는 '3글자 이상'이라고 안내하고 있어 코드와도 어긋났다.
    // [원인] 조건이 `value.length == 3` 이었다.
    // [수정] 2글자 이상이면 계속 조회한다. searchTextList 는 '같은 검색어를 두 번 안 부른다'는
    //        캐시 역할이라 그대로 두되, 배열을 in-place 로 push 하던 것도 새 배열로 바꾼다
    //        (같은 참조라 setState 가 리렌더를 못 알아채는 자리였다).
    if (value.length >= 2 && !searchTextList.includes(value)) {
      setSearchTextList([...searchTextList, value])
      let product_content = await apiManager('products', 'list', {
        page: 1,
        page_size: 1000,
        search: value
      })
      let product_content_list = [...productContent?.content, ...product_content?.content]
      product_content_list = product_content_list.reduce((acc, curr) => {
        const idx = acc.findIndex(obj => obj['id'] === curr['id'])
        if (idx === -1) acc.push(curr)
        return acc
      }, [])
      setProductContent({
        ...product_content,
        content: product_content_list
      })
    }
  }
  return (
    <>
      <Dialog
        open={previewSection}
        onClose={() => {
          setPreviewSection(undefined)
        }}
        fullScreen
      >
        <Row>
          <IconButton
            sx={{ marginLeft: 'auto' }}
            onClick={() => {
              setPreviewSection(undefined)
            }}
          >
            <Icon icon={'ph:x-bold'} />
          </IconButton>
        </Row>
        <DialogContent>{previewSection}</DialogContent>
      </Dialog>
      {!loading && (
        <>
          <Grid container spacing={3}>
            <Grid
              item
              xs={12}
              md={window.location.host.split(':')[0] == process.env.MAIN_FRONT_URL || user?.level >= 40 ? 8 : 12}
            >
              <Card sx={{ p: 3, minHeight: '100%' }}>
                <Stack spacing={1}>
                  {contentList.length == 0 && (
                    <>
                      <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>
                        콘텐츠가 없습니다.
                      </Typography>
                      {/* 섹션이 0개면 쇼핑몰 홈에 기본 배너가 임시로 표시된다(저장된 값 아님).
                          편집기는 비어 있는데 몰에는 배너가 보이는 상황을 오해하지 않도록 안내. */}
                      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                        섹션이 없는 동안에는 쇼핑몰 홈에 기본 배너가 임시로 표시됩니다. 아래 &lsquo;섹션 추가&rsquo;로 하나라도 만들면 그 구성으로 바뀝니다.
                      </Typography>
                    </>
                  )}
                  {contentList &&
                    contentList.map((item, idx) => (
                      <>
                        {conditionOfSection('banner', item) && (
                          <>
                            <Row style={{ alignItems: 'end' }}>
                              <CardHeader
                                title={`배너슬라이드 ${curTypeNum(contentList, 'banner', idx)}`}
                                sx={{ paddingLeft: '0' }}
                              />
                              <SectionProcess {...sectionCtl} idx={idx} item={item} />
                            </Row>
                            {/* '이미지 최소높이 / 최대높이' 입력칸을 없앴다.
                                높이를 강제하면 컨테이너 비율이 이미지와 달라지고, 배너는 cover 라
                                그 차이만큼 좌우가 잘린다. 기본값 200px 은 폰에서 늘 걸려서
                                (390px 폭의 자연 높이는 166px 다) 규격을 지켜 올려도 잘렸다.
                                이제 배너는 비율로만 그린다 — 조절할 것이 없다. */}
                            <Upload
                              multiple
                              thumbnail={true}
                              files={
                                item?.list &&
                                item?.list.map(img => {
                                  return img?.src || img
                                })
                              }
                              onDrop={acceptedFiles => {
                                handleDropMultiFile(acceptedFiles, idx)
                              }}
                              onRemove={(inputFile, file_index) => {
                                handleRemoveFile(inputFile, idx, file_index)
                              }}
                              onRemoveAll={() => {
                                handleRemoveAllFiles(idx)
                              }}
                              fileExplain={{
                                width: `(${bannerRatio.label} 추천)` //파일 사이즈 설명 (데모 비율에 맞춰 표기)
                              }}
                              imageSize={{
                                //썸네일 사이즈 (데모 비율에 맞춤)
                                width: 200,
                                height: Math.round(200 / bannerRatio.aspect)
                              }}
                            />
                            {/* 올린 배너가 화면에서 어떻게 보일지 그 자리에서 알려준다.
                                배너는 자르지 않으므로 비율이 다르면 여백이 생기는데,
                                예전엔 저장하고 고객 화면을 열어 봐야 그걸 알 수 있었다. */}
                            <BannerFitNotice
                              ratio={bannerRatio}
                              srcList={(item?.list ?? []).map((img) => img?.file?.preview || img?.src || img).filter((v) => typeof v === 'string')}
                            />

                            <Box sx={{ mt: 0.5 }}>
                              <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 0.75 }}>
                                기본 배너 — 클릭하면 위 슬라이드에 추가됩니다. (추가 후 원하는 이미지로 교체하거나 제목·링크를 넣을 수 있어요)
                              </Typography>
                              {/* 사진이 6장일 땐 가로 스크롤로 충분했는데 업종별 사진이 늘어 20장이 넘는다.
                                  한 줄로 두면 3천 픽셀을 옆으로 밀어야 해서, 줄바꿈 + 세로 스크롤로 바꾼다.
                                  썸네일만으로는 '잡화/의류잡화/건어물'을 구분하기 어려워 이름도 함께 보여준다. */}
                              <Box
                                sx={{
                                  display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
                                  maxHeight: 340, overflowY: 'auto',
                                  p: 0.5, border: '1px solid #eee', borderRadius: 1,
                                }}
                              >
                                {defaultBanners.map(b => (
                                  <Tooltip title={`'${b.label}' 배너 추가`} key={b.id}>
                                    <Box
                                      onClick={() => addDefaultBanner(b, idx)}
                                      sx={{
                                        width: 160, flexShrink: 0, cursor: 'pointer',
                                        '&:hover img': { borderColor: 'primary.main' },
                                      }}
                                    >
                                      <Box
                                        component='img'
                                        src={b.src}
                                        alt={b.label}
                                        loading='lazy'
                                        sx={{
                                          width: 160,
                                          height: Math.round(160 / bannerRatio.aspect),
                                          objectFit: 'cover',
                                          borderRadius: 1,
                                          border: '1px solid #e0e0e0',
                                          display: 'block',
                                          transition: 'border-color .15s',
                                        }}
                                      />
                                      <Typography
                                        sx={{ fontSize: 11, color: 'text.secondary', textAlign: 'center', mt: 0.25 }}
                                      >
                                        {b.label}
                                      </Typography>
                                    </Box>
                                  </Tooltip>
                                ))}
                              </Box>
                            </Box>

                            {/* 배너 슬라이드별 부가 입력(제목·부제목·색상·글자배치·링크).
                                SHOPGO 가맹점은 '이미지만' 쓰도록 숨긴다 — 사장님들이 채우지 않는데
                                입력칸만 잔뜩 보여 혼란스럽다는 피드백. 저장된 값은 그대로 유지되고,
                                다른 클라이언트 브랜드는 현행대로 전부 노출된다. */}
                            {!isShopgoMerchant(themeDnsData) && item?.list &&
                              item.list.map((itm, index) => (
                                <>
                                  <Row style={{ width: '100%', columnGap: '1rem' }}>
                                    <TextField
                                      size='small'
                                      sx={{ width: '50%' }}
                                      label={`${index + 1}번째 제목 (제목 없을 시 빈칸)`}
                                      value={itm?.title ?? ''}
                                      onChange={e => {
                                        let content_list = [...contentList]
                                        content_list[idx].list[index].title = e.target.value
                                        setContentList(content_list)
                                      }}
                                    />
                                    <TextField
                                      size='small'
                                      sx={{ width: '30%' }}
                                      label={`${index + 1}번째 제목 색상`}
                                      value={itm?.title_color ?? '#ffffff'}
                                      inputProps={{ style: { borderColor: 'transparent' } }}
                                      type='color'
                                      onChange={e => {
                                        let content_list = [...contentList]
                                        content_list[idx].list[index].title_color = e.target.value
                                        setContentList(content_list)
                                      }}
                                    />
                                    <TextField
                                      size='small'
                                      sx={{ width: '50%' }}
                                      label={`${index + 1}번째 부제목 (부제목 없을 시 빈칸)`}
                                      value={itm?.sub_title ?? ''}
                                      onChange={e => {
                                        let content_list = [...contentList]
                                        content_list[idx].list[index].sub_title = e.target.value
                                        setContentList(content_list)
                                      }}
                                    />
                                    <TextField
                                      size='small'
                                      sx={{ width: '30%' }}
                                      label={`${index + 1}번째 부제목 색상`}
                                      value={itm?.sub_title_color ?? '#ffffff'}
                                      inputProps={{ style: { borderColor: 'transparent' } }}
                                      type='color'
                                      onChange={e => {
                                        let content_list = [...contentList]
                                        content_list[idx].list[index].sub_title_color = e.target.value
                                        setContentList(content_list)
                                      }}
                                    />
                                    <FormControl variant='outlined' sx={{ width: '30%' }} size='small'>
                                      <InputLabel>{`${index + 1}번째 pc글자배치`}</InputLabel>
                                      <Select
                                        size='small'
                                        label={`${index + 1}번째 글자배치`}
                                        value={itm?.pc_text_align ?? 'left'}
                                        onChange={(e) => {
                                          let content_list = [...contentList]
                                          content_list[idx].list[index].pc_text_align = e.target.value
                                          setContentList(content_list)
                                        }}
                                      >
                                        <MenuItem value={'left'}>왼쪽</MenuItem>
                                        <MenuItem value={'right'}>오른쪽</MenuItem>
                                        <MenuItem value={'center'}>가운데</MenuItem>
                                      </Select>
                                    </FormControl>
                                    <FormControl variant='outlined' sx={{ width: '30%' }} size='small'>
                                      <InputLabel>{`${index + 1}번째 모바일글자배치`}</InputLabel>
                                      <Select
                                        size='small'
                                        label={`${index + 1}번째 글자배치`}
                                        value={itm?.mobile_text_align ?? 'left'}
                                        onChange={(e) => {
                                          let content_list = [...contentList]
                                          content_list[idx].list[index].mobile_text_align = e.target.value
                                          setContentList(content_list)
                                        }}
                                      >
                                        <MenuItem value={'left'}>왼쪽</MenuItem>
                                        <MenuItem value={'right'}>오른쪽</MenuItem>
                                        <MenuItem value={'center'}>가운데</MenuItem>
                                      </Select>
                                    </FormControl>
                                    <TextField
                                      size='small'
                                      sx={{ width: '50%' }}
                                      label={`${index + 1}번째 이미지 링크 (링크 없을 시 빈칸)`}
                                      value={itm?.link ?? ''}
                                      onChange={e => {
                                        let content_list = [...contentList]
                                        content_list[idx].list[index].link = e.target.value
                                        setContentList(content_list)
                                      }}
                                    />
                                  </Row>
                                </>
                              ))}
                          </>
                        )}
                        {conditionOfSection('button-banner', item) && (
                          <>
                            <Row style={{ alignItems: 'end' }}>
                              <CardHeader
                                title={`버튼형 배너슬라이드 ${curTypeNum(contentList, 'button-banner', idx)}`}
                                sx={{ paddingLeft: '0' }}
                              />
                              <SectionProcess {...sectionCtl} idx={idx} item={item} />
                            </Row>
                            <Upload
                              multiple
                              thumbnail={true}
                              files={
                                item?.list &&
                                item?.list.map(img => {
                                  return img?.src || img
                                })
                              }
                              onDrop={acceptedFiles => {
                                handleDropMultiFile(acceptedFiles, idx)
                              }}
                              onRemove={(inputFile, file_index) => {
                                handleRemoveFile(inputFile, idx, file_index)
                              }}
                              onRemoveAll={() => {
                                handleRemoveAllFiles(idx)
                              }}
                              fileExplain={{
                                width: '(850x850 추천)' //파일 사이즈 설명
                              }}
                              imageSize={{
                                //썸네일 사이즈
                                width: 85,
                                height: 85
                              }}
                            />
                            {item?.list &&
                              item.list.map((itm, index) => (
                                <>
                                  <Row style={{ width: '100%', columnGap: '1rem' }}>
                                    <TextField
                                      sx={{ width: '50%' }}
                                      size='small'
                                      label={`${index + 1}번째 이미지 제목 (제목 없을 시 빈칸)`}
                                      value={itm.title ?? ''}
                                      onChange={e => {
                                        let content_list = [...contentList]
                                        content_list[idx].list[index].title = e.target.value
                                        setContentList(content_list)
                                      }}
                                    />
                                    <TextField
                                      sx={{ width: '50%' }}
                                      size='small'
                                      label={`${index + 1}번째 이미지 링크 (링크 없을 시 빈칸)`}
                                      value={itm.link ?? ''}
                                      onChange={e => {
                                        let content_list = [...contentList]
                                        content_list[idx].list[index].link = e.target.value
                                        setContentList(content_list)
                                      }}
                                    />
                                  </Row>
                                </>
                              ))}
                          </>
                        )}
                        {conditionOfSection('text-banner', item) && (
                          <>
                            <Row style={{ alignItems: 'end' }}>
                              <CardHeader
                                title={`텍스트형 배너슬라이드 ${curTypeNum(contentList, 'text-banner', idx)}`}
                                sx={{ paddingLeft: '0' }}
                              />
                              <Tooltip title='새로운 텍스트를 추가 하시려면 클릭해 주세요.'>
                                <Button
                                  variant='outlined'
                                  sx={{ height: '28px' }}
                                  onClick={() => {
                                    let content_list = [...contentList]
                                    content_list[idx].list.push({
                                      title: '',
                                      link: ''
                                    })
                                    setContentList(content_list)
                                  }}
                                >
                                  + 텍스트 추가
                                </Button>
                              </Tooltip>
                              <SectionProcess {...sectionCtl} idx={idx} item={item} />
                            </Row>
                            {item?.list &&
                              item.list.map((itm, index) => (
                                <>
                                  <Row style={{ width: '100%', columnGap: '1rem' }}>
                                    <TextField
                                      sx={{ width: '50%' }}
                                      size='small'
                                      label={`텍스트`}
                                      value={itm.title ?? ''}
                                      onChange={e => {
                                        let content_list = [...contentList]
                                        content_list[idx].list[index].title = e.target.value
                                        setContentList(content_list)
                                      }}
                                    />
                                    <TextField
                                      sx={{ width: '50%' }}
                                      size='small'
                                      label={`링크`}
                                      value={itm.link ?? ''}
                                      onChange={e => {
                                        let content_list = [...contentList]
                                        content_list[idx].list[index].link = e.target.value
                                        setContentList(content_list)
                                      }}
                                    />
                                    <Tooltip title='해당 텍스트를 삭제하시려면 클릭해 주세요.'>
                                      <IconButton
                                        onClick={() => {
                                          let content_list = [...contentList]
                                          content_list[idx].list.splice(index, 1)
                                          setContentList(content_list)
                                        }}
                                      >
                                        <Icon icon='material-symbols:delete-outline' />
                                      </IconButton>
                                    </Tooltip>
                                  </Row>
                                </>
                              ))}
                          </>
                        )}
                        {conditionOfSection('item-hero', item) && (
                          <>
                            <Row style={{ alignItems: 'end' }}>
                              <CardHeader
                                title={`단일 상품 강조 ${curTypeNum(contentList, 'item-hero', idx)}`}
                                sx={{ paddingLeft: '0' }}
                              />
                              {/* isProductList 를 안 넘긴다 — 그 묶음(상품 설명 배치·배경색상·
                                  슬라이더 속도·컨텐츠 개수)은 이 섹션에서 하나도 안 쓰인다.
                                  HomeItemHero 가 읽는 값은 hero_type(디자인 타입)과 margin_top(윗마진)
                                  둘뿐이다. 넷은 상품슬라이드에서 복사돼 따라온 칸이었고, 고쳐도
                                  화면이 안 바뀌니 가맹점은 자기가 잘못한 줄 안다.
                                  윗마진은 이 묶음 밖이라 그대로 남는다. */}
                              <SectionProcess {...sectionCtl} idx={idx} item={item} />
                            </Row>
                            {/* 디자인 타입 — 이름만으로는 어떤 모양인지 알 수 없다.
                                가맹점 요청(2026-08-24): "타입만 가지고 정확한 이미지를 알기 어렵습니다.
                                각 타입별로 이미지화 해서 보여줄 수 있게 요청 드립니다."
                                목록은 src/data/section-preview.js 한 곳에 둔다(캡처 화면·스크립트와 공유).
                                이미지는 node scripts/section-preview/capture.cjs 로 다시 만든다. */}
                            <TextField
                              select
                              label='디자인 타입'
                              value={item?.style?.hero_type || '1'}
                              onChange={e => {
                                let content_list = [...contentList]
                                content_list[idx]['style'] = { ...content_list[idx]['style'], hero_type: e.target.value }
                                setContentList(content_list)
                              }}
                              SelectProps={{ native: true }}
                            >
                              {HERO_TYPES.map(t => (
                                <option key={t.value} value={String(t.value)}>{`타입${t.value}: ${t.label}`}</option>
                              ))}
                            </TextField>
                            {/* 고른 타입이 어떤 모양인지 바로 보여준다.
                                이미지가 아직 안 만들어졌으면 아무것도 그리지 않는다(onError) —
                                깨진 이미지 아이콘이 뜨면 가맹점은 자기가 잘못한 줄 안다. */}
                            <HeroTypePreview value={item?.style?.hero_type || '1'} />
                            <TextField
                              label='제목'
                              value={item.title}
                              onChange={e => {
                                let content_list = [...contentList]
                                content_list[idx]['title'] = e.target.value
                                setContentList(content_list)
                              }}
                            />
                            <Autocomplete
                              multiple
                              fullWidth
                              options={
                                productContent?.content &&
                                (productContent?.content ?? []).map(item => {
                                  return item?.id
                                })
                              }
                              getOptionLabel={item_id =>
                                _.find(productContent?.content ?? [], { id: parseInt(item_id) })?.product_name
                              }
                              defaultValue={item.list}
                              value={item.list}
                              onChange={(e, value) => {
                                // 히어로는 상품 1개 전용이다.
                                //
                                // 위에서 고른 '디자인 타입'(1~8)은 **상품이 1개일 때만** 적용된다
                                // (views/section/shop/HomeItemHero.js). 2개 이상이면 순위·폴라로이드 같은
                                // 복수 디자인으로 조용히 넘어가서, 가맹점은 타입을 아무리 바꿔도
                                // 화면이 안 변하는 것처럼 보였다. 마지막에 고른 하나만 남긴다.
                                handleChangeItemMultiSelect(value.slice(-1), idx)
                              }}
                              renderInput={params => (
                                <TextField
                                  {...params}
                                  label='강조할 상품 (1개)'
                                  helperText='히어로는 상품 1개만 담을 수 있습니다. 새로 고르면 이전 상품이 바뀝니다.'
                                  placeholder='2글자 이상 입력해 주세요.'
                                  onChange={e => {
                                    onSearchProducts(e)
                                  }}
                                />
                              )}
                            />
                          </>
                        )}
                        {conditionOfSection('items', item) && (
                          <>
                            <Row style={{ alignItems: 'end' }}>
                              <CardHeader
                                title={`상품슬라이드 ${curTypeNum(contentList, 'items', idx)}`}
                                sx={{ paddingLeft: '0' }}
                              />
                              <SectionProcess {...sectionCtl} idx={idx} item={item} isProductList={1} />
                            </Row>
                            <TextField
                              label='제목'
                              value={item.title}
                              onChange={e => {
                                let content_list = [...contentList]
                                content_list[idx]['title'] = e.target.value
                                setContentList(content_list)
                              }}
                            />
                            <TextField
                              label='부제목'
                              value={item.sub_title}
                              onChange={e => {
                                let content_list = [...contentList]
                                content_list[idx]['sub_title'] = e.target.value
                                setContentList(content_list)
                              }}
                            />
                            <Autocomplete
                              multiple
                              fullWidth
                              options={
                                productContent?.content &&
                                (productContent?.content ?? []).map(item => {
                                  return item?.id
                                })
                              }
                              getOptionLabel={item_id =>
                                _.find(productContent?.content ?? [], { id: parseInt(item_id) })?.product_name
                              }
                              defaultValue={item.list}
                              value={item.list}
                              onChange={(e, value) => {
                                handleChangeItemMultiSelect(value, idx)
                              }}
                              renderInput={params => (
                                <TextField
                                  {...params}
                                  label='선택할 상품'
                                  placeholder='2글자 이상 입력해 주세요.'
                                  onChange={e => {
                                    onSearchProducts(e)
                                  }}
                                />
                              )}
                            />
                          </>
                        )}
                        {conditionOfSection('items-ids', item) && (
                          <>
                            <Row style={{ alignItems: 'end' }}>
                              <CardHeader
                                title={`ID 선택형 상품슬라이드 ${curTypeNum(contentList, 'items-ids', idx)}`}
                                sx={{ paddingLeft: '0' }}
                              />
                              <SectionProcess {...sectionCtl} idx={idx} item={item} isProductList={1} />
                            </Row>
                            <TextField
                              label='제목'
                              value={item.title}
                              onChange={e => {
                                let content_list = [...contentList]
                                content_list[idx]['title'] = e.target.value
                                setContentList(content_list)
                              }}
                            />
                            <TextField
                              label='부제목'
                              value={item.sub_title}
                              onChange={e => {
                                let content_list = [...contentList]
                                content_list[idx]['sub_title'] = e.target.value
                                setContentList(content_list)
                              }}
                            />
                            <TextField
                              label='상품 id 모음'
                              placeholder=', 를 기준으로 id를 입력해주세요.'
                              value={item?.list}
                              onChange={e => {
                                let content_list = [...contentList]
                                content_list[idx]['list'] = e.target.value
                                setContentList(content_list)
                              }}
                            />
                          </>
                        )}
                        {conditionOfSection('items-with-categories', item) && (
                          <>
                            <Row style={{ alignItems: 'end', alignContent: 'center' }}>
                              <CardHeader
                                title={`카테고리탭별 상품리스트 ${curTypeNum(
                                  contentList,
                                  'items-with-categories',
                                  idx
                                )}`}
                                sx={{ paddingLeft: '0' }}
                              />
                              <Tooltip title='새로운 카테고리 탭을 추가 하시려면 클릭해 주세요.'>
                                <Button
                                  variant='outlined'
                                  sx={{ height: '28px' }}
                                  onClick={() => {
                                    let content_list = [...contentList]
                                    content_list[idx].list.push({
                                      category_name: '',
                                      list: []
                                    })
                                    setContentList(content_list)
                                  }}
                                >
                                  + 카테고리 추가
                                </Button>
                              </Tooltip>
                              <SectionProcess {...sectionCtl} idx={idx} item={item} />
                            </Row>
                            <TextField
                              label='제목'
                              value={item.title}
                              onChange={e => {
                                let content_list = [...contentList]
                                content_list[idx]['title'] = e.target.value
                                setContentList(content_list)
                              }}
                            />
                            <TextField
                              label='부제목'
                              value={item.sub_title}
                              onChange={e => {
                                let content_list = [...contentList]
                                content_list[idx]['sub_title'] = e.target.value
                                setContentList(content_list)
                              }}
                            />
                            <Select
                              value={item.is_vertical ?? 0}
                              onChange={e => {
                                let content_list = [...contentList]
                                content_list[idx]['is_vertical'] = e.target.value
                                setContentList(content_list)
                              }}
                            >
                              <MenuItem value={0}>수평형 (horizontality)</MenuItem>
                              <MenuItem value={1}>수직형 (verticality)</MenuItem>
                            </Select>
                            {item?.list &&
                              item?.list.map((itm, index) => (
                                <>
                                  <Row style={{ columnGap: '0.5rem', width: '100%' }}>
                                    <TextField
                                      label='카테고리명'
                                      value={itm?.category_name}
                                      style={{ width: '100%' }}
                                      onChange={e => {
                                        let content_list = [...contentList]
                                        content_list[idx].list[index]['category_name'] = e.target.value
                                        setContentList(content_list)
                                      }}
                                    />
                                    <Tooltip title='해당 카테고리를 삭제하시려면 클릭해 주세요.'>
                                      <IconButton
                                        onClick={() => {
                                          let content_list = [...contentList]
                                          content_list[idx].list.splice(index, 1)
                                          setContentList(content_list)
                                        }}
                                      >
                                        <Icon icon='material-symbols:delete-outline' />
                                      </IconButton>
                                    </Tooltip>
                                  </Row>
                                  <Autocomplete
                                    multiple
                                    fullWidth
                                    options={
                                      productContent?.content &&
                                      (productContent?.content ?? []).map(itm => {
                                        return itm?.id
                                      })
                                    }
                                    getOptionLabel={item_id =>
                                      _.find(productContent?.content ?? [], { id: parseInt(item_id) })?.product_name
                                    }
                                    defaultValue={itm.list}
                                    value={itm.list}
                                    onChange={(e, value) => {
                                      let content_list = [...contentList]
                                      let list = [...value]
                                      content_list[idx].list[index]['list'] = list
                                      setContentList(content_list)
                                    }}
                                    renderInput={params => (
                                      <TextField
                                        {...params}
                                        label='선택할 상품'
                                        placeholder='2글자 이상 입력해 주세요.'
                                        onChange={e => {
                                          onSearchProducts(e)
                                        }}
                                      />
                                    )}
                                  />
                                </>
                              ))}
                          </>
                        )}
                        {conditionOfSection('editor', item) && (
                          <>
                            <Row style={{ alignItems: 'end' }}>
                              <CardHeader
                                title={`에디터 ${curTypeNum(contentList, 'editor', idx)}`}
                                sx={{ paddingLeft: '0' }}
                              />
                              <SectionProcess {...sectionCtl} idx={idx} item={item} />
                            </Row>
                            <ReactQuillComponent
                              value={item.content}
                              setValue={value => {
                                let content_list = [...contentList]
                                content_list[idx]['content'] = value
                                setContentList(content_list)
                              }}
                            />
                          </>
                        )}
                        {conditionOfSection('video-slide', item) && (
                          <>
                            <Row style={{ alignItems: 'end', alignContent: 'center' }}>
                              <CardHeader
                                title={`동영상 슬라이드 ${curTypeNum(contentList, 'video-slide', idx)}`}
                                sx={{ paddingLeft: '0' }}
                              />
                              <Button
                                variant='outlined'
                                sx={{ height: '28px' }}
                                onClick={() => {
                                  let content_list = [...contentList]
                                  content_list[idx].list = content_list[idx]?.list ?? []
                                  content_list[idx].list.push({
                                    link: ''
                                  })
                                  setContentList(content_list)
                                }}
                              >
                                + 동영상 링크 추가
                              </Button>
                              <SectionProcess {...sectionCtl} idx={idx} item={item} />
                            </Row>
                            <Upload
                              file={item.file || item.src}
                              title='배경에 사용될 이미지를 업로드 해주세요.'
                              onDrop={acceptedFiles => {
                                const newFile = acceptedFiles[0]
                                if (newFile) {
                                  let content_list = [...contentList]
                                  content_list[idx]['file'] = Object.assign(newFile, {
                                    preview: URL.createObjectURL(newFile)
                                  })
                                  setContentList(content_list)
                                }
                              }}
                              onDelete={() => {
                                let content_list = [...contentList]
                                content_list[idx]['file'] = undefined
                                content_list[idx]['src'] = ''
                                setContentList(content_list)
                              }}
                              fileExplain={{
                                width: '(512x512 추천)' //파일 사이즈 설명
                              }}
                            />
                            <TextField
                              label='제목'
                              value={item.title}
                              onChange={e => {
                                let content_list = [...contentList]
                                content_list[idx]['title'] = e.target.value
                                setContentList(content_list)
                              }}
                            />
                            <TextField
                              label='부제목'
                              value={item.sub_title}
                              onChange={e => {
                                let content_list = [...contentList]
                                content_list[idx]['sub_title'] = e.target.value
                                setContentList(content_list)
                              }}
                            />
                            {item?.list &&
                              item?.list.map((itm, index) => (
                                <>
                                  <Row style={{ columnGap: '0.5rem', width: '100%' }}>
                                    <TextField
                                      label='링크주소'
                                      value={itm?.link}
                                      style={{ width: '100%' }}
                                      onChange={e => {
                                        let content_list = [...contentList]
                                        content_list[idx].list[index]['link'] = e.target.value
                                        setContentList(content_list)
                                      }}
                                    />
                                    <IconButton
                                      onClick={() => {
                                        let content_list = [...contentList]
                                        content_list[idx].list.splice(index, 1)
                                        setContentList(content_list)
                                      }}
                                    >
                                      <Icon icon='material-symbols:delete-outline' />
                                    </IconButton>
                                  </Row>
                                </>
                              ))}
                          </>
                        )}
                        {conditionOfSection('post', item) && (
                          <>
                            <Row style={{ alignItems: 'end' }}>
                              <CardHeader
                                title={`게시판 ${curTypeNum(contentList, 'post', idx)}`}
                                sx={{ paddingLeft: '0' }}
                              />
                              <SectionProcess {...sectionCtl} idx={idx} item={item} />
                            </Row>
                            <Upload
                              file={item.file || item.src}
                              title='배경에 사용될 이미지를 업로드 해주세요.'
                              onDrop={acceptedFiles => {
                                const newFile = acceptedFiles[0]
                                if (newFile) {
                                  let content_list = [...contentList]
                                  content_list[idx]['file'] = Object.assign(newFile, {
                                    preview: URL.createObjectURL(newFile)
                                  })
                                  setContentList(content_list)
                                }
                              }}
                              onDelete={() => {
                                let content_list = [...contentList]
                                content_list[idx]['file'] = undefined
                                content_list[idx]['src'] = ''
                                setContentList(content_list)
                              }}
                              fileExplain={{
                                width: '' //파일 사이즈 설명
                              }}
                            />
                            <Row>
                              {themePostCategoryList.map((post_category, idx_) => (
                                <>
                                  <Row>
                                    <FormControlLabel
                                      label={
                                        <Typography style={{ fontSize: themeObj.font_size.size6 }}>
                                          {post_category?.post_category_title}
                                        </Typography>
                                      }
                                      control={
                                        <Checkbox
                                          checked={(contentList[idx]?.list ?? [])
                                            .map(id => {
                                              return parseInt(id)
                                            })
                                            .includes(post_category?.id)}
                                          onChange={e => {
                                            let content_list = [...contentList]
                                            let post_category_list = content_list[idx]?.list ?? []
                                            if (e.target.checked) {
                                              post_category_list.push(post_category?.id)
                                              post_category_list = post_category_list.map(id => {
                                                return _.find(themePostCategoryList, { id: parseInt(id) })
                                              })
                                              post_category_list = post_category_list.sort((a, b) => {
                                                if (a.sort_idx < b.sort_idx) return 1
                                                if (a.sort_idx > b.sort_idx) return -1
                                                return 0
                                              })
                                              post_category_list = post_category_list.map(item => {
                                                return item?.id
                                              })
                                            } else {
                                              let find_index = post_category_list.indexOf(post_category?.id)
                                              post_category_list.splice(find_index, 1)
                                            }
                                            content_list[idx].list = post_category_list
                                            setContentList(content_list)
                                          }}
                                        />
                                      }
                                    />
                                  </Row>
                                </>
                              ))}
                            </Row>
                          </>
                        )}
                        {conditionOfSection('sellers', item) && (
                          <>
                            <Row style={{ alignItems: 'end' }}>
                              <CardHeader
                                title={`셀러섹션 ${curTypeNum(contentList, 'sellers', idx)}`}
                                sx={{ paddingLeft: '0' }}
                              />
                              <SectionProcess {...sectionCtl} idx={idx} item={item} />
                            </Row>
                            <TextField
                              label='제목'
                              value={item.title}
                              onChange={e => {
                                let content_list = [...contentList]
                                content_list[idx]['title'] = e.target.value
                                setContentList(content_list)
                              }}
                            />
                            <TextField
                              label='부제목'
                              value={item.sub_title}
                              onChange={e => {
                                let content_list = [...contentList]
                                content_list[idx]['sub_title'] = e.target.value
                                setContentList(content_list)
                              }}
                            />
                          </>
                        )}
                        {conditionOfSection('items-property-group-:num', item) && (
                          <>
                            <Row style={{ alignItems: 'end' }}>
                              <CardHeader
                                title={`${_.find(getSettingPropertyList(themePropertyList), { type: item?.type })?.label.split(' - ')[1]} ${curTypeNum(contentList, item?.type, idx)}`}
                                sx={{ paddingLeft: '0' }}
                              />
                              <SectionProcess {...sectionCtl} idx={idx} item={item} isProductList={1} />
                            </Row>
                            <TextField
                              label='제목'
                              value={item.title}
                              onChange={e => {
                                let content_list = [...contentList]
                                content_list[idx]['title'] = e.target.value
                                setContentList(content_list)
                              }}
                            />
                            <TextField
                              label='부제목'
                              value={item.sub_title}
                              onChange={e => {
                                let content_list = [...contentList]
                                content_list[idx]['sub_title'] = e.target.value
                                setContentList(content_list)
                              }}
                            />
                          </>
                        )}
                        {conditionOfSection('item-reviews', item) && (
                          <>
                            <Row style={{ alignItems: 'end' }}>
                              <CardHeader
                                title={`상품후기 ${curTypeNum(contentList, 'item-reviews', idx)}`}
                                sx={{ paddingLeft: '0' }}
                              />
                              <SectionProcess {...sectionCtl} idx={idx} item={item} />
                            </Row>
                            <TextField
                              label='제목'
                              value={item.title}
                              onChange={e => {
                                let content_list = [...contentList]
                                content_list[idx]['title'] = e.target.value
                                setContentList(content_list)
                              }}
                            />
                            <TextField
                              label='부제목'
                              value={item.sub_title}
                              onChange={e => {
                                let content_list = [...contentList]
                                content_list[idx]['sub_title'] = e.target.value
                                setContentList(content_list)
                              }}
                            />
                          </>
                        )}
                        {conditionOfSection('item-reviews-select', item) && (
                          <>
                            <Row style={{ alignItems: 'end' }}>
                              <CardHeader
                                title={`선택형 상품후기 ${curTypeNum(contentList, 'item-reviews-select', idx)}`}
                                sx={{ paddingLeft: '0' }}
                              />
                              <SectionProcess {...sectionCtl} idx={idx} item={item} />
                            </Row>
                            <TextField
                              label='제목'
                              value={item.title}
                              onChange={e => {
                                let content_list = [...contentList]
                                content_list[idx]['title'] = e.target.value
                                setContentList(content_list)
                              }}
                            />
                            <TextField
                              label='부제목'
                              value={item.sub_title}
                              onChange={e => {
                                let content_list = [...contentList]
                                content_list[idx]['sub_title'] = e.target.value
                                setContentList(content_list)
                              }}
                            />
                            <Autocomplete
                              multiple
                              fullWidth
                              options={
                                productReviewContent?.content &&
                                (productReviewContent?.content ?? []).map(item => {
                                  return item?.id
                                })
                              }
                              getOptionLabel={item_id => {
                                let review = _.find(productReviewContent?.content ?? [], { id: parseInt(item_id) })
                                return `${review?.product_name} (${review?.nickname}) : ${review?.content} `
                              }}
                              defaultValue={item.list}
                              value={item.list}
                              onChange={(e, value) => {
                                handleChangeItemMultiSelect(value, idx)
                              }}
                              renderInput={params => (
                                <TextField {...params} label='선택할 리뷰' placeholder='2글자 이상 입력해 주세요.' />
                              )}
                            />
                          </>
                        )}
                      </>
                    ))}
                </Stack>
              </Card>
            </Grid>
            {(window.location.host.split(':')[0] == process.env.MAIN_FRONT_URL || user?.level >= 40) && (
              <>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 3 }}>
                    <Stack spacing={1}>
                      <div>1. 아래 추가할 섹션을 선택합니다.</div>
                      <div>2. 아래 '추가' 버튼을 클릭하여 섹션을 추가합니다.</div>
                      <div>3. 왼쪽의 섹션을 이용하여 메인페이지를 꾸밉니다.</div>
                      <div>4. 맨 아래 '저장' 버튼을 클릭하여 저장합니다.</div>
                      <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>
                        추가할 섹션
                      </Typography>
                      <Select
                        sx={{ width: '100%' }}
                        value={sectionType}
                        onChange={e => {
                          setSectionType(e.target.value)
                        }}
                      >
                        {/* ShopGo 산하는 셀러 시스템과 상품후기를 쓰지 않는다.
                            고객화면에서 해당 섹션을 렌더하지 않도록 막았으므로, 추가하는 입구도 같이 막는다.
                            (안 그러면 섹션을 추가해두고 "몰에 안 나온다"는 문의가 생긴다)
                            여기는 '신규 추가' 목록 필터일 뿐이라 이미 저장된 섹션 데이터에는 영향이 없다.
                            type 값은 위 mainObjSchemaList 정의(sellers / item-reviews / item-reviews-select) 그대로다. */}
                        {(() => {
                          const 전체 = [...mainObjSchemaList, ...getSettingPropertyList(themePropertyList)]
                            .filter(itm => !(isShopgoBrand(themeDnsData) && ['sellers', 'item-reviews', 'item-reviews-select'].includes(itm.type)))
                            // 특성으로 만들어지는 섹션('원산지 - 국산' 같은 것)도 같이 감춘다.
                            // '특성 그룹 관리' 는 가맹점에게 이미 안 보인다(config-navigation.js).
                            // 그런데 이 목록에는 그대로 남아 있어서, 가맹점은 특성 섹션을 홈에 올릴 수는
                            // 있는데 정작 그 특성을 손볼 곳이 없었다 — 만들 수도 고칠 수도 없는 것을
                            // 고르게 두지 않는다. 본사(level 50)·본사 도메인에서는 그대로 쓴다.
                            .filter(itm => 본사화면(user) || !String(itm.type).startsWith('items-property-group-'));
                          const 줄 = (itm) =>
                            <MenuItem key={itm.type} value={itm.type}>{itm.label} ({hasTypeCount(contentList, itm.type)})</MenuItem>;
                          // 추천을 모르는 프레임이면 예전처럼 한 줄로 보여준다.
                          if (!추천목록.length) return 전체.map(줄);
                          // 추천 순서는 추천목록에 적힌 순서를 따른다(그 프레임에서 자연스러운 차례다).
                          const 추천 = 추천목록.map(t => 전체.find(x => x.type === t)).filter(Boolean);
                          const 나머지 = 전체.filter(x => !추천목록.includes(x.type));
                          // 이미 쓰고 있는 섹션이 '그 밖' 에 있으면 처음부터 펼쳐 둔다 —
                          // 접힌 채로 두면 자기가 쓰던 것이 사라진 줄 안다.
                          const 쓰는중 = 나머지.some(x => hasTypeCount(contentList, x.type) > 0);
                          const 펼침 = 그밖열림 || 쓰는중;
                          return [
                            <ListSubheader key="추천">이 프레임에 어울리는 섹션</ListSubheader>,
                            ...추천.map(줄),
                            // ⚠ 「그 밖의 섹션」을 **없애지 않는다**. 접기만 한다.
                            //   가맹점 요청은 "나머지는 안 보이는게 혼란을 없앨 수 있을 듯" 이었는데,
                            //   DB를 보니 그 섹션들을 실제로 쓰는 몰이 8곳 있다(동영상·상품후기·셀러·
                            //   특성그룹 등). 없애면 그 몰들은 자기가 쓰던 섹션을 다시 못 만든다.
                            //   특성그룹 섹션은 가맹점 상품 데이터에서 파생돼 추천 목록에 넣을 수도 없다.
                            //   (frame-sections.js 주석도 "못 쓰는 섹션 목록이 아니다 — 막지 않고 권하기만
                            //    한다" 로 못 박아 두었다)
                            //   그래서 기본은 접어 두고, 필요한 사람만 펴서 쓰게 한다.
                            <ListSubheader key="그밖" sx={{ lineHeight: 2.2 }}>
                              <Box
                                component="span"
                                onClick={(e) => { e.stopPropagation(); set그밖열림(v => !v) }}
                                sx={{ cursor: 'pointer', userSelect: 'none', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                              >
                                그 밖의 섹션 ({나머지.length})
                                <span style={{ fontSize: 11 }}>{펼침 ? '▲ 접기' : '▼ 더 보기'}</span>
                              </Box>
                            </ListSubheader>,
                            ...(펼침 ? 나머지.map(줄) : []),
                          ];
                        })()}
                      </Select>
                      {/* 고른 섹션이 어떤 모양인지 보여준다.
                          가맹점 요청(2026-08-24): "가맹점에서는 섹션 가지고 정확한 이미지를
                          알기 어렵습니다. 각 색션별로 이미지화 해서 보여줄 수 있게 요청 드립니다."
                          이미지는 node scripts/section-preview/capture.cjs 로 다시 만든다.
                          아직 없는 섹션은 아무것도 안 그린다(SectionPreview 의 onError). */}
                      <SectionPreview type={sectionType} />
                      <Button
                        variant='contained'
                        className='content-add'
                        onClick={addSection}
                        style={{
                          height: '48px'
                        }}
                      >
                        추가
                      </Button>
                    </Stack>
                  </Card>
                </Grid>
              </>
            )}
            <Grid item xs={12} md={12}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={1}>
                  <Button
                    variant='contained'
                    style={{
                      height: '48px',
                      width: '120px',
                      marginLeft: 'auto'
                    }}
                    onClick={() => {
                      setModal({
                        func: () => {
                          onSave()
                        },
                        icon: 'material-symbols:edit-outline',
                        title: '저장 하시겠습니까?'
                      })
                    }}
                  >
                    저장
                  </Button>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
      <Tour steps={tourSteps} isOpen={tourOpen} disableInteraction={false} onRequestClose={closeTour} />
    </>
  )
}
export default MainObjSetting
