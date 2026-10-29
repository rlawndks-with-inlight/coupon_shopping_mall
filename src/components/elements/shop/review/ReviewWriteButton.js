import PropTypes from 'prop-types';
import { useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { toast } from 'react-hot-toast';
import { apiManager } from 'src/utils/api';
import { useModal } from 'src/components/dialog/ModalProvider';
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
  guest: PropTypes.object,  // 비회원 주문조회에서: { buyer_phone, password }. 있으면 작성 뒤에도 이 자리에서 수정·삭제한다
};

export default function ReviewWriteButton({ line, onDone, sx, guest }) {
  const { translate } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const router = useRouter();
  const { setModal } = useModal();
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
        <ReviewWriteDialog open={open} onClose={() => setOpen(false)} line={line} onDone={onDone} guest={guest} />
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
    // 비회원은 상품 화면에서 '내 후기'를 알아볼 방법이 없다 — 이 자리에서 고치고(기간 안) 지운다.
    if (guest && line.review) {
      const canEdit = line.review.editable_until && new Date(line.review.editable_until).getTime() > Date.now();
      const remove = () => setModal({
        icon: 'material-symbols:delete-outline',
        title: translate('정말 삭제하시겠습니까?'),
        func: async () => {
          const ok = await apiManager(`product-reviews/guest/${line.review.id}/delete`, 'create', { guest });
          if (ok) { toast.success(translate('후기를 삭제했어요.')); onDone?.(); }
        },
      });
      return (
        <Stack direction="row" alignItems="center" spacing={0.5} sx={sx}>
          <Button variant="text" size="small" sx={{ whiteSpace: 'nowrap' }}
            onClick={() => router.push(productPath(themeDnsData, line.product_id))}>
            {translate('후기 작성 완료')}
          </Button>
          {canEdit && <Button variant="outlined" size="small" onClick={() => setOpen(true)}>{translate('수정')}</Button>}
          <Button variant="text" size="small" color="inherit" onClick={remove}>{translate('삭제')}</Button>
          <ReviewWriteDialog open={open} onClose={() => setOpen(false)} line={line} review={line.review} onDone={onDone} guest={guest} />
        </Stack>
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
