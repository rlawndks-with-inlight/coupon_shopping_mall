import { Icon } from "@iconify/react";
import { Autocomplete, Box, Button, Card, CardHeader, Chip, Container, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { Row } from "src/components/elements/styled-components";
import { Upload } from "src/components/upload";
import { PATH_MANAGER, defaultManagerObj, react_quill_data } from "src/data/manager-data";
import { test_items } from "src/data/test-data";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { axiosIns } from "src/utils/axios";
import { base64toFile } from "src/utils/function";
import _ from 'lodash'
import { useSettingsContext } from "src/components/settings";
import { useRouter } from "next/router";
import CustomBreadcrumbs from "src/components/custom-breadcrumbs/CustomBreadcrumbs";
import { getBrandByManager, getProductsByManager, updateBrandByManager, uploadFileByManager, uploadsFileByManager } from "src/utils/api-manager";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})
const Tour = dynamic(
  () => import('reactour'),
  { ssr: false },
);
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
  let count = 0;
  for (var i = 0; i < list.length; i++) {
    if (list[i]?.type == type_name) {
      count++;
    }
  }
  return count;
}
const curTypeNum = (list, type_name, idx) => {
  let count = 0;
  for (var i = 0; i < list.length; i++) {
    if (list[i]?.type == type_name) {
      count++;
      if (idx == i) {
        break;
      }
    }
  }
  return count;
}

