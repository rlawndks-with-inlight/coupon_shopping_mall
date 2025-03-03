
import { Autocomplete, Avatar, Button, Card, Checkbox, FormControl, FormControlLabel, Grid, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Tooltip, Typography, alpha } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import $ from 'jquery';
import Iconify from "src/components/iconify/Iconify";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import _ from "lodash";
import { apiManager, uploadFileByManager } from "src/utils/api";
import { bankCodeList } from "src/utils/format";
import { SelectCategoryComponent } from "src/pages/manager/products/[edit_category]/[id]";
import { getAllIdsWithParents } from "src/utils/function";


const SellerEdit = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const { themeCategoryList, themeDnsData, themePropertyList } = useSettingsContext();

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [productContent, setProductContent] = useState({
    content: [],
  });
  const [item, setItem] = useState({
    user_name: '',
    //nickname: '',
    name: '',//
    //title: '',
    //seller_name: '',
    //addr: '',
    //acct_bank_name: '',
    acct_num: '',
    acct_name: '',
    phone_num: '',//
    //note: '',
    /*sns_obj: {
      youtube_channel: '',
      instagram_id: ''
    },*/
    background_file: undefined,
    background_img: '',
    passbook_file: undefined,
    passbook_img: '',
    contract_file: undefined,
    contract_img: '',
    bsin_lic_file: undefined,
    bsin_lic_img: '',
    id_file: undefined,
    id_img: '',
    profile_file: undefined,
    profile_img: '',
    user_pw: '',//
    level: 10,
    oper_id: '',
    oper_fee: '',
    seller_trx_fee: '',
    seller_range_u: 0,
    seller_range_o: 0,
    seller_brand: '',
    seller_category: ''
  })

  const [agents, setAgents] = useState([])

  const [productIds, setProductIds] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [searchTextList, setSearchTextList] = useState([]);
  const [curCategories, setCurCategories] = useState({});
  const [categoryChildrenList, setCategoryChildrenList] = useState({});
  const [categoryEdit, setCategoryEdit] = useState(false);
  const [brandEdit, setBrandEdit] = useState(false);


  const handleSelectCategory = (index, category) => {
    let ids = category.map(cat => cat.id);
    ids = JSON.stringify(ids.join(', '))
    if (index == 0) {
      setItem({
        ...item,
        ['seller_category']: ids
      })
    } else if (index == 1) {
      setItem({
        ...item,
        ['seller_brand']: ids
      })
    }
  }

  const tab_list = [
    {
      value: 0,
      label: '기본정보'
    },
    {
      value: 1,
      label: '파일 설정'
    },
    /*...(user?.level >= 40 ? [
      {
        value: 2,
        label: '수수료 설정 및 분양할 상품'
      },
    ] : [])*/
  ]
  useEffect(() => {
    settingPage();
  }, [])
  const settingPage = async () => {
    // let product_content = await getProductsByManager({
    //   page: 1,
    //   page_size: 100000
    // })

    // setProductContent(product_content);
    if (router.query?.edit_category == 'edit') {
      // let product_ids = await getMappingSellerWithProducts({
      //   id: router.query?.id
      // })
      //setProductIds(product_ids.map((item => { return item?.id })))
      let data = await apiManager('sellers', 'get', { id: router.query?.id });
      if (data) {
        setProductIds((data?.products ?? []).map(item => { return item?.id }))
        setProductContent({ content: data?.products ?? [] })
        setItem(data);
      }
    }

    let agent_data = await apiManager('users', 'list', {
      page: 1,
      page_size: 100,
      s_dt: '',
      e_dt: '',
      search: '',
      category_id: null,
      is_agent: 1
    })
    if (agent_data) {
      setAgents(agent_data.content)
      //console.log(agent_data.content)
    }

    setLoading(false);
  }
  const onClickCategory = (category, depth, idx) => {
    let parent_list = getAllIdsWithParents(themeCategoryList[idx]?.product_categories);
    let use_list = [];
    for (var i = 0; i < parent_list.length; i++) {
      if (parent_list[i][depth]?.id == category?.id) {
        use_list = parent_list[i];
        break;
      }
    }
    setCurCategories({
      ...curCategories,
      [idx]: use_list
    });
    let children_list = [];
    for (var i = 0; i < use_list.length; i++) {
      children_list.push(use_list[i]?.children);
    }
    setCategoryChildrenList({
      ...categoryChildrenList,
      [idx]: children_list
    });
    $(`.category-container-${idx}`).scrollLeft(100000);
  }
  const onSave = async () => {
    let result = undefined;
    let obj = item;
    if (user?.level == 20) {
      obj['oper_id'] = user?.id
      //console.log(obj)
    }
    if (item?.seller_range_o != 0 && item?.seller_range_u >= item?.seller_range_o) {
      toast.error('상품 판매 가능한 최소 가격이 최대 가격보다 낮아야 합니다.')
      return;
    }
    if (router.query?.edit_category == 'edit') {
      result = await apiManager('sellers', 'update', { ...obj, id: router.query?.id, });
    } else {
      result = await apiManager('sellers', 'create', { ...obj, });
    }
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      router.push('/manager/users/sellers');
    }
  }
  const onSearchProducts = async (e) => {
    let value = e.target.value;
    if (value.length == 3 && !searchTextList.includes(value)) {
      let search_text_list = searchTextList;
      search_text_list.push(value);
      setSearchTextList(search_text_list);
      let product_content = await apiManager('products', 'list', {
        page: 1,
        page_size: 100000,
        search: value,
      });
      let product_content_list = [
        ...productContent?.content,
        ...product_content?.content,
      ]
      product_content_list = product_content_list.reduce((acc, curr) => {
        const idx = acc.findIndex((obj) => obj['id'] === curr['id']);
        if (idx === -1) acc.push(curr);
        return acc;
      }, []);
      setProductContent({
        ...product_content,
        content: product_content_list
      })
    }
  }
  return (
    <>
      {!loading &&
        <>
          <Row style={{ margin: '0 0 1rem 0', columnGap: '0.5rem' }}>
            {tab_list.map((tab) => (
              <Button
                variant={tab.value == currentTab ? 'contained' : 'outlined'}
                onClick={() => {
                  setCurrentTab(tab.value)
                }}
              >{tab.label}</Button>
            ))}
          </Row>
          <Grid container spacing={3}>
            {currentTab == 0 &&
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      {/*
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          셀러로고
                        </Typography>
                        <Upload file={item.profile_img || item.profile_img} onDrop={(acceptedFiles) => {
                          const newFile = acceptedFiles[0];
                          if (newFile) {
                            setItem(
                              {
                                ...item,
                                ['profile_img']: Object.assign(newFile, {
                                  preview: URL.createObjectURL(newFile),
                                })
                              }
                            );
                          }
                        }} onDelete={() => {
                          setItem(
                            {
                              ...item,
                              ['profile_img']: '',
                              ['profile_file']: undefined
                            }
                          )
                        }}
                          fileExplain={{
                            width: '(800x300 추천)'
                          }}
                          boxStyle={{
                            padding: '0',
                            height: '300px',
                            display: 'flex'
                          }}
                        />
                        <Row style={{ margin: 'auto', transform: 'translateY(-42px)', position: 'relative', flexDirection: 'column', alignItems: 'center' }}>
                          {item.profile_img &&
                            <>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setItem(
                                    {
                                      ...item,
                                      ['profile_img']: '',
                                      ['profile_file']: undefined
                                    }
                                  );
                                }}
                                sx={{
                                  top: -16,
                                  right: -16,
                                  zIndex: 9,
                                  position: 'absolute',
                                  color: (theme) => alpha(theme.palette.common.white, 0.8),
                                  bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
                                  '&:hover': {
                                    bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
                                  },
                                }}
                              >
                                <Iconify icon="eva:close-fill" width={18} />
                              </IconButton>
                            </>}
                          <Tooltip title={`${item.profile_img ? '' : '프로필사진을 업로드 해주세요.'}`} >
                            <label for='profile-img' style={{ cursor: 'pointer' }}>
                              <Avatar sx={{ width: '84px', height: '84px' }} src={item.profile_img ? `${typeof item.profile_img == 'string' ? item.profile_img : URL.createObjectURL(item.profile_img)}` : ''} />
                              <Avatar sx={{ width: '84px', height: '84px' }} src={item.profile_file ? URL.createObjectURL(item.profile_file) : item.profile_img} />
                            </label>
                          </Tooltip>
                          <input type="file" style={{ display: 'none' }} id='profile-img' onChange={addProfileImg} />
                          <div style={{ marginTop: '1rem', fontWeight: 'bold', height: '24px' }}>{item.instagram_id}</div>
                        </Row>
                      </Stack>
*/}
                      {/*
                      <Stack spacing={1}>
                        <TextField
                          label='셀러몰 이름'
                          value={item.title}
                          onChange={(e) => {
                            setItem(
                              {
                                ...item,
                                ['title']: e.target.value
                              }
                            )
                          }} />
                      </Stack>
                      */}
                      <Stack spacing={1}>
                        <TextField
                          label='셀러몰 도메인'
                          value={item.dns}
                          onChange={(e) => {
                            setItem(
                              {
                                ...item,
                                ['dns']: e.target.value
                              }
                            )
                          }} />
                      </Stack>
                      {
                        /*
                        <Stack spacing={1}>
                        <TextField
                          label='인스타그램 아이디'
                          value={item.sns_obj.instagram_id}
                          onChange={(e) => {
                            setItem(
                              {
                                ...item,
                                ['sns_obj']: {
                                  ...item.sns_obj,
                                  instagram_id: e.target.value
                                }
                              }
                            )
                          }} />
                      </Stack>
                      <Stack spacing={1}>
                        <TextField
                          label='유튜브 채널'
                          value={item.sns_obj.youtube_channel}
                          placeholder="https://www.youtube.com/user_name"
                          onChange={(e) => {
                            setItem(
                              {
                                ...item,
                                ['sns_obj']: {
                                  ...item.sns_obj,
                                  youtube_channel: e.target.value
                                }
                              }
                            )
                          }} />
                      </Stack>
                        */
                      }
                      <TextField
                        label='이름'
                        value={item.name}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['name']: e.target.value
                            }
                          )
                        }} />
                      <Stack spacing={1}>
                        <TextField
                          label='셀러 아이디'
                          value={item.user_name}
                          onChange={(e) => {
                            setItem(
                              {
                                ...item,
                                ['user_name']: e.target.value
                              }
                            )
                          }} />
                      </Stack>
                      {
                        router.query?.edit_category != 'edit' &&
                        <>
                          <Stack spacing={1}>
                            <TextField
                              label='셀러 비밀번호'
                              value={item.user_pw}
                              type="password"
                              onChange={(e) => {
                                setItem(
                                  {
                                    ...item,
                                    ['user_pw']: e.target.value
                                  }
                                )
                              }} />
                          </Stack>
                        </>
                      }

                      <Stack spacing={1}>
                        <FormControl>
                          <InputLabel>
                            {user?.level >= 40 ? '영업자선택' : `영업자 : ${user?.name}`}
                          </InputLabel>
                          <Select
                            label='영업자선택'
                            value={item.oper_id}
                            disabled={user?.level >= 40 ? false : true}
                            onChange={e => {
                              setItem({
                                ...item,
                                ['oper_id']: e.target.value
                              })
                            }}
                          >
                            {agents.map((agent, idx) => {
                              return <MenuItem value={agent.id}>{agent.name}</MenuItem>
                            })}
                          </Select>
                        </FormControl>
                      </Stack>
                      <Stack spacing={3}>
                        <TextField
                          label='수수료율(예: 0.1로 입력할 시 10%)'
                          value={item.seller_trx_fee}
                          type="number"
                          onChange={(e) => {
                            setItem(
                              {
                                ...item,
                                ['seller_trx_fee']: e.target.value
                              }
                            )
                          }} />
                      </Stack>

                      <TextField
                        label='전화번호'
                        value={item.phone_num}
                        placeholder="하이픈(-) 제외 입력"
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['phone_num']: e.target.value
                            }
                          )
                        }} />
                      {
                        /*
                                            <TextField
                                              label='주소'
                                              value={item.addr}
                                              onChange={(e) => {
                                                setItem(
                                                  {
                                                    ...item,
                                                    ['addr']: e.target.value
                                                  }
                                                )
                                              }} />
                      */
                      }
                      <FormControl>
                        <InputLabel>은행선택</InputLabel>
                        <Select
                          label='은행선택'
                          value={item.acct_bank_code}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['acct_bank_code']: e.target.value
                            })
                          }}
                        >
                          {bankCodeList.map((itm, idx) => {
                            return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                          })}
                        </Select>
                      </FormControl>
                      <TextField
                        label='계좌번호'
                        value={item.acct_num}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['acct_num']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='예금주명'
                        value={item.acct_name}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['acct_name']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='메인색상'
                        value={item.seller_color}
                        type='color'
                        style={{
                          border: 'none'
                        }}
                        onChange={e => {
                          setItem({
                            ...item,
                            ['seller_color']: e.target.value
                          })
                        }}
                      />
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      {
                        /*
                        <TextField
                        label='아이디'
                        value={item.user_name}
                        disabled={router.query?.edit_category == 'edit'}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['user_name']: e.target.value
                            }
                          )
                        }} />
                      {router.query?.edit_category == 'add' &&
                        <>
                          <TextField
                            label='패스워드'
                            value={item.user_pw}

                            type='password'
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['user_pw']: e.target.value
                                }
                              )
                            }} />
                        </>}
                        */
                      }

                      {
                        /*
                                              <TextField
                                              label='닉네임'
                                              value={item.nickname}
                                              onChange={(e) => {
                                                setItem(
                                                  {
                                                    ...item,
                                                    ['nickname']: e.target.value
                                                  }
                                                )
                                              }} />
                                            <TextField
                                              label='셀러명'
                                              value={item.seller_name}
                                              onChange={(e) => {
                                                setItem(
                                                  {
                                                    ...item,
                                                    ['seller_name']: e.target.value
                                                  }
                                                )
                                              }} />
                        */
                      }
                      {
                        router?.query?.edit_category == 'edit' ?
                          <>
                            <Stack spacing={3}>
                              <Button variant="outlined" style={{ maxWidth: '200px' }} onClick={() => { setCategoryEdit(!categoryEdit) }}>
                                노출 카테고리 재설정
                              </Button>
                              {
                                categoryEdit &&
                                <>
                                  {themeCategoryList.map((group, index) => (
                                    <>
                                      {
                                        index == 0 &&
                                        <>
                                          <Stack spacing={1}>
                                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                              {group?.category_group_name}
                                            </Typography>
                                            <Typography>
                                              (미설정시 전체노출)
                                            </Typography>
                                            <SelectCategoryComponent
                                              curCategories={curCategories[index] ?? []}
                                              categories={group?.product_categories}
                                              categoryChildrenList={categoryChildrenList[index] ?? []}
                                              onClickCategory={onClickCategory}
                                              noneSelectText={`${group?.category_group_name}를 선택해 주세요`}
                                              sort_idx={index}
                                              id={group?.id}
                                              onChange={(selectedCategory) => handleSelectCategory(0, selectedCategory)}
                                              type={'seller'}
                                            />
                                          </Stack>
                                        </>
                                      }
                                    </>
                                  ))}
                                </>
                              }
                              <Button variant="outlined" style={{ maxWidth: '200px' }} onClick={() => { setBrandEdit(!brandEdit) }}>
                                노출 브랜드 재설정
                              </Button>
                              {
                                brandEdit &&
                                <>
                                  {themeCategoryList.map((group, index) => (
                                    <>
                                      {
                                        index == 1 &&
                                        <>
                                          <Stack spacing={1}>
                                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                              {group?.category_group_name}
                                            </Typography>
                                            <Typography>
                                              (미설정시 전체노출)
                                            </Typography>
                                            <SelectCategoryComponent
                                              curCategories={curCategories[index] ?? []}
                                              categories={group?.product_categories}
                                              categoryChildrenList={categoryChildrenList[index] ?? []}
                                              onClickCategory={onClickCategory}
                                              noneSelectText={`${group?.category_group_name}를 선택해 주세요`}
                                              sort_idx={index}
                                              id={group?.id}
                                              onChange={(selectedCategory) => handleSelectCategory(1, selectedCategory)}
                                              type={'seller'}
                                            />
                                          </Stack>
                                        </>
                                      }
                                    </>
                                  ))}
                                </>
                              }
                            </Stack>
                          </>
                          :
                          <>
                            <Stack spacing={3}>
                              {themeCategoryList.map((group, index) => (
                                <>
                                  <Stack spacing={1}>
                                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                      {group?.category_group_name}
                                    </Typography>
                                    <Typography>
                                      (미설정시 전체노출)
                                    </Typography>
                                    <SelectCategoryComponent
                                      curCategories={curCategories[index] ?? []}
                                      categories={group?.product_categories}
                                      categoryChildrenList={categoryChildrenList[index] ?? []}
                                      onClickCategory={onClickCategory}
                                      noneSelectText={`${group?.category_group_name}를 선택해 주세요`}
                                      sort_idx={index}
                                      id={group?.id}
                                      onChange={(selectedCategory) => handleSelectCategory(index, selectedCategory)}
                                      type={'seller'}
                                    />
                                  </Stack>
                                </>
                              ))}
                            </Stack>
                          </>
                      }
                      <Stack spacing={3}>
                        <TextField
                          label='상품 판매 가능한 최소 가격(미설정시 0원)'
                          value={item.seller_range_u}
                          type="number"
                          onChange={(e) => {
                            setItem(
                              {
                                ...item,
                                ['seller_range_u']: e.target.value
                              }
                            )
                          }} />
                      </Stack>
                      <Stack spacing={3}>
                        <TextField
                          label='상품 판매 가능한 최대 가격(미설정시 제한없음)'
                          value={item.seller_range_o}
                          type="number"
                          onChange={(e) => {
                            setItem(
                              {
                                ...item,
                                ['seller_range_o']: e.target.value
                              }
                            )
                          }} />
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              </>}
            {currentTab == 1 &&
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          로고 이미지
                        </Typography>
                        <Upload file={item.seller_logo_file || item.seller_logo_img} onDrop={(acceptedFiles) => {
                          const newFile = acceptedFiles[0];
                          if (newFile) {
                            setItem(
                              {
                                ...item,
                                ['seller_logo_file']: Object.assign(newFile, {
                                  preview: URL.createObjectURL(newFile),
                                })
                              }
                            );
                          }
                        }} onDelete={() => {
                          setItem(
                            {
                              ...item,
                              ['seller_logo_file']: undefined,
                              ['seller_logo_img']: '',
                            }
                          )
                        }}
                          fileExplain={{
                            width: '(800x300 추천)'
                          }}
                          boxStyle={{
                            padding: '0',
                            height: '300px',
                            display: 'flex'
                          }}
                        />
                      </Stack>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          통장사본 이미지
                        </Typography>
                        <Upload file={item.passbook_file || item.passbook_img} onDrop={(acceptedFiles) => {
                          const newFile = acceptedFiles[0];
                          if (newFile) {
                            setItem(
                              {
                                ...item,
                                ['passbook_file']: Object.assign(newFile, {
                                  preview: URL.createObjectURL(newFile),
                                })
                              }
                            );
                          }
                        }} onDelete={() => {
                          setItem(
                            {
                              ...item,
                              ['passbook_file']: undefined,
                              ['passbook_img']: '',
                            }
                          )
                        }}
                          fileExplain={{
                            width: '(800x300 추천)'
                          }}
                          boxStyle={{
                            padding: '0',
                            height: '300px',
                            display: 'flex'
                          }}
                        />
                      </Stack>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          계약서 이미지
                        </Typography>
                        <Upload file={item.contract_file || item.contract_img} onDrop={(acceptedFiles) => {
                          const newFile = acceptedFiles[0];
                          if (newFile) {
                            setItem(
                              {
                                ...item,
                                ['contract_file']: Object.assign(newFile, {
                                  preview: URL.createObjectURL(newFile),
                                })
                              }
                            );
                          }
                        }} onDelete={() => {
                          setItem(
                            {
                              ...item,
                              ['contract_file']: undefined,
                              ['contract_img']: '',
                            }
                          )
                        }}
                          fileExplain={{
                            width: '(800x300 추천)'
                          }}
                          boxStyle={{
                            padding: '0',
                            height: '300px',
                            display: 'flex'
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          사업자등록증 이미지
                        </Typography>
                        <Upload file={item.bsin_lic_file || item.bsin_lic_img} onDrop={(acceptedFiles) => {
                          const newFile = acceptedFiles[0];
                          if (newFile) {
                            setItem(
                              {
                                ...item,
                                ['bsin_lic_file']: Object.assign(newFile, {
                                  preview: URL.createObjectURL(newFile),
                                })
                              }
                            );
                          }
                        }} onDelete={() => {
                          setItem(
                            {
                              ...item,
                              ['bsin_lic_file']: undefined,
                              ['bsin_lic_img']: '',
                            }
                          )
                        }}
                          fileExplain={{
                            width: '(800x300 추천)'
                          }}
                          boxStyle={{
                            padding: '0',
                            height: '300px',
                            display: 'flex'
                          }}
                        />
                      </Stack>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          신분증 사본 이미지
                        </Typography>
                        <Upload file={item.id_file || item.id_img} onDrop={(acceptedFiles) => {
                          const newFile = acceptedFiles[0];
                          if (newFile) {
                            setItem(
                              {
                                ...item,
                                ['id_file']: Object.assign(newFile, {
                                  preview: URL.createObjectURL(newFile),
                                })
                              }
                            );
                          }
                        }} onDelete={() => {
                          setItem(
                            {
                              ...item,
                              ['id_file']: undefined,
                              ['id_img']: '',
                            }
                          )
                        }}
                          fileExplain={{
                            width: '(800x300 추천)'
                          }}
                          boxStyle={{
                            padding: '0',
                            height: '300px',
                            display: 'flex'
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              </>}
            {currentTab == 2 &&
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <TextField
                        label='수수료률'
                        value={item.seller_trx_fee}
                        type="number"
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['seller_trx_fee']: e.target.value
                            }
                          )
                        }} />
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Autocomplete
                        multiple
                        fullWidth
                        options={productContent?.content && (productContent?.content ?? []).map(item => { return item?.id })}
                        getOptionLabel={(item_id) => _.find((productContent?.content ?? []), { id: parseInt(item_id) })?.product_name}
                        defaultValue={productIds}
                        value={productIds}
                        onChange={(e, value) => {
                          setProductIds(value);
                        }}
                        renderInput={(params) => (
                          <TextField {...params} label="분양할 상품" placeholder="상품선택" onChange={(e) => {
                            onSearchProducts(e);
                          }} />
                        )}
                      />
                    </Stack>
                  </Card>
                </Grid>
              </>}
            <Grid item xs={12} md={12}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={1} style={{ display: 'flex' }}>
                  <Button variant="contained" style={{
                    height: '48px', width: '120px', marginLeft: 'auto'
                  }} onClick={() => {
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
    </>
  )
}
SellerEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default SellerEdit
