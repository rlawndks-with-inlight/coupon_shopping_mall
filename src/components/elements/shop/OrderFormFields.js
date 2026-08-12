import { Card, CardContent, CardHeader, Checkbox, FormControlLabel, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { useLocales } from 'src/locales';
import { formatLang } from 'src/utils/format';
import { CHOICE_TYPES, DATE_TYPES, dateRange, parseOptionList } from 'src/data/order-form-types';

// 주문서 추가 입력항목 — 예약·출장 업체가 행사일·행사장소 등을 받는 칸.
//
// 본사가 서식을 만들고 적용 가맹점을 고르면, 그 몰의 주문서에만 이 카드가 뜬다.
// 서식이 없으면 아무것도 그리지 않는다 — 대부분의 몰은 이 카드가 없다.
//
// ⚠ 이 화면(OrderSheet)은 프레임 6개가 공용으로 쓰는 파일 하나다.
//   그래서 여기 한 곳만 고치면 6개 프레임에 다 반영된다. 상품상세에 넣었다면
//   6개 파일 + 장바구니까지 손봐야 했다.

// 날짜 입력은 브라우저 기본 달력(input[type=date])을 쓴다.
// min/max 를 주면 그 범위 밖 날짜는 **아예 고를 수 없다** — 준비 기간을 안내문이 아니라
// 달력으로 막는 것이 이 기능의 핵심이다. MUI DatePicker 를 쓰면 모바일에서 더 무겁고
// 라이브러리 날짜 객체를 오가야 해서 값 전달이 복잡해진다.
const ymd = (d) => (d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : undefined);

const OrderFormFields = ({ values, onChange }) => {
    const { themeDnsData } = useSettingsContext();
    const { translate, currentLang } = useLocales();
    const form = themeDnsData?.order_form;

    if (!(form?.fields?.length > 0)) return null;

    const 값 = values ?? {};
    const set = (id, v) => onChange?.({ ...값, [String(id)]: v });

    return (
        <Card sx={{ mb: 3 }}>
            <CardHeader
                title={translate('추가 입력 정보')}
                subheader={form?.guide ? formatLang(form, 'guide', currentLang) : translate('주문 준비를 위해 아래 내용을 알려주세요.')}
            />
            <CardContent>
                <Stack spacing={2.5}>
                    {form.fields.map((f) => {
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
                                    control={<Checkbox checked={v === true || v === 1 || v === '1'}
                                        onChange={(e) => set(f.id, e.target.checked)} />}
                                    label={
                                        <Stack>
                                            <Typography sx={{ fontSize: 14 }}>{f.is_required ? `${label} *` : label}</Typography>
                                            {help && <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{help}</Typography>}
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
            </CardContent>
        </Card>
    );
};

export default OrderFormFields;
