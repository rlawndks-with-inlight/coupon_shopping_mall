import { Button } from '@mui/material';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useModal } from 'src/components/dialog/ModalProvider';
import { useLocales } from 'src/locales';
import { apiManager } from 'src/utils/api';

// 주문취소 요청 버튼 — 공용.
//
// 쇼핑몰형(프레임1·2·3)의 주문내역에는 취소요청이 있는데
// 블로그형(프레임4~11)의 주문내역에는 취소 관련 코드가 아예 없었다.
// 그 프레임 고객은 주문을 취소할 수단이 화면에 없어 전화로만 가능했다.
//
// 뷰 5개에 각각 심으면 판정 조건이 곧 어긋나므로 한 곳에 모은다.
// 취소 가능 상태는 백엔드 cancelRequest 의 CANCELABLE_STATUS 와 반드시 같은 값을 유지할 것.
//   0=결제대기, 5=결제완료, 10=입고 까지만. 출고(15) 이후는 취소가 아니라 반품 절차다.
const CANCELABLE_STATUS = [0, 5, 10];

export const canCancelOrder = (trx) => (
  trx?.is_cancel != 1
  && trx?.is_cancel_trans != 1
  && trx?.trx_status != 1          // 이미 취소요청됨
  && CANCELABLE_STATUS.includes(Number(trx?.trx_status))
);

const OrderCancelButton = ({ trx, onDone, sx, variant = 'outlined' }) => {
  const { translate } = useLocales();
  const { setModal } = useModal();
  const [loading, setLoading] = useState(false);

  if (!canCancelOrder(trx)) return null;

  const request = async () => {
    setLoading(true);
    try {
      const result = await apiManager(`transactions/${trx?.id}/cancel-request`, 'create');
      if (result) {
        toast.success(translate('취소요청이 완료되었습니다.'));
        if (onDone) await onDone();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      color="error"
      disabled={loading}
      sx={sx}
      onClick={() => {
        setModal({
          func: request,
          icon: 'material-symbols:cancel-outline',
          title: '주문을 취소요청 하시겠습니까?',
        });
      }}
    >
      {translate('취소요청')}
    </Button>
  );
};

export default OrderCancelButton;
