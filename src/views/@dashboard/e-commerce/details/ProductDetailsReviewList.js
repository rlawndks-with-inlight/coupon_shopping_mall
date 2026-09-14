import PropTypes from 'prop-types';
import { useState } from 'react';
import { Box, Button, Chip, IconButton, Pagination, Rating, Stack, Typography } from '@mui/material';
import Iconify from 'src/components/iconify/Iconify';
import { useLocales } from 'src/locales';
import { useModal } from 'src/components/dialog/ModalProvider';
import { dateOnly } from 'src/utils/review';

// 후기 목록 — 여섯 프레임이 같은 항목을 그린다. variant 는 톤(색·둥글기·글자)만 바꾼다(설계 §7.5).
//   full    프레임1·2  기본
//   compact 프레임3·4  좁은 폭: 왼쪽 썸네일 + 두 줄
//   panel   프레임5    흑백·인용문처럼 큰 본문·얇은 선·별 없이 숫자
//   pastel  프레임6    둥근 카드·핑크 별

const TONES = {
  full: { star: undefined, radius: 0, border: '1px solid', borderColor: 'divider', px: 0, py: 3, bg: 'transparent' },
  compact: { star: undefined, radius: 0, border: '1px solid', borderColor: 'divider', px: 0, py: 1.75, bg: 'transparent' },
  panel: { star: '#111', radius: 0, border: '1px solid', borderColor: '#111', px: 0, py: 3, bg: 'transparent' },
  pastel: { star: '#ff8a80', radius: 3, border: '1px solid', borderColor: '#ffd9d9', px: 2, py: 2, bg: '#fff' },
};

const LONG = 220;

