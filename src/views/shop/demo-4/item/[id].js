import styled from 'styled-components'
import {
  Box,
  Tab,
  Tabs,
  Card,
  Grid,
  Divider,
  Typography,
  Button,
  Radio,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  MenuItem,
  FormControl,
  DialogActions,
  Stack,
  InputLabel,
  Select,
  TextField,
} from '@mui/material';
import { test_item } from 'src/data/test-data';
import { useSettingsContext } from 'src/components/settings';
import {
  ProductDetailsCarousel,
  ProductDetailsReview,
  ProductDetailsSummary,
} from 'src/views/@dashboard/e-commerce/details';
import { useEffect, useState, useMemo } from 'react';
import { SkeletonProductDetails } from 'src/components/skeleton';
import { apiManager, apiShop } from 'src/utils/api';
import { styled as muiStyle } from '@mui/material';
import Head from 'next/head';
import { Row } from 'src/components/elements/styled-components';
import { commarNumber, getProductStatus } from 'src/utils/function';
import { Icon } from '@iconify/react';
import {
  insertCartDataUtil,
  insertWishDataUtil,
  selectItemOptionUtil,
} from 'src/utils/shop-util';
import toast from 'react-hot-toast';
import DialogBuyNow from 'src/components/dialog/DialogBuyNow';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useModal } from 'src/components/dialog/ModalProvider';
import { BasicInfo, ProductFaq } from 'src/components/elements/shop/demo-4';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 76vh;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  width: 90%;
  margin: 1rem auto;
`;

const ItemName = muiStyle(Typography)`
  font-size:16px;
