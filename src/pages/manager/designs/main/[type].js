import { Icon } from "@iconify/react";
import { Box, Button, Card, CardHeader, Chip, Container, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { Row } from "src/components/elements/styled-components";
import { Upload } from "src/components/upload";
import { PATH_MANAGER, react_quill_data } from "src/data/manager-data";
import { test_items } from "src/data/test-data";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { axiosIns } from "src/utils/axios";
import { base64toFile } from "src/utils/function";
import _ from 'lodash'
import { useSettingsContext } from "src/components/settings";
import { useRouter } from "next/router";
import CustomBreadcrumbs from "src/components/custom-breadcrumbs/CustomBreadcrumbs";
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})
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

  const { themeMode } = useSettingsContext();

  const router = useRouter();

  const [contentList, setContentList] = useState([]);
  const [sectionType, setSectionType] = useState('banner');
  const [productList, setProductList] = useState([]);
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
    setProductList(test_items);

  }, [])
  const addSection = () => {
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
      content_list[idx]['list'].push({ ...acceptedFiles[i], preview: URL.createObjectURL(acceptedFiles[i]) })
    }
    setContentList(content_list);
  };

  const handleRemoveFile = (inputFile, idx) => {
    let content_list = [...contentList];
    const filesFiltered = content_list[idx].list.filter((fileFiltered) => fileFiltered !== inputFile);
    content_list[idx]['list'] = filesFiltered;
    setContentList(content_list);
  };

  const handleRemoveAllFiles = (idx) => {
    let content_list = [...contentList];
    content_list[idx]['list'] = [];
    setContentList(content_list);
  };
  const handleChangeItemMultiSelect = (event, idx) => {
    let content_list = [...contentList];
    let list = [...event.target.value];
    content_list[idx]['list'] = list;
    setContentList(content_list)
  }

  const onSave = () => {
  }
  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3,minHeight:'100%' }}>
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
                        files={contentList[idx].list}
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
                      <FormControl fullWidth>
                        <InputLabel>선택할 상품</InputLabel>
                        <Select
                          multiple
                          label='선택할 상품'
                          value={item.list}
                          MenuProps={MenuProps}
                          id='demo-multiple-chip'
                          onChange={(e) => handleChangeItemMultiSelect(e, idx)}
                          labelId='demo-multiple-chip-label'
                          renderValue={selected => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                              {selected.map((item, idx) => {
                                return <Chip key={idx} label={_.find(productList, { id: item }).name} sx={{ m: 0.75, cursor: 'pointer' }} />
                              })}
                            </Box>
                          )}
                        >
                          {productList && productList.map((item, idx) => (
                            <MenuItem key={idx} value={item?.id}>
                              {item?.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

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
                                let config = {
                                  headers: {
                                    'Content-Type': "multipart/form-data",
                                  }
                                };
                                const response = await axiosIns().post('/api/v1/manager/posts/upload', formData, config);
                                note = await note.replace(base64, response?.data?.file)
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
              }} onClick={onSave}>
                저장
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}
Main.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default Main;