const Main = () => {
  const { setModal } = useModal()
  const { themeMode, themeDnsData } = useSettingsContext();

  const router = useRouter();

  const [item, setItem] = useState(defaultManagerObj.brands);
  const [contentList, setContentList] = useState([]);
  const [sectionType, setSectionType] = useState('banner');
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const homeSectionDefaultSetting = {
    banner: {
      type: 'banner',
      list: [],
    },
    items: {
      type: 'items',
      title: '',
      sub_title: '',
      list: []
    },
    editor: {
      type: 'editor',
      content: ''
    }
  }
  const returnKoNameBySectionType = {
    banner: '배너슬라이드',
    items: '상품슬라이드',
    editor: '에디터',
    all: '전체',
  }
  useEffect(() => {
    settingPage();
    //settingPage();
    // openTour('content-add', "'추가' 버튼을 클릭하여 메인페이지 섹션을 추가해 주세요.")
  }, [])
  const settingBrandObj = (item, brand_data) => {
    let obj = item;
    let brand_data_keys = Object.keys(brand_data);
    for (var i = 0; i < brand_data_keys.length; i++) {
      if (brand_data[brand_data_keys[i]]) {
        obj[brand_data_keys[i]] = brand_data[brand_data_keys[i]];
      }
    }
    return obj;
  }
  const settingPage = async () => {
    let product_list = await getProductsByManager({
      page: 1,
      page_size: 100000
    })
    if (product_list?.total == 0) {
      return;
    }
    setProductList(product_list?.content ?? []);
    let brand_data = await getBrandByManager({
      id: router.query.brand_id | themeDnsData?.id
    })
    brand_data = settingBrandObj(item, brand_data);
    let content_list = brand_data?.main_obj??[];
    setItem(brand_data);
    setContentList(content_list);
    setLoading(false);
  }

  const addSection = () => {
    closeTour();
    setContentList([...contentList, homeSectionDefaultSetting[sectionType]])
  }
  const deleteSection = (idx) => {
    let content_list = [...contentList];
    content_list.splice(idx, 1);
    setContentList(content_list)
  }
  const handleDropMultiFile = (acceptedFiles, idx) => {
    let content_list = [...contentList];
    for (var i = 0; i < acceptedFiles.length; i++) {
      content_list[idx]['list'].push(Object.assign(acceptedFiles[i], {
        preview: URL.createObjectURL(acceptedFiles[i]),
        link: "",
      }))
    }
    setContentList(content_list);
  };
  const handleRemoveFile = (inputFile, idx) => {
    let content_list = [...contentList];
    let find_index = _.findIndex(content_list[idx].list.map(img => { return img }), {
      path: inputFile.path,
      preview: inputFile.preview
    });
    if (find_index < 0) {
      for (var i = 0; i < content_list[idx].list.length; i++) {
        if (content_list[idx].list[i]?.src == inputFile) {
          find_index = i;
        }
      }
    }
    content_list[idx].list.splice(find_index, 1);
    setContentList(content_list);
  };
  const handleRemoveAllFiles = (idx) => {
    let content_list = [...contentList];
    content_list[idx]['list'] = [];
    setContentList(content_list);
  };
  const handleChangeItemMultiSelect = (value, idx) => {
    let content_list = [...contentList];
    let list = [...value];
    content_list[idx]['list'] = list;
    setContentList(content_list)
  }
  const onSave = async () => {
    let content_list = [...contentList];
    let images = [];
    let file_index_list = [];
    for (var i = 0; i < content_list.length; i++) {
      if (content_list[i]?.type == 'banner') {
        for (var j = 0; j < content_list[i].list.length; j++) {
          if (!content_list[i].list[j]?.src) {
            file_index_list.push({
              i: i,
              j: j,
            });
            images.push({
              image: content_list[i].list[j]
            })
          }
        }

      } else if (content_list[i]?.type == 'items') {

      } else if (content_list[i]?.type == 'editor') {

      }
    }
    if (file_index_list.length > 0) {
      let file_result = await uploadsFileByManager({
        images
      });
      file_result = file_result?.data ?? [];
      for (var i = 0; i < file_index_list.length; i++) {
        content_list[file_index_list[i]['i']].list[file_index_list[i]['j']] = {
          src: file_result[i]?.url ?? "",
          link: content_list[file_index_list[i]['i']].list[file_index_list[i]['j']].link
        }
      }
    }
    let brand_data = { ...item, main_obj: content_list };
    let result = await updateBrandByManager({ ...brand_data, id: themeDnsData?.id })
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      window.location.href = '/manager/settings/brands';
    }
  }
  const [tourOpen, setTourOpen] = useState(false);
  const [tourSteps, setTourSteps] = useState([]);

  const openTour = (class_name, text,) => {
    setTourSteps([
      {
        selector: `.${class_name}`,
        content: text,
      },
    ])
    setTourOpen(true);
  }
  const closeTour = () => {
    setTourOpen(false);
    setTourSteps([]);
  };
  return (
    <>
      {!loading &&
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 3, minHeight: '100%' }}>
                <Stack spacing={1}>
                  {contentList.length == 0 &&
                    <>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                        콘텐츠가 없습니다.
                      </Typography>
                    </>}
                  {contentList && contentList.map((item, idx) => (
                    <>
                      {item.type == 'banner' && (router.query.type == 'banner' || router.query.type == 'all' || !router.query.type) &&
                        <>
                          <Row style={{ alignItems: 'end' }}>
                            <CardHeader title={`배너슬라이드 ${curTypeNum(contentList, 'banner', idx)}`} sx={{ paddingLeft: '0' }} />
                            <IconButton sx={{ padding: '0.25rem', marginLeft: 'auto' }} onClick={() => { deleteSection(idx) }}>
                              <Icon icon={'ph:x-bold'} />
                            </IconButton>
                          </Row>
                          <Upload
                            multiple
                            thumbnail={true}
                            onChangeLink={(e) => {

                            }}
                            files={contentList[idx].list.map(img => {
                              return img?.src || img
                            })}
                            onDrop={(acceptedFiles) => {
                              handleDropMultiFile(acceptedFiles, idx)
                            }}
                            onRemove={(inputFile) => {
                              handleRemoveFile(inputFile, idx)
                            }}
                            onRemoveAll={() => {
                              handleRemoveAllFiles(idx);
                            }}
                            fileExplain={{
                              width: '(2000x850 추천)'//파일 사이즈 설명
                            }}
                            imageSize={{ //썸네일 사이즈
                              width: 200,
                              height: 85
                            }}
                          />
                          {contentList[idx].list && contentList[idx].list.map((item, index) => (
                            <>
                              <TextField size='small' label={`${index + 1}번째 이미지 링크 (링크 없을 시 빈칸으로 유지)`} value={contentList[idx].list[index].link ?? ""} onChange={(e) => {
                                let content_list = [...contentList];
                                content_list[idx].list[index].link = e.target.value;
                                setContentList(content_list);
                              }} />
                            </>
                          ))}
                        </>}
                      {item.type == 'items' && (router.query.type == 'items' || router.query.type == 'all' || !router.query.type) &&
                        <>
                          <Row style={{ alignItems: 'end' }}>
                            <CardHeader title={`상품슬라이드 ${curTypeNum(contentList, 'items', idx)}`} sx={{ paddingLeft: '0' }} />
                            <IconButton sx={{ padding: '0.25rem', marginLeft: 'auto' }} onClick={() => { deleteSection(idx) }}>
                              <Icon icon={'ph:x-bold'} />
                            </IconButton>
                          </Row>
                          <TextField label='제목' value={item.title} onChange={(e) => {
                            let content_list = [...contentList];
                            content_list[idx]['title'] = e.target.value;
                            setContentList(content_list)
                          }} />
                          <TextField label='부제목' value={item.sub_title} onChange={(e) => {
                            let content_list = [...contentList];
                            content_list[idx]['sub_title'] = e.target.value;
                            setContentList(content_list)
                          }} />
                          <Autocomplete
                            multiple
                            fullWidth
                            options={productList.map(item=>{return item?.id})}
                            getOptionLabel={(item_id) => _.find(productList, {id: parseInt(item_id)})?.product_name}
                            defaultValue={item.list}
                            value={item.list}
                            onChange={(e, value) => {
                              handleChangeItemMultiSelect(value, idx)
                            }}
                            renderInput={(params) => (
                              <TextField {...params} label="선택할 상품" placeholder="상품선택" />
                            )}
                          />

                        </>}
                      {item.type == 'editor' && (router.query.type == 'editor' || router.query.type == 'all' || !router.query.type) &&
                        <>
                          <Row style={{ alignItems: 'end' }}>
                            <CardHeader title={`에디터 ${curTypeNum(contentList, 'editor', idx)}`} sx={{ paddingLeft: '0' }} />
                            <IconButton sx={{ padding: '0.25rem', marginLeft: 'auto' }} onClick={() => { deleteSection(idx) }}>
                              <Icon icon={'ph:x-bold'} />
                            </IconButton>
                          </Row>
                          <ReactQuill
                            theme={'snow'}
                            id={'content'}
                            placeholder={''}
                            value={item.content}
                            modules={react_quill_data.modules}
                            formats={react_quill_data.formats}
                            onChange={async (e) => {
                              let note = e;
                              if (e.includes('<img src="') && e.includes('base64,')) {
                                let base64_list = e.split('<img src="');
                                for (var i = 0; i < base64_list.length; i++) {
                                  if (base64_list[i].includes('base64,')) {
                                    let img_src = base64_list[i];
                                    img_src = await img_src.split(`"></p>`);
                                    let base64 = img_src[0];
                                    img_src = await base64toFile(img_src[0], 'note.png');
                                    let formData = new FormData();
                                    formData.append('file', img_src);
                                    const response = await uploadFileByManager({
                                      formData
                                    });
                                    note = await note.replace(base64, response?.data?.url)
                                  }
                                }
                              }
                              let content_list = [...contentList];
                              content_list[idx]['content'] = note;
                              setContentList(content_list);
                            }} />
                        </>}
                    </>
                  ))}
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    추가할 섹션
                  </Typography>
                  <Select sx={{ width: '100%' }} value={sectionType} onChange={(e) => {
                    setSectionType(e.target.value)
                  }}>
                    <MenuItem value={'banner'}>배너슬라이드 ({hasTypeCount(contentList, 'banner')})</MenuItem>
                    <MenuItem value={'items'}>상품슬라이드 ({hasTypeCount(contentList, 'items')})</MenuItem>
                    <MenuItem value={'editor'}>에디터 ({hasTypeCount(contentList, 'editor')})</MenuItem>
                  </Select>
                  <Button variant="contained"
                    className="content-add"
                    onClick={addSection}
                    style={{
                      height: '48px'
                    }}>
                    추가
                  </Button>
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={12}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={1}>
                  <Button variant="contained" style={{
                    height: '48px', width: '120px', marginLeft: 'auto'
                  }} onClick={()=>{
                    setModal({
                      func: () => { onSave() },
                      icon: 'material-symbols:edit-outline',
                      title: '저장 하시겠습니까?'
                    })
                  }}>
                    저장
                  </Button>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </>}
      <Tour
        steps={tourSteps}
        isOpen={tourOpen}
        disableInteraction={false}
        onRequestClose={closeTour}
      />
    </>
  )
}
Main.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default Main;