ReviewItem.propTypes = { review: PropTypes.object };
function ReviewItem({ review, variant, own, canEdit, onEdit, onDelete, onPhoto, onVote }) {
  const { translate } = useLocales();
  const { setModal } = useModal();
  const [expanded, setExpanded] = useState(false);
  const t = TONES[variant] || TONES.full;
  const text = String(review?.content ?? '');
  const long = text.length > LONG;
  const shown = long && !expanded ? text.slice(0, LONG) + '…' : text;
  const images = Array.isArray(review?.images) ? review.images : [];
  const thumb = variant === 'compact' ? 56 : 72;
  const voted = Number(review?.voted) === 1;
  const helpful = Number(review?.helpful_count) || 0;

  const stars = variant === 'panel'
    ? <Typography sx={{ fontSize: 12, letterSpacing: 2, fontWeight: 700 }}>★ {review?.scope} / 5</Typography>
    : <Rating value={Number(review?.scope) || 0} precision={1} readOnly size="small" sx={t.star ? { color: t.star } : undefined} />;

  const photos = images.length > 0 && (
    <Stack direction="row" flexWrap="wrap" sx={{ gap: 0.75, mt: variant === 'compact' ? 0 : 1 }}>
      {images.map((url, i) => (
        <Box key={url + i} component="img" src={url} alt="" loading="lazy" onClick={() => onPhoto?.(images, i)}
          sx={{ width: thumb, height: thumb, objectFit: 'cover', borderRadius: variant === 'pastel' ? 2 : 1, cursor: 'zoom-in', border: '1px solid', borderColor: 'divider' }} />
      ))}
    </Stack>
  );

  return (
    <Box sx={{ borderTop: variant === 'pastel' ? 'none' : t.border, borderColor: t.borderColor, border: variant === 'pastel' ? t.border : undefined,
      borderRadius: t.radius, px: t.px, py: t.py, bgcolor: t.bg, mb: variant === 'pastel' ? 1.5 : 0 }}>
      <Stack direction={variant === 'compact' && images.length ? 'row' : 'column'} spacing={variant === 'compact' ? 1.5 : 0.75}>
        {variant === 'compact' && images.length > 0 && (
          <Box component="img" src={images[0]} alt="" loading="lazy" onClick={() => onPhoto?.(images, 0)}
            sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 1, cursor: 'zoom-in', flexShrink: 0 }} />
        )}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
            {Number(review?.is_best) === 1 && <Chip label="BEST" size="small" color={variant === 'pastel' ? 'error' : 'default'}
              sx={{ height: 20, fontWeight: 800, fontSize: 11, ...(variant === 'panel' ? { bgcolor: '#111', color: '#fff', borderRadius: 0 } : {}) }} />}
            {stars}
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {review?.writer}{review?.created_at ? ` · ${dateOnly(review.created_at)}` : ''}
            </Typography>
            {review?.option_text && (
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>{translate('구매 옵션')}: {review.option_text}</Typography>
            )}
          </Stack>
          <Typography variant="body2" sx={{ mt: 0.75, whiteSpace: 'pre-line', wordBreak: 'break-word',
            ...(variant === 'panel' ? { fontSize: 15, lineHeight: 1.9 } : {}) }}>
            {shown}
            {long && (
              <Button size="small" onClick={() => setExpanded((v) => !v)} sx={{ ml: 0.5, minWidth: 0, p: 0, fontSize: 12, verticalAlign: 'baseline' }}>
                {translate(expanded ? '접기' : '더보기')}
              </Button>
            )}
          </Typography>
          {variant !== 'compact' && photos}
          {variant === 'compact' && images.length > 1 && photos}
          {review?.reply_content && (
            <Box sx={{ mt: 1.25, p: 1.25, borderRadius: variant === 'pastel' ? 2 : 1, bgcolor: variant === 'panel' ? '#f4f4f4' : 'action.hover' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {translate('판매자 답글')}{review?.replied_at ? ` · ${dateOnly(review.replied_at)}` : ''}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 0.25 }}>{review.reply_content}</Typography>
            </Box>
          )}
          {/* 「도움돼요」 — 남의 후기에만. 내 후기는 받은 수만 보여 준다. 가맹점이 껐으면 onVote 가 없다. */}
          {onVote && !own && (
            <Button size="small" color="inherit" variant={voted ? 'contained' : 'outlined'} onClick={() => onVote(review)}
              startIcon={<Iconify icon={voted ? 'material-symbols:thumb-up' : 'material-symbols:thumb-up-outline'} width={16} />}
              sx={{ mt: 1.25, minWidth: 0, px: 1.25, py: 0.25, fontSize: 12, fontWeight: 600,
                borderRadius: variant === 'pastel' ? 999 : variant === 'panel' ? 0 : 1, ...(variant === 'panel' ? { letterSpacing: 1 } : {}),
                ...(voted ? { bgcolor: t.star || '#333', color: '#fff', borderColor: t.star || '#333', '&:hover': { bgcolor: t.star || '#333' } } : { borderColor: 'divider', color: 'text.secondary' }) }}>
              {translate('도움돼요')}{helpful > 0 ? ` ${helpful}` : ''}
            </Button>
          )}
          {onVote && own && helpful > 0 && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
              <Iconify icon="material-symbols:thumb-up-outline" width={14} sx={{ verticalAlign: '-2px', mr: 0.5 }} />{translate('도움돼요')} {helpful}
            </Typography>
          )}
          {own && (
            <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
              {canEdit && (
                <IconButton size="small" onClick={() => onEdit?.(review)} aria-label={translate('후기 수정')}>
                  <Iconify icon="material-symbols:edit-outline" width={18} />
                </IconButton>
              )}
              <IconButton size="small" aria-label={translate('삭제')} onClick={() => setModal({
                func: () => { onDelete?.(review); },
                icon: 'material-symbols:delete-outline',
                title: translate('정말 삭제하시겠습니까?'),
              })}>
                <Iconify icon="material-symbols:delete-outline" width={18} />
              </IconButton>
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

ProductDetailsReviewList.propTypes = {
  content: PropTypes.array,
  variant: PropTypes.string,
  user: PropTypes.object,
  total: PropTypes.number,
  page: PropTypes.number,
  pageSize: PropTypes.number,
  onPageChange: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onPhoto: PropTypes.func,
  onVote: PropTypes.func,
  emptyText: PropTypes.node,
};

export default function ProductDetailsReviewList({ content = [], variant = 'full', user, total = 0, page = 1, pageSize = 10, onPageChange, onEdit, onDelete, onPhoto, onVote, emptyText }) {
  const pages = Math.max(1, Math.ceil((Number(total) || 0) / (Number(pageSize) || 10)));
  const now = Date.now();
  return (
    <>
      {content.length === 0 && emptyText}
      {content.map((review) => {
        const own = user?.id > 0 && Number(review?.user_id) === Number(user.id);
        const canEdit = own && review?.editable_until && new Date(review.editable_until).getTime() > now;
        return <ReviewItem key={review.id} review={review} variant={variant} own={own} canEdit={!!canEdit} onEdit={onEdit} onDelete={onDelete} onPhoto={onPhoto} onVote={onVote} />;
      })}
      {pages > 1 && (
        <Stack alignItems="center" sx={{ my: 2.5 }}>
          <Pagination count={pages} page={Number(page) || 1} onChange={(_, n) => onPageChange?.(n)}
            shape={variant === 'pastel' ? 'rounded' : 'circular'} size={variant === 'compact' ? 'small' : 'medium'} />
        </Stack>
      )}
    </>
  );
}
