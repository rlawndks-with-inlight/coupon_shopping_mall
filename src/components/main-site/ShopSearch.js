import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Grid,
} from '@mui/material';
import { Icon } from '@iconify/react';
import axios from 'axios';

// 브랜드 포인트 (라임그린) — 랜딩과 동일 톤
const SG = {
  primary: '#a3e635',
  hover: '#84cc16',
  onPrimary: '#1a1a1a',
  text: '#111',
  subBg: '#fafaf7',
  gray: '#666',
};

const won = (v) => `${Number(v || 0).toLocaleString()}원`;

// 가맹점 상품 미니 카드
function ProductCard({ shopUrl, product }) {
  return (
    <Box
      component="a"
      href={`${shopUrl}/shop/item/${product.id}`}
      target="_blank"
      rel="noreferrer"
      sx={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        border: '1px solid #eee',
        borderRadius: 1.5,
        overflow: 'hidden',
        bgcolor: '#fff',
        transition: 'all 0.15s',
        '&:hover': { borderColor: SG.primary, transform: 'translateY(-2px)' },
      }}
    >
      <Box
        sx={{
          width: '100%',
          pt: '78%',
          position: 'relative',
          bgcolor: '#f3f4ef',
          backgroundImage: product.product_img ? `url(${product.product_img})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Box sx={{ p: 1 }}>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: SG.text,
            lineHeight: 1.35,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: 32,
          }}
        >
          {product.product_name}
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 800, color: SG.text, mt: 0.5 }}>
          {won(product.product_sale_price)}
        </Typography>
      </Box>
    </Box>
  );
}

// 가맹점 카드 (로고 + 이름 + 주소 + 방문 + 상품들)
function ShopCard({ shop }) {
  const shopUrl = `https://${shop.dns}`;
  return (
    <Box sx={{ p: { xs: 2, md: 2.5 }, bgcolor: '#fff', border: '1px solid #eee', borderRadius: 2 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        sx={{ mb: shop.products?.length ? 2 : 0 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 46,
              height: 46,
              flexShrink: 0,
              borderRadius: '50%',
              border: '1px solid #eee',
              bgcolor: SG.subBg,
              backgroundImage: shop.logo_img ? `url(${shop.logo_img})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {!shop.logo_img && (
              <Typography sx={{ fontWeight: 900, color: SG.gray }}>{(shop.name || '?').charAt(0)}</Typography>
            )}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 16, color: SG.text, lineHeight: 1.2, noWrap: true }} noWrap>
              {shop.name}
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#999' }} noWrap>
              {shop.dns}
            </Typography>
          </Box>
        </Stack>
        <Box
          component="a"
          href={shopUrl}
          target="_blank"
          rel="noreferrer"
          sx={{
            flexShrink: 0,
            textDecoration: 'none',
            bgcolor: SG.primary,
            color: SG.onPrimary,
            fontWeight: 800,
            fontSize: 13,
            px: 2,
            py: 0.9,
            borderRadius: 999,
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: SG.hover },
          }}
        >
          방문하기 →
        </Box>
      </Stack>

      {shop.products?.length > 0 && (
        <Grid container spacing={1}>
          {shop.products.map((p) => (
            <Grid item xs={4} sm={3} md={2} key={p.id}>
              <ProductCard shopUrl={shopUrl} product={p} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default function ShopSearch() {
  const [q, setQ] = useState('');
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const query = q.trim();
    // 부하 방지: 2글자 미만은 검색하지 않음
    if (query.length < 2) {
      setShops([]);
      setSearched(false);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const { data } = await axios.get(`/api/merchant-application/shops?q=${encodeURIComponent(query)}`);
        setShops(data?.data?.shops || []);
      } catch (e) {
        setShops([]);
      } finally {
        setLoading(false);
        setSearched(true);
      }
    }, 350);
    return () => timer.current && clearTimeout(timer.current);
  }, [q]);

  return (
    <Box
      id="find-shop"
      sx={{ py: { xs: 6, md: 9 }, bgcolor: SG.subBg, borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}
    >
      <Container maxWidth="md">
        <Stack spacing={1} textAlign="center" mb={3}>
          <Typography sx={{ fontSize: 12, letterSpacing: 4, color: SG.primary, fontWeight: 700 }}>FIND A SHOP</Typography>
          <Typography sx={{ fontSize: { xs: 22, md: 32 }, fontWeight: 900, letterSpacing: '-1px', color: SG.text }}>
            가맹점·상품 찾기
          </Typography>
        </Stack>

        <TextField
          fullWidth
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="가맹점명 · 주소 · 상품명으로 검색"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Icon icon="eva:search-fill" width={20} color={SG.gray} />
              </InputAdornment>
            ),
            endAdornment: loading ? (
              <InputAdornment position="end">
                <CircularProgress size={18} sx={{ color: SG.hover }} />
              </InputAdornment>
            ) : null,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 999,
              bgcolor: '#fff',
              fontSize: 16,
              '& fieldset': { borderColor: '#ddd' },
              '&:hover fieldset': { borderColor: SG.primary },
              '&.Mui-focused fieldset': { borderColor: SG.primary, borderWidth: 2 },
            },
          }}
        />

        <Box sx={{ mt: 3 }}>
          {q.trim().length === 1 && (
            <Typography sx={{ textAlign: 'center', color: SG.gray, py: 4 }}>
              2글자 이상 입력해 주세요.
            </Typography>
          )}
          {searched && !loading && shops.length === 0 && (
            <Typography sx={{ textAlign: 'center', color: SG.gray, py: 4 }}>
              검색 결과가 없습니다. 가맹점명 · 주소 · 상품명으로 검색해 보세요.
            </Typography>
          )}
          <Stack spacing={2}>
            {shops.map((s) => (
              <ShopCard key={s.dns} shop={s} />
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
