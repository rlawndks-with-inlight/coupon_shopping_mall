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
  Typography
} from '@mui/material'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import { Row, themeObj } from 'src/components/elements/styled-components'
import { Upload } from 'src/components/upload'
import { defaultManagerObj } from 'src/data/manager-data'
import { base64toFile, getMainObjType } from 'src/utils/function'
import _, { constant } from 'lodash'
import { useSettingsContext } from 'src/components/settings'
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
import { homeItemsSetting, homeItemsWithCategoriesSetting } from 'src/views/section/shop/utils'
import ReactQuillComponent from '../react-quill'
import { apiManager, uploadFilesByManager } from 'src/utils/api'
import { mainObjSchemaList } from 'src/utils/format'

const Tour = dynamic(() => import('reactour'), { ssr: false })
//메인화면
const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      width: 250,
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
    }
  }
}
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
const MainObjSetting = props => {
  const { MAIN_OBJ_TYPE } = props
  const { setModal } = useModal()
  const { themeDnsData, themePostCategoryList, themePropertyList } = useSettingsContext()
  const { user } = useAuthContext()
  const router = useRouter()

  const [item, setItem] = useState(defaultManagerObj.brands)
  const [contentList, setContentList] = useState([])
  const [sectionType, setSectionType] = useState('banner')
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
  const settingBrandObj = (item, brand_data) => {
    let obj = item
    let brand_data_keys = Object.keys(brand_data)
    for (var i = 0; i < brand_data_keys.length; i++) {
      if (brand_data[brand_data_keys[i]]) {
        obj[brand_data_keys[i]] = brand_data[brand_data_keys[i]]
      }
    }
    return obj
  }
  const settingPage = async () => {
    setProductContent({
      ...productContent,
      content: themeDnsData?.products ?? []
    })
    let brand_data = await apiManager('brands', 'get', {
      id: (!isNaN(parseInt(router.query.type)) ? router.query.type : '') || themeDnsData?.id
    })
    brand_data = settingBrandObj(item, brand_data)
    let content_list = brand_data[`${MAIN_OBJ_TYPE}`] ?? []
    setItem(brand_data)
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
            title: `${property?.property_name}`
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
  const handleRemoveFile = (inputFile, idx) => {
    let content_list = [...contentList]
    let find_index = _.findIndex(
      content_list[idx]?.list.map(img => {
        return img
      }),
      {
        path: inputFile.path,
        preview: inputFile.preview
      }
    )
    if (find_index < 0) {
      for (var i = 0; i < content_list[idx].list.length; i++) {
        if (content_list[idx].list[i]?.src == inputFile) {
          find_index = i
        }
      }
    }
    content_list[idx].list.splice(find_index, 1)
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
  const onSave = async () => {
    let content_list = [...contentList]
    let images = []

    let file_index_list = []
    for (var i = 0; i < content_list.length; i++) {
      if (['banner', 'button-banner'].includes(content_list[i]?.type)) {
        for (var j = 0; j < content_list[i].list.length; j++) {
          if (!content_list[i].list[j]?.src) {
            file_index_list.push({
              i: i,
              j: j
            })
            images.push({
              image: content_list[i].list[j]
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

      if (!file_result.length > 0) {
        return
      }
      for (var i = 0; i < file_index_list.length; i++) {
        if (file_index_list[i]['i'] >= 0 && file_index_list[i]['j'] >= 0) {
          content_list[file_index_list[i]['i']].list[file_index_list[i]['j']] = {
            title: content_list[file_index_list[i]['i']].list[file_index_list[i]['j']]?.title ?? '',
            sub_title: content_list[file_index_list[i]['i']].list[file_index_list[i]['j']]?.sub_title ?? '',
            link: content_list[file_index_list[i]['i']].list[file_index_list[i]['j']]?.link ?? '',
            src: file_result[i]?.url ?? ''
          }
          continue
        }
        if (file_index_list[i]['i'] >= 0) {
          content_list[file_index_list[i]['i']].src = file_result[i]?.url
          delete content_list[file_index_list[i]['i']].file
          continue
        }
      }
    }
    let brand_data = { ...item, [`${MAIN_OBJ_TYPE}`]: content_list }
    let result = await apiManager('brands', 'update', { ...brand_data, id: themeDnsData?.id })
    if (result) {
      toast.success('성공적으로 저장 되었습니다.')
      window.location.reload()
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
  const SectionProcess = props => {
    const { idx, item } = props
    return (
      <>
        <Row style={{ marginLeft: 'auto', columnGap: '0.25rem' }}>
          {/* <Tooltip title="미리 보시려면 클릭해 주세요.">
            <IconButton sx={{ padding: '0.25rem' }} onClick={() => { onClickPreview(idx) }}>
              <Icon icon={'icon-park-outline:preview-open'} />
            </IconButton>
          </Tooltip> */}
          <TextField
            size='small'
            sx={{ maxWidth: '150px' }}
            label='윗마진'
            placeholder='px(픽셀) 단위'
            type='number'
            value={item?.style?.margin_top ?? 0}
            defaultValue={item?.style?.margin_top ?? 0}
            onChange={e => {
              let content_list = [...contentList]
              if (!content_list[idx]?.style) {
                content_list[idx]['style'] = {}
              }
              content_list[idx]['style']['margin_top'] = e.target.value
              setContentList(content_list)
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
          {user?.level >= 50 && (
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
  const [previewSection, setPreviewSection] = useState(undefined)
  const onClickPreview = idx => {
    let column = contentList[idx]
    let type = contentList[idx]?.type
    column.src = column?.file?.preview || column?.src

    const data = {}
    const func = {}
    if (type == 'banner') setPreviewSection(<HomeBanner column={column} data={data} func={func} is_manager={true} />)
    if (type == 'editor') setPreviewSection(<HomeEditor column={column} data={data} func={func} is_manager={true} />)
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
    let value = e.target.value
    if (value.length == 3 && !searchTextList.includes(value)) {
      let search_text_list = searchTextList
      search_text_list.push(value)
      setSearchTextList(search_text_list)
      let product_content = await apiManager('products', 'list', {
        page: 1,
        page_size: 100000,
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
              md={window.location.host.split(':')[0] == process.env.MAIN_FRONT_URL || user?.level >= 50 ? 8 : 12}
            >
              <Card sx={{ p: 3, minHeight: '100%' }}>
                <Stack spacing={1}>
                  {contentList.length == 0 && (
                    <>
                      <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>
                        콘텐츠가 없습니다.
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
                              <SectionProcess idx={idx} item={item} />
                            </Row>
                            <TextField
                              label='이미지 최소높이'
                              value={item?.style?.min_height ?? 200}
                              type='number'
                              InputProps={{
                                endAdornment: <>px</>
                              }}
                              onChange={e => {
                                let content_list = [...contentList]
                                if (!content_list[idx]?.style) {
                                  content_list[idx]['style'] = {}
                                }
                                content_list[idx].style['min_height'] = e.target.value
                                setContentList(content_list)
                              }}
                            />
                            <TextField
                              label='이미지 최대높이'
                              value={item?.style?.max_height ?? 750}
                              type='number'
                              InputProps={{
                                endAdornment: <>px</>
                              }}
                              onChange={e => {
                                let content_list = [...contentList]
                                if (!content_list[idx]?.style) {
                                  content_list[idx]['style'] = {}
                                }
                                content_list[idx].style['max_height'] = e.target.value
                                setContentList(content_list)
                              }}
                            />
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
                              onRemove={inputFile => {
                                handleRemoveFile(inputFile, idx)
                              }}
                              onRemoveAll={() => {
                                handleRemoveAllFiles(idx)
                              }}
                              fileExplain={{
                                width: '(2000x850 추천)' //파일 사이즈 설명
                              }}
                              imageSize={{
                                //썸네일 사이즈
                                width: 200,
                                height: 85
                              }}
                            />

                            {item?.list &&
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
                              <SectionProcess idx={idx} item={item} />
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
                              onRemove={inputFile => {
                                handleRemoveFile(inputFile, idx)
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
                        {conditionOfSection('items', item) && (
                          <>
                            <Row style={{ alignItems: 'end' }}>
                              <CardHeader
                                title={`상품슬라이드 ${curTypeNum(contentList, 'items', idx)}`}
                                sx={{ paddingLeft: '0' }}
                              />
                              <SectionProcess idx={idx} item={item} />
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
                                  placeholder='3글자 이상 입력해 주세요.'
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
                              <SectionProcess idx={idx} item={item} />
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
                              <SectionProcess idx={idx} item={item} />
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
                                        placeholder='3글자 이상 입력해 주세요.'
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
                              <SectionProcess idx={idx} item={item} />
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
                              <SectionProcess idx={idx} item={item} />
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
                              <SectionProcess idx={idx} item={item} />
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
                              <SectionProcess idx={idx} item={item} />
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
                              <SectionProcess idx={idx} item={item} />
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
                              <SectionProcess idx={idx} item={item} />
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
                              <SectionProcess idx={idx} item={item} />
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
                                <TextField {...params} label='선택할 리뷰' placeholder='3글자 이상 입력해 주세요.' />
                              )}
                            />
                          </>
                        )}
                      </>
                    ))}
                </Stack>
              </Card>
            </Grid>
            {(window.location.host.split(':')[0] == process.env.MAIN_FRONT_URL || user?.level >= 50) && (
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
                        {[...mainObjSchemaList, ...getSettingPropertyList(themePropertyList)].map((itm) => {
                          return <MenuItem value={itm.type}>{itm.label} ({hasTypeCount(contentList, itm.type)})</MenuItem>
                        })}
                      </Select>
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
