import { Box, Stack, Typography } from '@mui/material';
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
const ProductInfoRows = ({ product, sx = {} }) => {
    const { translate, currentLang } = useLocales();
    const rows = (Array.isArray(product?.characters) ? product.characters : [])
        .filter((c) => String(c?.character_name ?? '').trim() && String(c?.character_value ?? '').trim());
    if (!rows.length) return null;

    return (
        <Box sx={{ width: '100%', ...sx }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>{translate('상품 정보')}</Typography>
            <Stack spacing={0.5}>
                {rows.map((c, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1.5, fontSize: 13 }}>
                        <Typography sx={{ fontSize: 13, minWidth: 88, opacity: 0.65 }}>
                            {formatLang(c, 'character_name', currentLang)}
                        </Typography>
                        <Typography sx={{ fontSize: 13 }}>
                            {formatLang(c, 'character_value', currentLang)}
                        </Typography>
                    </Box>
                ))}
            </Stack>
        </Box>
    );
};

export default ProductInfoRows;
