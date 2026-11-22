import { Fragment, useEffect, useRef, useState } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import { useLocales } from 'src/locales';
import { formatLang } from 'src/utils/format';

// 상품정보(특성) — **보여주기 전용**. 원산지·제조사처럼 고르는 것이 아닌 값.
//
// 왜 이 컴포넌트가 생겼나:
//   같은 product_characters 데이터를 프레임2 는 '눌러야만 구매되는 필수 선택 버튼'으로,
//   프레임3·5·6 은 '읽기 전용 정보표'로 그리고 있었다. 관리자 입력칸 안내는
//   '원산지 / 국내산' 이라 정보표 쪽 뜻인데, 프레임2 가맹점의 손님은
//   '국내산' 버튼을 눌러야만 살 수 있었다.
//
//   실제로 가맹점이 넣은 특성 6건 중 5건이 오용이었다
//   (키·값 뒤집기, 특성값에 가격을 적음). 아무도 이 칸의 뜻을 알 수 없었다는 뜻이다.
//
// 이제 특성은 어느 프레임에서든 정보다. 고르는 것은 옵션(ProductOptions)이 맡는다.

// 긴 값은 두 줄까지만 보이고 「더보기」로 편다.
//   이 표는 장바구니·바로구매 단추 **위**에 있다. 식품 정보고시 「원재료명 및 함량」은 수백 자라
//   통째로 보이면 단추가 화면 밑으로 밀린다(해담수산 2026-11-22, 내용 칸 1,000자로 늘림).
//   넘치는지는 글자 수가 아니라 실제 높이로 잰다 — 같은 글도 PC 와 휴대폰에서 줄 수가 다르다.
// 인쇄·PDF 에서는 접지 않는다(카드사 심사가 상품 화면을 인쇄해 본다 — 접힌 채면 정보고시가 잘린다).
const 접힌줄 = 2;

const 정보값 = ({ text }) => {
    const { translate } = useLocales();
    const ref = useRef(null);
    const [펼침, set펼침] = useState(false);
    const [넘침, set넘침] = useState(false);

    useEffect(() => {
        const el = ref.current;
        // 펼친 동안에는 재지 않는다 — 접기 단추가 남아 있어야 한다
        if (!el || 펼침) return undefined;
        const 재기 = () => set넘침(el.scrollHeight > el.clientHeight + 1);
        재기();
        if (typeof ResizeObserver === 'undefined') return undefined;
        const ro = new ResizeObserver(재기);
        ro.observe(el);
        return () => ro.disconnect();
    }, [text, 펼침]);

    return (
        <Box sx={{ minWidth: 0 }}>
            <Typography
                ref={ref}
                sx={{
                    fontSize: 13,
                    // 관리자 내용 칸이 여러 줄이라 가맹점이 넣은 줄바꿈을 살린다
                    whiteSpace: 'pre-line',
                    // 한국어도 낱말 단위로 줄을 바꾼다(「미국/산」처럼 끊기지 않게). 띄어쓰기 없는 긴 덩어리만 아무 데서나
                    wordBreak: 'keep-all',
                    overflowWrap: 'anywhere',
                    ...(펼침 ? {} : {
                        display: '-webkit-box',
                        WebkitLineClamp: 접힌줄,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }),
                    '@media print': { display: 'block', WebkitLineClamp: 'unset', overflow: 'visible' },
                }}
            >
                {text}
            </Typography>
            {(넘침 || 펼침) && (
                <ButtonBase
                    onClick={() => set펼침(!펼침)}
                    aria-expanded={펼침}
                    sx={{ mt: 0.25, fontSize: 12, color: 'text.secondary', textDecoration: 'underline', '@media print': { display: 'none' } }}
                >
                    {translate(펼침 ? '접기' : '더보기')}
                </ButtonBase>
            )}
        </Box>
    );
};

const ProductInfoRows = ({ product, sx = {} }) => {
    const { translate, currentLang } = useLocales();
    const rows = (Array.isArray(product?.characters) ? product.characters : [])
        .filter((c) => String(c?.character_name ?? '').trim() && String(c?.character_value ?? '').trim());
    if (!rows.length) return null;

    return (
        <Box sx={{ width: '100%', ...sx }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>{translate('상품 정보')}</Typography>
            {/* 표 배치 — 항목 칸 폭을 가장 긴 항목(「원재료명 및 함량」)에 맞춰 내용 시작선을 줄마다 맞춘다. 항목 칸은 40% 까지 */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'fit-content(40%) minmax(0, 1fr)', columnGap: 1.5, rowGap: 0.5 }}>
                {rows.map((c, i) => (
                    <Fragment key={i}>
                        <Typography sx={{ fontSize: 13, minWidth: 88, opacity: 0.65, wordBreak: 'keep-all' }}>
                            {formatLang(c, 'character_name', currentLang)}
                        </Typography>
                        <정보값 text={formatLang(c, 'character_value', currentLang)} />
                    </Fragment>
                ))}
            </Box>
        </Box>
    );
};

export default ProductInfoRows;
