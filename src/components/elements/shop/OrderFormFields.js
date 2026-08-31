import { Box, Checkbox, FormControlLabel, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { getOrderFormFields } from 'src/utils/shop-util';
import { useLocales } from 'src/locales';
import { formatLang } from 'src/utils/format';
import { CHOICE_TYPES, DATE_TYPES, dateRange, parseOptionList } from 'src/data/order-form-types';

// 주문 추가 입력항목 — 예약·출장 업체가 행사일·행사장소 등을 받는 칸.
//
// **상품상세에서** 받는다(네이버 스마트스토어의 '구매자 작성형 옵션'과 같은 자리).
// 처음에는 주문서에서 한 번만 받게 만들었는데 세 가지가 걸렸다:
//   · 예약 아닌 상품만 산 고객에게도 행사일을 물었다
//   · 날짜가 다른 두 상품을 담아도 날짜를 하나밖에 못 받았다
//   · 담기 전에 물어야 하는데 결제 직전에 물었다
// 그래서 상품상세로 옮기고 값도 장바구니 줄에 붙인다.
//
// 항목은 **가맹점이 상품마다** 건다(마스터가 만든 템플릿을 불러올 수도 있다).
// 걸린 항목이 없으면 아무것도 그리지 않는다 — 대부분의 상품은 이 칸이 없다.
//
// 예전엔 가맹점 단위로 서식 하나를 걸어 그 몰의 모든 상품에 같은 칸이 떴다.
// 행사날짜는 가맹점의 성질이 아니라 상품의 성질이다 —
// 같은 몰에서 답례품만 사는 손님에게 행사날짜를 물으면 안 된다.
//
// ⚠ 이 컴포넌트는 프레임 6개 상품상세에 그대로 들어간다.
//   색·글자크기를 스스로 정하지 않는다(어두운 프레임에서 글자가 사라진다).
//   라벨·도움말만 그리고 나머지는 MUI 기본을 따른다.

// 날짜는 브라우저 기본 달력(input[type=date])을 쓴다.
// min/max 를 주면 그 범위 밖은 **아예 못 고른다** — 준비 기간을 안내문이 아니라 달력으로 막는 것이
// 이 기능의 핵심이다. 네이버는 이 항목이 텍스트라 "월/일/요일 형식으로 적어주세요"라고 부탁만 한다.
const ymd = (d) => (d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : undefined);

const OrderFormFields = ({ product, values, onChange, sx = {} }) => {
    const { translate, currentLang } = useLocales();
    // ⚠ 예전엔 여기서 product.order_form_fields 를 직접 읽었다. 그래서 본사가 이 기능을
    //   꺼도 손님 화면에는 계속 떴다(상품에 값이 남아 있으므로). 공용 헬퍼를 쓴다 —
    //   getOrderFormFields 가 브랜드 설정(is_use_order_form)을 함께 본다.
    const fields = getOrderFormFields(product);

    if (!fields.length) return null;

    const 값 = values ?? {};
    const set = (id, v) => onChange?.({ ...값, [String(id)]: v });

    return (
        <Box sx={{ width: '100%', ...sx }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 1 }}>
                {translate('추가 입력 정보')}
            </Typography>
            <Stack spacing={2}>
                {fields.map((f) => {
                    const key = String(f.id);
                    const v = 값[key] ?? (f.field_type === 'multiselect' ? [] : '');
                    const label = formatLang(f, 'label', currentLang);
                    const help = f?.placeholder ? formatLang(f, 'placeholder', currentLang) : '';
                    const 공통 = {
                        label: f.is_required ? `${label} *` : label,
                        helperText: help,
                        fullWidth: true,
                        size: 'small',
                    };

                    if (f.field_type === 'agree') {
                        return (
                            <FormControlLabel
                                key={key}
                                control={<Checkbox size="small" checked={v === true || v === 1 || v === '1'}
                                    onChange={(e) => set(f.id, e.target.checked)} />}
                                label={
                                    <Stack>
                                        <Typography sx={{ fontSize: 13 }}>{f.is_required ? `${label} *` : label}</Typography>
                                        {help && <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{help}</Typography>}
                                    </Stack>
                                }
                            />
                        );
                    }

                    if (CHOICE_TYPES.includes(f.field_type)) {
                        const 보기 = parseOptionList(f.option_list);
                        const 복수 = f.field_type === 'multiselect';
                        return (
                            <TextField
                                key={key} {...공통} select
                                SelectProps={{ multiple: 복수 }}
                                value={복수 ? (Array.isArray(v) ? v : []) : v}
                                onChange={(e) => set(f.id, e.target.value)}
                            >
                                {보기.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </TextField>
                        );
                    }

                    if (DATE_TYPES.includes(f.field_type)) {
                        const { min, max } = dateRange(f);
                        const 날짜시간 = f.field_type === 'datetime';
                        return (
                            <TextField
                                key={key} {...공통}
                                type={날짜시간 ? 'datetime-local' : 'date'}
                                value={v}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{
                                    min: 날짜시간 ? `${ymd(min)}T00:00` : ymd(min),
                                    ...(max ? { max: 날짜시간 ? `${ymd(max)}T23:59` : ymd(max) } : {}),
                                }}
                                onChange={(e) => set(f.id, e.target.value)}
                            />
                        );
                    }

                    const type =
                        f.field_type === 'number' ? 'number'
                            : f.field_type === 'time' ? 'time'
                                : f.field_type === 'tel' ? 'tel'
                                    : 'text';

                    return (
                        <TextField
                            key={key} {...공통}
                            type={type}
                            value={v}
                            multiline={f.field_type === 'textarea'}
                            minRows={f.field_type === 'textarea' ? 3 : undefined}
                            InputLabelProps={f.field_type === 'time' ? { shrink: true } : undefined}
                            inputProps={{
                                ...(f.max_length > 0 ? { maxLength: Number(f.max_length) } : {}),
                                ...(f.field_type === 'number' && f.min_number !== null ? { min: f.min_number } : {}),
                                ...(f.field_type === 'number' && f.max_number !== null ? { max: f.max_number } : {}),
                            }}
                            onChange={(e) => set(f.id, e.target.value)}
                        />
                    );
                })}
            </Stack>
        </Box>
    );
};

export default OrderFormFields;
