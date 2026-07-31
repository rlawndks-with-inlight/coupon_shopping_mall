import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Container, Card, Stack, Typography, Button, Autocomplete, TextField, Avatar, Alert } from '@mui/material';
import { toast } from 'react-hot-toast';
import ManagerLayout from 'src/layouts/manager/ManagerLayout';
import { useSettingsContext } from 'src/components/settings';
import { apiManager } from 'src/utils/api';
import { commarNumber } from 'src/utils/function';

// 단일/소수 상품 데모(블로그 4~9)용 대표 상품 지정 — 가맹점이 디자인관리에서 직접 설정.
// setting_obj.featured_product_ids에 저장(+ 하위호환 featured_product_id 미러).
const FEATURED_BLOG_DEMOS = [4, 5, 6, 7, 8, 9];

const FeaturedProductPage = () => {
  const { themeDnsData } = useSettingsContext();
  const products = themeDnsData?.products ?? [];
  const so = themeDnsData?.setting_obj ?? {};
  const isSingleProductBlog = FEATURED_BLOG_DEMOS.includes(Number(themeDnsData?.blog_demo_num));

  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const ids = so?.featured_product_ids ?? (so?.featured_product_id ? [so.featured_product_id] : []);
    const list = ids.map((id) => products.find((p) => String(p?.id) === String(id))).filter(Boolean);
    setSelected(list);
  }, [themeDnsData?.id, products?.length]);

  const onSave = async () => {
    setSaving(true);
    const ids = selected.map((p) => p?.id);
    const result = await apiManager('brands', 'update', {
      id: themeDnsData?.id,
      setting_obj: { ...so, featured_product_ids: ids, featured_product_id: ids[0] ?? '' },
    });
    setSaving(false);
    if (result) {
      toast.success('대표 상품이 저장되었습니다.');
      window.location.reload();
    }
  };

  return (
    <>
      <Head><title>대표 상품 관리</title></Head>
      <Container maxWidth="sm" sx={{ py: { xs: 3, md: 4 } }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: { xs: 20, md: 24 }, fontWeight: 900 }}>대표 상품 관리</Typography>
          <Typography sx={{ fontSize: 13.5, color: '#666', lineHeight: 1.7 }}>
            홈 화면에 노출할 대표 상품을 지정합니다. <b>첫 번째</b>가 메인으로, <b>2개 이상</b> 선택하면 나머지는 하단 그리드에 표시됩니다.
          </Typography>
        </Stack>

        {!isSingleProductBlog && (
          <Alert severity="info" sx={{ mb: 2 }}>
            이 설정은 <b>단일·소수 상품 블로그 데모</b>에서만 홈에 반영됩니다. 현재 프레임에는 표시되지 않을 수 있습니다.
          </Alert>
        )}

        <Card variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
          <Autocomplete
            multiple
            fullWidth
            options={products}
            value={selected}
            getOptionLabel={(p) => p?.product_name ?? ''}
            isOptionEqualToValue={(a, b) => String(a?.id) === String(b?.id)}
            onChange={(e, value) => setSelected(value)}
            renderOption={(props, p) => (
              <li {...props} key={p?.id}>
                <Avatar src={p?.product_img} variant="rounded" sx={{ width: 32, height: 32, mr: 1 }} />
                <span style={{ flex: 1 }}>{p?.product_name}</span>
                <span style={{ color: '#888', fontSize: 13 }}>{commarNumber(p?.product_sale_price || p?.product_price || 0)}원</span>
              </li>
            )}
            renderInput={(params) => (
              <TextField {...params} label="대표 상품 선택" placeholder="상품명으로 검색" />
            )}
          />
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button variant="contained" onClick={onSave} disabled={saving}>
              저장
            </Button>
          </Stack>
        </Card>
      </Container>
    </>
  );
};

FeaturedProductPage.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default FeaturedProductPage;
