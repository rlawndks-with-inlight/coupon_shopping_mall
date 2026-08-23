import { useState } from 'react';
import styled from 'styled-components';
import { useLocales } from 'src/locales';

// 블로그형 프레임(6~11) 상품상세용 수량 스테퍼.
//
// 이 프레임들에는 수량 UI 가 아예 없어서 selectProductGroups.count 가 1 에서 움직이지
// 않았다 — 즉 **한 번에 한 개밖에 살 수 없었다**(담기/바로구매 모두 order_count:1 로 나감).
//
// 프레임마다 디자인 언어가 달라서(모노크롬·에디토리얼·팝) 색을 직접 정하지 않는다.
// 테두리·글자색은 currentColor 를 따라가고 폰트도 상속하므로 부모 색만 맞으면 자연히 녹아든다.
// 더 손보고 싶으면 styled(QuantityStepper) 로 감싸면 된다(className 을 그대로 넘긴다).

const Box = styled.div`
  display: inline-flex;
  align-items: center;
  border: 1px solid currentColor;
  user-select: none;
`
const Step = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  &:disabled { opacity: 0.3; cursor: default; }
`
const Field = styled.input`
  width: 44px;
  height: 40px;
  border: 0;
  border-left: 1px solid currentColor;
  border-right: 1px solid currentColor;
  background: none;
  color: inherit;
  font: inherit;
  /* ⚠ 16px 아래로 내리지 말 것.
     iOS 사파리는 글자가 16px 미만인 입력칸을 누르면 화면을 자동으로 확대한다.
     확대된 뒤 저절로 돌아오지 않아서, 손님은 가로로 밀린 화면에서 나머지를 채우게 된다.
     예전 값이 14px 이었다(프레임5 상품상세에서 실제로 확대가 걸렸다). */
  font-size: 16px;
  text-align: center;
  &:focus { outline: none; }
  /* 스피너는 스테퍼 버튼과 겹쳐 보이므로 숨긴다 */
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button, &::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
`

const MAX = 999;

const QuantityStepper = ({ value = 1, onChange, max = MAX, className }) => {
  const { translate } = useLocales();
  // 입력 중인 글자는 그대로 보여주되(지웠다 다시 치는 동안 숫자가 튀지 않게)
  // 상위에는 유효한 수량일 때만 올린다. 빈칸이 0 으로 올라가면 결제금액이 0원이 된다.
  const [text, setText] = useState(String(value));

  const commit = (next) => {
    const clamped = Math.min(Math.max(1, next), max);
    setText(String(clamped));
    if (onChange) onChange(clamped);
    return clamped;
  };

  return (
    <Box className={className}>
      <Step type="button" aria-label={translate('수량 줄이기')} disabled={value <= 1} onClick={() => commit(value - 1)}>−</Step>
      <Field
        type="number"
        inputMode="numeric"
        aria-label={translate('수량')}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const parsed = parseInt(e.target.value, 10);
          if (Number.isFinite(parsed) && parsed >= 1) {
            if (onChange) onChange(Math.min(parsed, max));
          }
        }}
        // 비운 채로 벗어나면 1 로 되돌린다.
        onBlur={() => commit(parseInt(text, 10) || 1)}
      />
      <Step type="button" aria-label={translate('수량 늘리기')} disabled={value >= max} onClick={() => commit(value + 1)}>+</Step>
    </Box>
  );
};

export default QuantityStepper;
