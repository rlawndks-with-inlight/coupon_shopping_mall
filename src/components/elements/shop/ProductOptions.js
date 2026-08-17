import { Box, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useLocales } from 'src/locales';
import { formatLang } from 'src/utils/format';
import { commarNumber } from 'src/utils/function';
import ProductAddons from './ProductAddons';
import {
    addonGroups, findCombination, isComboMode, isOptionSoldOut,
    isSameGroup, lowStockCount, pickedRequiredOptionIds, requiredGroups, selectableOptionIds,
} from 'src/data/product-options';

// 상품 옵션 선택 — 선택옵션 · 추가상품 · 조합형.
//
// ⚠ 프레임 6개 상품상세가 **전부 이 컴포넌트 하나**를 쓴다.
//   예전에는 프레임마다 옵션 UI 를 따로 그렸고, 그 결과
//     · 프레임2 는 옵션그룹을 아예 안 그려서 옵션 있는 상품을 살 수 없었고
//     · 특성(characters)을 프레임2 는 필수 선택 버튼으로, 프레임3·5·6 은 정보표로 그렸다
//   같은 상품이 프레임에 따라 다르게 팔리면 안 된다.
//
// 색·글자크기를 스스로 정하지 않는다 — 어두운 프레임에서 글자가 사라진다.
// 라벨과 구조만 그리고 나머지는 MUI 기본(상속색)을 따른다.

const ProductOptions = ({ product, selected, onSelect, sx = {} }) => {
    const { translate, currentLang } = useLocales();

    const 필수 = requiredGroups(product);
    const 추가 = addonGroups(product);
    if (!필수.length && !추가.length) return null;

    const 조합형 = isComboMode(product);
    const 고른조합 = 조합형 ? findCombination(product, selected) : null;
    const 조합미등록 = 조합형
        && pickedRequiredOptionIds(product, selected).length === 필수.length
        && 필수.length > 0 && !고른조합;

    // 저장된 선택에서 이 그룹이 무엇을 골랐는지
    const 고른것 = (group) => (selected?.groups ?? []).find((g) => isSameGroup(g, group))?.options ?? [];

    return (
        <Box sx={{ width: '100%', ...sx }}>
            <Stack spacing={2}>
                {필수.map((group) => {
                    // 조합형이면 앞 그룹의 선택과 함께 팔리는 것만 고를 수 있게 한다.
                    // null 이면 제한 없음(조합형이 아니거나 첫 그룹이거나 앞을 아직 안 골랐다).
                    const 고를수있는 = selectableOptionIds(product, selected, group);
                    return (
                    <Box key={group?.id ?? group?.group_name}>
                        {/* '필수' 를 붙인다. 추가상품에는 '필요한 것만 고르세요' 가 있는데
                            정작 반드시 골라야 하는 쪽엔 아무 표시가 없어서, 안 고르고 담기를
                            누른 뒤에야 막혔다. 고르기 전에 알려 주는 게 맞다. */}
                        <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>
                            {formatLang(group, 'group_name', currentLang)}
                            <Box component="span" sx={{ ml: 0.75, fontSize: 11, fontWeight: 700, color: 'error.main' }}>
                                {translate('필수')}
                            </Box>
                        </Typography>
                        <TextField
                            select fullWidth size="small" required
                            label={translate('선택')}
                            value={고른것(group)[0]?.id ?? ''}
                            onChange={(e) => {
                                const opt = (group?.options ?? []).find((o) => String(o.id) === String(e.target.value));
                                if (opt) onSelect?.(group, opt, false);
                            }}
                        >
                            {(group?.options ?? []).map((option) => {
                                const 품절 = isOptionSoldOut(option);
                                const 남음 = lowStockCount(option?.stock_qty);
                                // 앞에서 고른 것과 같이 파는 조합이 없는 옵션.
                                // 예전엔 고를 수 있었고, 담기를 눌러야 '판매하지 않습니다' 가 떴다.
                                const 조합없음 = 고를수있는 !== null && !고를수있는.has(Number(option?.id));
                                return (
                                    // 품절·조합없음 옵션도 목록에 남기되 못 고르게 한다.
                                    // 아예 지우면 손님은 '원래 없는 색'인지 '지금만 없는 색'인지 알 수 없다.
                                    <MenuItem key={option?.id} value={option?.id} disabled={품절 || 조합없음}>
                                        {formatLang(option, 'option_name', currentLang)}
                                        {!조합형 && Number(option?.option_price) ?
                                            ` (${Number(option.option_price) > 0 ? '+' : ''}${commarNumber(option.option_price)})` : ''}
                                        {품절 ? ` — ${translate('품절')}`
                                            : 조합없음 ? ` — ${translate('이 조합은 판매하지 않습니다')}`
                                                : (남음 ? ` — ${translate('{{n}}개 남음', { n: 남음 })}` : '')}
                                    </MenuItem>
                                );
                            })}
                        </TextField>
                    </Box>
                    );
                })}

                {/* 조합형에서 안 파는 조합을 고른 경우. 담기 버튼은 shop-util 이 따로 막는다. */}
                {조합미등록 &&
                    <Typography sx={{ fontSize: 12, color: 'error.main' }}>
                        {translate('선택하신 조합은 판매하지 않습니다.')}
                    </Typography>}
                {조합형 && 고른조합 && Number(고른조합.add_price) !== 0 &&
                    <Typography sx={{ fontSize: 12 }}>
                        {translate('조합 추가금')} {Number(고른조합.add_price) > 0 ? '+' : ''}{commarNumber(고른조합.add_price)}
                    </Typography>}

                {/* 추가상품은 프레임 전체가 같은 컴포넌트를 쓴다(블로그형 프레임들도 이것만 가져다 쓴다) */}
                <ProductAddons product={product} selected={selected} onSelect={onSelect} />
            </Stack>
        </Box>
    );
};

export default ProductOptions;
