import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import {
  Box, Button, Checkbox, Collapse, Drawer, FormControlLabel, IconButton, LinearProgress, Rating, Stack,
  ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import Iconify from 'src/components/iconify/Iconify';
import Lightbox from 'src/components/lightbox';
import { useLocales } from 'src/locales';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useSettingsContext } from 'src/components/settings';
import { apiManager } from 'src/utils/api';
import { PointerText } from 'src/components/elements/styled-components';
import { isReviewEnabled, reviewSettings } from 'src/utils/review';
import useReviewSummary, { clearReviewSummary } from 'src/components/elements/shop/review/useReviewSummary';
import ReviewWriteDialog from 'src/components/elements/shop/review/ReviewWriteDialog';
import ProductDetailsReviewList from './ProductDetailsReviewList';

// 상품 상세의 후기 영역. 여섯 프레임이 이 하나를 쓰고 variant 로 옷만 갈아입는다(설계 §7.5).
//   full    프레임1·2  큰 평균 + 별점 분포 막대 + 사진 모아보기 + 정렬·필터 + 목록
//   compact 프레임3·4  「후기 N · ★4.7」 접이식 한 줄 → 좁은 폭용 목록(분포 막대 없음)
//   panel   프레임5    「REVIEWS N — 4.7」 한 줄 → 오른쪽에서 열리는 패널
//   pastel  프레임6    「⭐ Review」 섹션, 사진 캐러셀, 둥근 카드
//
// 데이터는 스스로 가져온다(요약은 useReviewSummary 로 60초 공유, 목록은 정렬·필터·쪽마다).
// 후기 0건이면 별점·평균을 그리지 않는다 — 빈 별점은 나쁜 상품처럼 보인다.
// 「후기 쓰기」는 서버에 '내가 쓸 수 있는 줄'을 물어(product-reviews/writable) 그 줄로 창을 연다.
// 구매·시점·기한은 서버가 판정한다 — 화면은 안내만 한다.

// 정렬. '도움순'(helpful_count)은 가맹점이 「도움돼요」 버튼을 켠 몰에서만 — 누를 게 없는데 정렬만 있으면 최신순과 같아 보여 헷갈린다.
const SORTS = [['latest', '최신순'], ['high', '별점 높은순'], ['low', '별점 낮은순']];
const SORT_HELPFUL = ['helpful', '도움순'];
const ACCENT = { full: undefined, compact: undefined, panel: '#111', pastel: '#ff8a80' };

ProductDetailsReview.propTypes = {
  product: PropTypes.object,
  variant: PropTypes.oneOf(['full', 'compact', 'panel', 'pastel']),
  defaultOpen: PropTypes.bool,
};

