import PropTypes from 'prop-types';
import { useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useLocales } from 'src/locales';
import { useSettingsContext } from 'src/components/settings';
import { daysLeft, productPath } from 'src/utils/review';
import ReviewWriteDialog from './ReviewWriteDialog';

// 주문내역 한 줄의 후기 버튼. 상태는 서버 판정(product-reviews/writable)의 line 을 그대로 받는다.
//   writable → 「후기 쓰기」(+ 마감 7일 안이면 D-n)
//   written  → 「후기 작성 완료」(누르면 상품 후기로) / 취소·숨김이면 그 사유 한 줄
//   그 밖(아직·기한 지남·취소·미사용) → 아무것도 안 그린다. 버튼이 안 보이는 것이 곧 '지금은 못 쓴다'다.
ReviewWriteButton.propTypes = {
  line: PropTypes.object,
  onDone: PropTypes.func,
  sx: PropTypes.object,
};

export default function ReviewWriteButton({ line, onDone, sx }) {
  const { translate } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  if (!line) return null;

  if (line.state === 'writable') {
    const left = daysLeft(line.deadline);
    return (
      <Stack direction="row" alignItems="center" spacing={1} sx={sx}>
        <Button variant="outlined" size="small" onClick={() => setOpen(true)} sx={{ whiteSpace: 'nowrap' }}>
          {translate('후기 쓰기')}
        </Button>
        {left !== null && left <= 7 && (
          <Typography variant="caption" sx={{ color: 'error.main', whiteSpace: 'nowrap' }}>D-{left}</Typography>
        )}
        <ReviewWriteDialog open={open} onClose={() => setOpen(false)} line={line} onDone={onDone} />
      </Stack>
    );
  }
  if (line.state === 'written' || (line.state === 'canceled' && line.review_id)) {
    if (line.review_hidden) {
      return (
        <Typography variant="caption" sx={{ color: 'text.disabled', ...sx }}>
          {line.review_hidden === '주문 취소' ? translate('취소된 주문의 후기는 표시되지 않습니다.') : translate('숨김 처리된 후기입니다.')}
        </Typography>
      );
    }
    return (
      <Button variant="text" size="small" sx={{ whiteSpace: 'nowrap', ...sx }}
        onClick={() => router.push(productPath(themeDnsData, line.product_id))}>
        {translate('후기 작성 완료')}
      </Button>
    );
  }
  return null;
}