`;

const ItemCharacter = (props) => {
  const { key_name, value, type = 0 } = props;
  if (type == 0) {
    return (
      <>
        <Row
          style={{
            columnGap: '0.25rem',
            marginTop: '1rem',
            marginBottom: '1rem',
            fontSize: '14px',
          }}
        >
          <Typography style={{ width: '6rem' }}>{key_name}</Typography>
          <Typography>{value}</Typography>
        </Row>
      </>
    );
  }
  return null;
};

/** ReactQuill 대신 사용하는 가벼운 HTML 뷰어 */
const DescriptionViewer = ({ product, themeDnsData }) => {
  const html = `
    ${product?.product_description ?? ''}
    ${themeDnsData?.basic_info ?? ''}
  `;

  return (
    <div
      className="ql-editor"
      style={{ fontSize: 16, fontFamily: 'Noto Sans KR' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const ItemDemo = (props) => {
  const {
    data: { },
    func: { router },
  } = props;

  const { setModal } = useModal();
  const {
    themeStretch,
    themeDnsData,
    themeWishData,
    onChangeWishData,
    themeCartData,
    onChangeCartData,
    themePropertyList,
  } = useSettingsContext();
  const { user } = useAuthContext();

  const [loading, setLoading] = useState(true);

  const [currentTab, setCurrentTab] = useState('description');
  const [product, setProduct] = useState({});
  const [reviewPage, setReviewPage] = useState(1);
  const [buyOpen, setBuyOpen] = useState(false);
  const [characterSelect, setCharacterSelect] = useState(false);
  const [unipassPopup, setUnipassPopup] = useState(false);
  const [unipass, setUnipass] = useState();
  const [reviewContent, setReviewContent] = useState({});
  const [selectProductGroups, setSelectProductGroups] = useState({
    count: 1,
    groups: [],
  });

  const [buyOrCart, setBuyOrCart] = useState();

  // 1) 특정 도메인일 때 비로그인 사용자는 로그인 페이지로 이동
  useEffect(() => {
    if (themeDnsData?.id == 74 && !user) {
      router.push('/shop/auth/login');
    }
  }, [themeDnsData, user, router]);

  // 2) 상품 정보만 먼저 가져오기
  const fetchProduct = async () => {
    if (!router.query?.id) return;

    setLoading(true);
    try {
      const productParams =
        themeDnsData?.id == 74
          ? {
            id: router.query?.id,
            seller_id: themeDnsData?.seller_id ?? 0,
          }
          : {
            id: router.query?.id,
          };

      const data = await apiShop('product', 'get', productParams);
      let newData = { ...data };

      if (themeDnsData?.id == 74) {
        const sub_image = newData?.sub_images;
        const description_image = newData?.sub_images;

        newData['sub_images'] = (sub_image ?? [])
          .map((img) => img?.product_sub_img)
          .filter((img) => img !== null && img !== undefined);

        newData['description_images'] = (description_image ?? [])
          .map((img) => img?.product_description_img)
          .filter((img) => img !== null && img !== undefined);

        newData['images'] = newData['sub_images'];
      } else {
        newData['sub_images'] = (newData['sub_images'] ?? []).map((img) => {
          return img?.product_sub_img;
        });

        if (newData?.product_img) {
          newData['sub_images'].unshift(newData?.product_img);
        }
        newData['images'] = newData['sub_images'];
      }

      setProduct(newData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 3) 리뷰는 필요할 때만 가져오기
  const fetchReviews = async (page = 1) => {
    if (!router.query?.id) return;
    try {
      const review_data = await apiManager('product-reviews', 'list', {
        page,
        product_id: router.query?.id,
        page_size: 10,
      });
      setReviewPage(page);
      setReviewContent(review_data);
    } catch (e) {
      console.error(e);
    }
  };

  // 4) 초기 진입 시 상품만 로딩
  useEffect(() => {
    fetchProduct();
    // themeDnsData, router.query.id 가 변하면 다시 상품 정보 로드
  }, [themeDnsData?.id, themeDnsData?.seller_id, router.query?.id]);

  // 탭 변경 시, 리뷰 탭이면 그때 리뷰 로딩 (한 번만)
  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
    if (newValue === 'reviews' && !reviewContent?.list) {
      fetchReviews(1);
    }
  };

  const TABS = useMemo(
    () => [
      {
        value: 'description',
        label: 'Detail',
        component:
          themeDnsData?.id != 74
            ? product?.product_description || themeDnsData?.basic_info ? (
              <DescriptionViewer
                product={product}
                themeDnsData={themeDnsData}
              />
            ) : null
            : (
              <div>
                {product?.description_images?.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt="Product Image"
                    loading="lazy"
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      margin: '0 auto',
                    }}
                  />
                ))}
              </div>
            ),
      },
      {
        value: 'reviews',
        label: `상품후기 (${reviewContent?.total ?? 0})`,
        component: product ? (
          <ProductDetailsReview
            product={product}
            reviewContent={reviewContent}
            onChangePage={fetchReviews}
            reviewPage={reviewPage}
          />
        ) : null,
      },
    ],
    [product, themeDnsData, reviewContent?.total, reviewPage]
  );

  const handleAddCart = async () => {
    if (user) {
      let result = await insertCartDataUtil(
        { ...product, seller_id: router.query?.seller_id ?? 0 },
        selectProductGroups,
        themeCartData,
        onChangeCartData
      );
      if (result) {
        toast.success('장바구니에 성공적으로 추가되었습니다.');
      }
    } else {
      toast.error('로그인을 해주세요.');
    }
  };

  const onSelectOption = (group, option, is_option_multiple) => {
    let select_product_groups = selectItemOptionUtil(
      group,
      option,
      selectProductGroups,
      is_option_multiple
    );
    setSelectProductGroups(select_product_groups);
  };

  async function verifyUnipass(code) {
    let result = await apiManager('util/unipass', 'create', { code: code });
    if (result) {
      if (result?.message == '정상 : ') {
        toast.success('개인통관고유부호가 확인되었습니다.');
        setUnipassPopup(false);
        setBuyOpen(true);
      } else {
        toast.error('회원정보와 일치하지 않는 번호입니다. 다시 확인 바랍니다.');
      }
    } else {
      return;
    }
  }

  return (
    <>
      {/* 옵션 선택 다이얼로그 */}
      <Dialog
        open={characterSelect}
        onClose={() => {
          setCharacterSelect(false);
          router.reload();
        }}
        PaperProps={{
          style: {
            maxWidth: '600px',
            width: '90%',
          },
        }}
      >
        <DialogTitle>옵션선택</DialogTitle>
        <DialogContent>
          {product?.characters &&
            product?.characters.map((character, idx) => (
              <Stack
                key={idx}
                direction="row"
                justifyContent="space-between"
              >
                <FormControl sx={{ width: '100%', marginTop: '1rem' }}>
                  <InputLabel>{character?.character_name}</InputLabel>
                  <Select
                    label={character?.character_name}
                    sx={{
                      width: '100%',
                    }}
                    placeholder={character?.character_name}
                    onChange={(e) => {
                      onSelectOption(character, e.target.value);
                    }}
                  >
                    {character?.character_value &&
                      character?.character_value
                        .split(/[,/]\s*/)?.map((val) => val.trim())
                        .map((data, idx2) => (
                          <MenuItem key={idx2} value={data}>
                            {data}
                          </MenuItem>
                        ))}
                  </Select>
                </FormControl>
              </Stack>
            ))}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              if (
                product?.characters?.length >
                selectProductGroups?.groups?.length
              ) {
                toast.error('옵션선택을 완료해주세요.');
              } else {
                if (buyOrCart == 'buy') {
                  setCharacterSelect(false);
                  setBuyOpen(true);
                } else {
                  handleAddCart();
                  setCharacterSelect(false);
                }
              }
            }}
            color="inherit"
          >
            선택완료
          </Button>
          <Button
            onClick={() => {
              setCharacterSelect(false);
              router.reload();
            }}
            color="inherit"
          >
            나가기
          </Button>
        </DialogActions>
      </Dialog>

      {/* 바로구매 다이얼로그 */}
      <DialogBuyNow
        buyOpen={buyOpen}
        setBuyOpen={setBuyOpen}
        product={product}
        selectProductGroups={selectProductGroups}
      />

      <Wrapper>
        <ContentWrapper>
          {loading ? (
            <SkeletonProductDetails />
          ) : (
            <>
              {product && (
                <>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6} lg={6}>
                      <ProductDetailsCarousel product={product} />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      md={6}
                      lg={6}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        {product?.brand_name && (
                          <>
                            <div
                              style={{
                                fontSize: '30px',
                                fontFamily: 'Playfair Display',
                                fontWeight: 'bold',
                                borderTop: '1px solid #ccc',
                                padding: '1rem 0',
                              }}
                            >
                              {product?.brand_name[0]?.category_en_name ?? ''}
                            </div>
                          </>
                        )}
                        <ItemName
                          style={{
                            whiteSpace: 'wrap',
                            fontFamily: 'Noto Sans KR',
                            fontSize: '25px',
                          }}
                        >
                          {product?.product_name}
                        </ItemName>

                        {product?.product_code && (
                          <>
                            <ItemCharacter
                              key_name={'상품코드'}
                              value={product?.product_code}
                            />
                          </>
                        )}

                        {themePropertyList.map((group, index) => {
                          let property_list = (product?.properties ?? []).filter(
                            (el) => el?.property_group_id == group?.id
                          );
                          property_list = property_list.map((property) => {
                            return property?.property_name;
                          });
                          if (group?.property_group_name == '등급') {
                            return (
                              <ItemCharacter
                                key={group?.id}
                                key_name={group?.property_group_name}
                                value={`${property_list.join(', ')}`}
                              />
                            );
                          }
                          return null;
                        })}

                        {themeDnsData?.id != 74 &&
                          product?.characters &&
                          product?.characters.map((character, idx) => (
                            <ItemCharacter
                              key={idx}
                              key_name={character?.character_name}
                              value={character?.character_value}
                            />
                          ))}

                        <div
                          style={{
                            borderBottom: '1px solid #ccc',
                            width: '100%',
                            marginTop: '1rem',
                          }}
                        />

                        {themePropertyList.map((group, index) => {
                          let property_list = (product?.properties ?? []).filter(
                            (el) => el?.property_group_id == group?.id
                          );
                          property_list = property_list.map((property) => {
                            return property?.property_name;
                          });
                          return null;
                        })}
                      </div>

                      <div style={{ width: '100%' }}>
                        <div
                          style={{
                            borderTop: '1px solid #ccc',
                            width: '100%',
                          }}
                          onClick={() => { }}
                        >
                          <ItemCharacter
                            key_name={'판매가'}
                            value={
                              <>
                                {commarNumber(
                                  parseInt(product?.product_sale_price)
                                )}
                                원
                              </>
                            }
                          />
                          {themeDnsData?.id == 74 && (
                            <>
                              <div
                                style={{
                                  textAlign: 'right',
                                  color: 'gray',
                                }}
                              >
                                구매시{' '}
                                {commarNumber(
                                  product?.product_sale_price *
                                  themeDnsData?.seller_point
                                )}
                                원 적립
                              </div>
                            </>
                          )}
                        </div>

                        <div
                          style={{
                            borderTop: '1px solid #ccc',
                            width: '100%',
                            padding: '1rem 0',
                          }}
                          onClick={() => { }}
                        >
                          <ItemCharacter
                            key_name={'배송기간'}
                            value={
                              <div>10-14일 내 도착 예정(검수 후 배송)</div>
                            }
                          />
                        </div>

                        <div
                          style={{ width: '100%', padding: '1rem 0' }}
                          onClick={() => { }}
                        >
                          <div style={{ color: 'gray' }}>
                            모든 상품은 배송 전 검수를 거칩니다
                          </div>
                        </div>

                        {/* 구매 버튼 */}
                        <Button
                          disabled={
                            product?.status != 0 ||
                            !(product?.product_sale_price > 0)
                          }
                          sx={{
                            width: '100%',
                            height: '60px',
                            backgroundColor: 'black',
                            borderRadius: '0',
                            fontWeight: 'bold',
                            fontSize: '18px',
                            fontFamily: 'Playfair Display',
                            color: 'white',
                            border: '1px solid #999999',
                            '&:hover': {
                              backgroundColor: 'black',
                            },
                          }}
                          onClick={() => {
                            if (
                              themeDnsData?.id == 74 &&
                              !themeDnsData?.seller_id
                            ) {
                              toast.error(
                                '본사페이지에서는 결제가 진행되지 않습니다.'
                              );
                              return;
                            }
                            if (user) {
                              if (user?.unipass) {
                                if (product?.characters?.length > 0) {
                                  setCharacterSelect(true);
                                  setBuyOrCart('buy');
                                } else {
                                  setBuyOpen(true);
                                }
                              } else {
                                toast.error(
                                  '개인통관고유부호가 존재하지 않습니다. 관리자에 문의하세요.'
                                );
                              }
                            } else {
                              toast.error('로그인을 해주세요.');
                            }
                          }}
                        >
                          구매하기
                        </Button>

                        {/* 장바구니 + 위시리스트 */}
                        <Row
                          style={{
                            columnGap: '0.5rem',
                            marginTop: '0.5rem',
                            alignItems: 'center',
                          }}
                        >
                          <Button
                            disabled={
                              product?.status != 0 ||
                              !(product?.product_sale_price > 0)
                            }
                            sx={{
                              width: '90%',
                              height: '60px',
                              borderRadius: '0',
                              fontWeight: 'bold',
                              fontSize: '18px',
                              fontFamily: 'Playfair Display',
                              color: '#999999',
                              border: '1px solid #999999',
                              '&:hover': {
                                backgroundColor: 'transparent',
                              },
                            }}
                            onClick={() => {
                              if (product?.characters?.length > 0) {
                                setCharacterSelect(true);
                                setBuyOrCart('cart');
                              } else {
                                handleAddCart();
                              }
                            }}
                          >
                            장바구니
                          </Button>
                          <Icon
                            icon={
                              themeWishData
                                .map((wish) => {
                                  return wish?.product_id;
                                })
                                .includes(product?.id)
                                ? 'ph:heart-fill'
                                : 'ph:heart-light'
                            }
                            style={{
                              width: '30px',
                              height: '30px',
                              color: `${themeDnsData?.theme_css.main_color}`,
                              cursor: 'pointer',
                              margin: '0 1rem',
                            }}
                            onClick={async () => {
                              if (user) {
                                let result = await insertWishDataUtil(
                                  product,
                                  themeWishData,
                                  onChangeWishData
                                );
                                if (result?.is_add) {
                                  setModal({
                                    func: () => {
                                      router.push(`/shop/auth/wish`);
                                    },
                                    icon: 'mdi:heart',
                                    title:
                                      '상품이 위시리스트에 담겼습니다\n바로 확인 하시겠습니까?',
                                  });
                                }
                              } else {
                                toast.error('로그인을 해주세요.');
                              }
                            }}
                          />
                        </Row>
                      </div>
                    </Grid>
                  </Grid>

                  {/* 상세/리뷰 탭 */}
                  <Card
                    style={{
                      marginTop: '2rem',
                    }}
                  >
                    <Tabs
                      value={currentTab}
                      onChange={handleChangeTab}
                      sx={{ px: 3, bgcolor: 'background.neutral' }}
                    >
                      {TABS.map((tab) => (
                        <Tab
                          key={tab.value}
                          value={tab.value}
                          label={tab.label}
                        />
                      ))}
                    </Tabs>
                    <Divider />

                    {TABS.map(
                      (tab) =>
                        tab.value === currentTab && (
                          <Box
                            key={tab.value}
                            sx={{
                              ...(currentTab === 'description' && {
                                p: 3,
                              }),
                            }}
                          >
                            {tab.component}
                          </Box>
                        )
                    )}
                  </Card>
                </>
              )}
            </>
          )}
        </ContentWrapper>
      </Wrapper>
    </>
  );
};

export default ItemDemo;