export default function ProductDetailsReview({ product, variant = 'full', defaultOpen = false }) {
  const { translate } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const { user } = useAuthContext();
  const router = useRouter();
  const enabled = isReviewEnabled(themeDnsData);
  const settings = reviewSettings(themeDnsData);
  const productId = product?.id;
  const { summary, refresh: refreshSummary } = useReviewSummary(productId, enabled);

  const [sort, setSort] = useState('latest');
  const [photoOnly, setPhotoOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [list, setList] = useState({ content: [], total: 0, page: 1, page_size: 10 });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(defaultOpen);           // compact 펼침 · panel 서랍
  const [write, setWrite] = useState({ open: false, line: null, review: null });
  const [lightbox, setLightbox] = useState({ open: false, slides: [], index: 0 });

  const load = useCallback(async () => {
    if (!enabled || !productId) return;
    setLoading(true);
    const data = await apiManager('product-reviews', 'list', { product_id: productId, page, page_size: 10, sort, photo_only: photoOnly ? 1 : 0 });
    setLoading(false);
    if (data) setList(data);
  }, [enabled, productId, page, sort, photoOnly]);

  useEffect(() => { load(); }, [load]);

  const reloadAll = useCallback(async () => {
    clearReviewSummary(productId);
    await Promise.all([load(), refreshSummary(true)]);
  }, [productId, load, refreshSummary]);

  // 「후기 쓰기」 — 로그인 → 내가 쓸 수 있는 이 상품의 주문 줄을 서버에 묻는다.
  const startWrite = async () => {
    if (!(user?.id > 0)) {
      toast.error(<PointerText onClick={() => router.push('/shop/auth/login')}>{translate('로그인을 해주세요.')}</PointerText>);
      return;
    }
    const res = await apiManager('product-reviews/writable', 'list', { product_id: productId });
    const lines = res?.lines ?? [];
    const line = lines.find((l) => l.state === 'writable');
    if (line) { setWrite({ open: true, line, review: null }); return; }
    // 못 쓰는 이유를 그대로 알린다(서버 문구는 사전에 있다).
    const reason = lines[0]?.reason || '구매한 회원만 후기를 쓸 수 있습니다.';
    toast.error(translate(reason));
  };
  const startEdit = (review) => setWrite({ open: true, line: { order_id: review.order_id, product_name: product?.product_name, product_img: product?.product_img, option_text: review.option_text }, review });
  const remove = async (review) => {
    const ok = await apiManager('product-reviews', 'delete', { id: review.id });
    if (ok) { toast.success(translate('후기를 삭제했어요.')); reloadAll(); }
  };
  const openPhoto = (images, index) => setLightbox({ open: true, slides: images.map((src) => ({ src })), index });
  // 「도움돼요」 — 회원만, 후기당 한 번, 다시 누르면 취소. 내 후기엔 버튼이 안 보인다(목록이 가린다). 서버가 다시 판정한다.
  const vote = async (review) => {
    if (!(user?.id > 0)) {
      toast.error(<PointerText onClick={() => router.push('/shop/auth/login')}>{translate('로그인을 해주세요.')}</PointerText>);
      return;
    }
    const on = Number(review?.voted) === 1 ? 0 : 1;
    const res = await apiManager(`product-reviews/${review.id}/helpful`, 'update', { on });
    if (!res) return;
    setList((l) => ({ ...l, content: (l?.content ?? []).map((r) => (r.id === review.id ? { ...r, voted: res.voted ?? on, helpful_count: res.helpful_count ?? r.helpful_count } : r)) }));
  };

  if (!enabled) return null;

  const count = Number(summary?.count) || 0;
  const avg = Number(summary?.avg) || 0;
  const accent = ACCENT[variant];
  const writeButton = (props = {}) => (
    <Button variant={variant === 'panel' ? 'contained' : 'outlined'} color="inherit" onClick={startWrite}
      startIcon={<Iconify icon="eva:edit-fill" />}
      sx={{ whiteSpace: 'nowrap', ...(variant === 'panel' ? { bgcolor: '#111', color: '#fff', borderRadius: 0, letterSpacing: 2, '&:hover': { bgcolor: '#333' } } : {}),
        ...(variant === 'pastel' ? { borderRadius: 999, borderColor: accent, color: accent, '&:hover': { borderColor: accent, bgcolor: '#fff0f0' } } : {}), ...props.sx }}>
      {translate('후기 쓰기')}
    </Button>
  );
  const empty = (
    <Stack alignItems="center" spacing={1.5} sx={{ py: 4, color: 'text.secondary' }}>
      <Typography variant="body2">{translate('아직 후기가 없습니다. 첫 후기를 남겨 주세요.')}</Typography>
      {writeButton()}
    </Stack>
  );
  const toolbar = count > 0 && (
    <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" sx={{ mt: 2.5, mb: 1.5, gap: 1 }}>
      <ToggleButtonGroup size="small" exclusive value={sort} onChange={(_, v) => { if (v) { setSort(v); setPage(1); } }}
        sx={variant === 'pastel' ? { '& .MuiToggleButton-root': { borderRadius: 999, px: 1.5, mx: 0.25, border: '1px solid #ffd9d9 !important' }, '& .Mui-selected': { bgcolor: '#fff0f0 !important', color: accent } } : undefined}>
        {(settings.use_helpful ? [...SORTS, SORT_HELPFUL] : SORTS).map(([v, label]) => (
          <ToggleButton key={v} value={v} sx={{ fontSize: 12, py: 0.5, ...(variant === 'panel' ? { borderRadius: 0, letterSpacing: 1 } : {}) }}>{translate(label)}</ToggleButton>
        ))}
      </ToggleButtonGroup>
      {(Number(summary?.photo_count) || 0) > 0 && (
        <FormControlLabel sx={{ mr: 0 }} control={<Checkbox size="small" checked={photoOnly} onChange={(e) => { setPhotoOnly(e.target.checked); setPage(1); }} sx={accent ? { color: accent, '&.Mui-checked': { color: accent } } : undefined} />}
          label={<Typography variant="body2">{translate('사진 후기만')}</Typography>} />
      )}
    </Stack>
  );
  const listNode = (
    <>
      {loading && <LinearProgress sx={{ my: 1 }} color="inherit" />}
      <ProductDetailsReviewList content={list?.content ?? []} variant={variant} user={user} total={list?.total} page={page} pageSize={list?.page_size}
        onPageChange={(n) => setPage(n)} onEdit={startEdit} onDelete={remove} onPhoto={openPhoto} onVote={settings.use_helpful ? vote : undefined}
        emptyText={count === 0 ? empty : <Typography variant="body2" sx={{ py: 3, color: 'text.secondary', textAlign: 'center' }}>{translate('조건에 맞는 후기가 없습니다.')}</Typography>} />
    </>
  );
  const photoStrip = (summary?.photos?.length ?? 0) > 0 && (
    <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
      {summary.photos.map((p, i) => (
        <Box key={p.url} component="img" src={p.url} alt="" loading="lazy" onClick={() => openPhoto(summary.photos.map((x) => x.url), i)}
          sx={{ width: variant === 'pastel' ? 96 : 80, height: variant === 'pastel' ? 96 : 80, flexShrink: 0, objectFit: 'cover', cursor: 'zoom-in',
            borderRadius: variant === 'pastel' ? '50%' : 1, border: '1px solid', borderColor: variant === 'pastel' ? '#ffd9d9' : 'divider' }} />
      ))}
    </Stack>
  );
  const dialogs = (
    <>
      <ReviewWriteDialog open={write.open} line={write.line} review={write.review} accent={accent}
        onClose={() => setWrite((w) => ({ ...w, open: false }))} onDone={reloadAll} />
      <Lightbox open={lightbox.open} close={() => setLightbox((l) => ({ ...l, open: false }))} slides={lightbox.slides} index={lightbox.index}
        disabledSlideshow disabledVideo disabledCaptions disabledThumbnails={lightbox.slides.length < 2} />
    </>
  );

  // ── full ────────────────────────────────────────────────────────────────
  if (variant === 'full') {
    return (
      <Box id="product-reviews">
        {count > 0 ? (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 4 }} alignItems={{ md: 'center' }} sx={{ py: 3 }}>
            <Stack alignItems="center" spacing={0.5} sx={{ minWidth: 160 }}>
              <Typography variant="h2" sx={{ lineHeight: 1 }}>{avg.toFixed(1)}</Typography>
              <Rating value={avg} precision={0.1} readOnly />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {translate('후기 {{n}}', { n: count })}{summary?.photo_count ? ` · ${translate('사진 {{n}}', { n: summary.photo_count })}` : ''}
              </Typography>
            </Stack>
            <Stack spacing={0.5} sx={{ flex: 1, px: { md: 3 }, borderLeft: { md: '1px dashed' }, borderRight: { md: '1px dashed' }, borderColor: { md: 'divider' } }}>
              {[5, 4, 3, 2, 1].map((s) => {
                const n = Number(summary?.distribution?.[s]) || 0;
                return (
                  <Stack key={s} direction="row" alignItems="center" spacing={1.5}>
                    <Typography variant="caption" sx={{ width: 28, textAlign: 'right' }}>{s}{translate('점')}</Typography>
                    <LinearProgress variant="determinate" value={count ? (n / count) * 100 : 0} color="inherit" sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: 'action.hover', color: '#e8a317' }} />
                    <Typography variant="caption" sx={{ width: 32, color: 'text.secondary' }}>{n}</Typography>
                  </Stack>
                );
              })}
            </Stack>
            <Stack alignItems="center" spacing={0.5}>{writeButton()}<Typography variant="caption" sx={{ color: 'text.disabled' }}>{translate('구매한 회원만 쓸 수 있어요')}</Typography></Stack>
          </Stack>
        ) : empty}
        {photoStrip && <Stack spacing={0.5}><Typography variant="subtitle2">{translate('사진 모아보기')}</Typography>{photoStrip}</Stack>}
        {toolbar}
        {count > 0 && listNode}
        {dialogs}
      </Box>
    );
  }

  // ── compact (프레임3·4) ──────────────────────────────────────────────────
  if (variant === 'compact') {
    return (
      <Box id="product-reviews" sx={{ borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', mt: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1.5, cursor: 'pointer' }} onClick={() => setOpen((v) => !v)}>
          <Typography sx={{ fontWeight: 700 }}>
            {translate('후기')} {count}{count > 0 ? <Box component="span" sx={{ ml: 1, color: '#e8a317', fontWeight: 800 }}>★ {avg.toFixed(1)}</Box> : null}
          </Typography>
          <Iconify icon={open ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'} width={20} />
        </Stack>
        <Collapse in={open} unmountOnExit>
          <Box sx={{ pb: 2 }}>
            {count > 0 && <Stack direction="row" justifyContent="flex-end">{writeButton({ sx: { mb: 0.5 } })}</Stack>}
            {toolbar}
            {listNode}
          </Box>
        </Collapse>
        {dialogs}
      </Box>
    );
  }

  // ── panel (프레임5) ──────────────────────────────────────────────────────
  if (variant === 'panel') {
    return (
      <>
        <Box id="product-reviews" onClick={() => setOpen(true)} sx={{ mt: 2, py: 1.5, borderTop: '1px solid #000', borderBottom: '1px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
          <Typography sx={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700 }}>
            Reviews {count}{count > 0 ? ` — ${avg.toFixed(1)}` : ''}
          </Typography>
          <Typography sx={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' }}>{count > 0 ? 'Read →' : 'Write →'}</Typography>
        </Box>
        <Drawer anchor="right" open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 460 }, p: { xs: 2, sm: 3 }, bgcolor: '#fff', color: '#111' } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', fontWeight: 700 }}>Reviews</Typography>
            <IconButton onClick={() => setOpen(false)} size="small"><Iconify icon="eva:close-fill" /></IconButton>
          </Stack>
          {count > 0 && (
            <Stack direction="row" alignItems="baseline" spacing={1.5} sx={{ borderBottom: '1px solid #000', pb: 2 }}>
              <Typography sx={{ fontSize: 40, fontWeight: 900, lineHeight: 1 }}>{avg.toFixed(1)}</Typography>
              <Typography sx={{ fontSize: 12, letterSpacing: 2 }}>/ 5 · {count}</Typography>
            </Stack>
          )}
          {photoStrip}
          {toolbar}
          {listNode}
          <Box sx={{ mt: 2 }}>{count > 0 && writeButton({ sx: { width: '100%' } })}</Box>
        </Drawer>
        {dialogs}
      </>
    );
  }

  // ── pastel (프레임6) ─────────────────────────────────────────────────────
  return (
    <Box id="product-reviews" sx={{ px: { xs: 1.25, md: 2 }, py: { xs: 3, md: 5 }, bgcolor: '#fff', maxWidth: 720, mx: 'auto', scrollMarginTop: 96 }}>
      <Typography component="h2" sx={{ fontSize: { xs: 26, md: 36 }, fontWeight: 900, textAlign: 'center', letterSpacing: '-1px', m: 0, mb: 2.5 }}>⭐ Review</Typography>
      {count > 0 ? (
        <Stack alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2.5, py: 0.75, borderRadius: 999, bgcolor: '#fff0f0', color: accent, fontWeight: 800, fontSize: 18 }}>
            {avg.toFixed(1)} <Rating value={avg} precision={0.1} readOnly size="small" sx={{ color: accent }} /> · {count}
          </Box>
          {writeButton()}
        </Stack>
      ) : empty}
      {photoStrip}
      {toolbar}
      {count > 0 && listNode}
      {dialogs}
    </Box>
  );
}
