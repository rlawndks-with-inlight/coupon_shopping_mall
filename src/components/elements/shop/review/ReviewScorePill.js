import PropTypes from 'prop-types';
import { Box, Rating } from '@mui/material';
import { useLocales } from 'src/locales';
import { useSettingsContext } from 'src/components/settings';
import { isReviewEnabled } from 'src/utils/review';
import useReviewSummary from './useReviewSummary';

// 가격 옆 별점 알약 「★ 4.7 · 후기 6」 — 누르면 아래 후기 영역(id="product-reviews")으로 스르륵 내려간다.
// 후기 영역이 긴 상품 설명 아래에 놓인 프레임(6)에서, 살지 말지 고르는 자리에 별점이 보이게 하는 장치다.
// 네이버(가격 옆 「★4.7 · 리뷰 N」→리뷰로 이동)와 같은 방식. 후기가 0건이거나 꺼진 몰이면 아무것도 안 그린다.

ReviewScorePill.propTypes = {
  product: PropTypes.object,
  accent: PropTypes.string,
  sx: PropTypes.object,
};

export default function ReviewScorePill({ product, accent = '#ff8a80', sx }) {
  const { translate } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const enabled = isReviewEnabled(themeDnsData);
  const { summary } = useReviewSummary(product?.id, enabled);
  const count = Number(summary?.count) || 0;
  const avg = Number(summary?.avg) || 0;
  if (!enabled || count === 0) return null;

  const go = () => document.getElementById('product-reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return (
    <Box component="button" type="button" onClick={go} aria-label={translate('후기 보기')}
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.5, borderRadius: 999, border: '1px solid',
        borderColor: '#ffd9d9', bgcolor: '#fff0f0', color: accent, fontWeight: 800, fontSize: 14, cursor: 'pointer', font: 'inherit',
        '&:hover': { bgcolor: '#ffe4e4' }, ...sx }}>
      <Rating value={avg} precision={0.1} readOnly size="small" sx={{ color: accent }} />
      {avg.toFixed(1)}
      <Box component="span" sx={{ color: '#b98', fontWeight: 600, fontSize: 13 }}>· {translate('후기 {{n}}', { n: count })}</Box>
    </Box>
  );
}
