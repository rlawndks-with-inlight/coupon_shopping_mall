import PropTypes from 'prop-types';
import { Button, FormControl, InputAdornment, OutlinedInput, Stack, Typography } from '@mui/material';
import { Col } from 'src/components/elements/styled-components';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { commarNumber, getPriceUnitByLang } from 'src/utils/function';
import { useLocales } from 'src/locales';
import { 포인트쓰는몰, 포인트사용상한, 적립예정 } from 'src/data/point-policy';

// 주문서의 「사용할 포인트」 입력칸.
//
// [왜 따로 떼어 냈나 — 2026-09-11 사장님 결정]
// 주문서 구성을 PC 와 휴대폰으로 나눴다. PC 는 장바구니처럼 오른쪽 상자(금액·포인트·결제하기),
// 휴대폰은 오른쪽 상자를 숨기고 이 칸만 결제수단 **위** 로 올린다 — 포인트를 쓰면 총 결제금액이 바뀌므로
// 결제수단을 고르기 전에 정해야 맞다(예전 휴대폰에서는 결제수단 목록 아래, 페이지 맨 끝에 있었다).
// 두 자리가 같은 칸을 쓰도록 여기로 옮겼다. 값은 payData.use_point 하나라 어느 쪽에서 넣어도 같다.
//
// 회원이 아니거나 포인트를 안 쓰는 몰이면 아무것도 그리지 않는다.
//
// 상한과 '왜 못 쓰는지'는 공용 규칙(data/point-policy.js)이 정한다.
// 예전엔 보유·최대설정·주문금액 세 값만 봤다. 그래서 가맹점이 설정해 둔
// '포인트 사용가능 최소 주문금액'·'사용 가능 최소 적립 포인트' 조건이 화면에 반영되지
// 않았고, 입력은 되는데 제출에서 막히는(주문서 검사) 어긋남이 났다.

CheckoutPointField.propTypes = {
  themeDnsData: PropTypes.object,
  payData: PropTypes.object,
  setPayData: PropTypes.func,
  total: PropTypes.number,      // 화면에 뜬 총 결제금액(포인트 차감 후)
  withLabel: PropTypes.bool,    // 왼쪽에 「사용할 포인트」 글자를 붙일지(카드 제목으로 쓸 때는 끈다)
};

export default function CheckoutPointField({ themeDnsData, payData, setPayData, total = 0, withLabel = true }) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  if (!user || !포인트쓰는몰(themeDnsData)) return null;

  // 기준금액은 화면에 뜬 '총 결제금액'에 지금 입력된 포인트를 도로 더해서 얻는다.
  // calcOrderTotals 가 amount = 상품가 + 배송비 - 포인트 로 계산하므로 이러면
  // 배송비 정책(브랜드 일괄/상품별)을 여기서 다시 해석하지 않고도 정확히 되돌아온다.
  //
  // 예전엔 보유 포인트와 '최대사용가능 포인트'만 봤다. 주문금액은 보지 않아서,
  // 주문금액보다 큰 포인트를 넣을 수 있었고 '총 결제금액'이 음수로 표시된 뒤
  // 결제 시점에 서버 금액검증에서 거절됐다(고객은 이유를 알 수 없다).
  const currentUsedPoint = Math.max(0, parseInt(payData?.use_point) || 0);
  const payableBeforePoint = Math.max(0, (parseFloat(total) || 0) + currentUsedPoint);
  const { 상한: pointCap, 이유: 사용불가이유, 기준: 사용불가기준, 단위: 사용불가단위 } =
    포인트사용상한({ dns: themeDnsData, 보유: user?.point, 주문금액: payableBeforePoint });
  // 이번 주문으로 쌓일 포인트. 포인트로 깎은 뒤의 결제금액을 기준으로 센다.
  const 적립예정포인트 = 적립예정({ dns: themeDnsData, 결제금액: total });
  // '전체사용': 지금 실제로 쓸 수 있는 상한만큼 채운다.
  const handleUseAllPoint = () => setPayData({ ...payData, use_point: pointCap });

  const 칸 = (
    <Col>
      <FormControl variant="outlined" size='small' sx={{ maxWidth: '170px', paddingRight: '0' }}>
        <OutlinedInput
          disabled={pointCap <= 0}
          error={parseFloat(payData?.use_point) > pointCap}
          value={payData?.use_point ?? 0}
          type='number'
          inputProps={{ min: 0, max: pointCap }}
          sx={{ paddingRight: '8px' }}
          endAdornment={<>
            <InputAdornment position="end">P</InputAdornment>
            <Button size='small' onClick={handleUseAllPoint}>
              {translate('전체사용')}
            </Button>
          </>}
          onChange={(e) => {
            // 상한을 넘겨 입력하면 그 자리에서 상한으로 깎는다.
            // (그냥 두면 총 결제금액이 음수로 뜨고 결제 시점에 서버가 거절한다)
            const raw = e.target.value;
            if (raw === '') {
              setPayData({ ...payData, use_point: '' });
              return;
            }
            const num = Math.max(0, parseInt(raw) || 0);
            setPayData({
              ...payData,
              use_point: Math.min(num, pointCap),
            });
          }} />
      </FormControl>
      {/* '잔여'는 쓰고 남은 것으로 읽히는데 이 값은 입력해도 줄지 않는다 — 보유가 맞다. */}
      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
        {translate('보유 포인트')} ({commarNumber(user?.point ?? 0)}P)
      </Typography>
      {/* 설정값이 아니라 '이번 주문에서 실제로 쓸 수 있는 값'이다.
          보유 500P 인 사람에게 설정값 10,000P 를 알려 주면 그게 더 헷갈린다. */}
      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
        {translate('이번 주문에 사용 가능')} ({commarNumber(pointCap)}P)
      </Typography>
      {/* 못 쓸 때는 조건을 알려 준다 — 그냥 0 으로 두면 고장으로 읽힌다. */}
      {사용불가이유 &&
        <Typography variant="body2" sx={{ color: 'warning.main', fontSize: '12px' }}>
          {translate(사용불가이유)}
          {/* 꼬리도 번역한다 — 예전엔 「이상」 과 「원」 이 한국어로 박혀 영어 화면에도 그대로 나왔다 */}
          {사용불가기준 > 0 && ` (${translate('{{n}} 이상', { n: commarNumber(사용불가기준) + (사용불가단위 === '원' ? getPriceUnitByLang() : 사용불가단위) })})`}
        </Typography>}
      {적립예정포인트 > 0 &&
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
          {translate('이번 주문 적립예정')} ({commarNumber(적립예정포인트)}P)
        </Typography>}
    </Col>
  );

  if (!withLabel) return 칸;
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {translate('사용할 포인트')}
      </Typography>
      {칸}
    </Stack>
  );
}
