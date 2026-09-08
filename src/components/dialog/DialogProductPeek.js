import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Stack, Typography, useMediaQuery } from '@mui/material';
import Iconify from 'src/components/iconify/Iconify';
import ProductThumbs, { buildProductImages, imageSwipeHandlers } from 'src/components/elements/shop/ProductThumbs';
import { useSettingsContext } from 'src/components/settings';
import { useLocales } from 'src/locales';
import { formatLang } from 'src/utils/format';
import { commarNumberWithUnit } from 'src/utils/function';
import { orderLineOptionTexts } from 'src/utils/shop-util';
import { optionExtraPrice } from 'src/data/product-options';
import { fetchServerProduct } from 'src/utils/cart-sync';

// 주문서·장바구니 줄에서 상품을 누르면 뜨는 「상품 정보」 창.
//
// [왜 — 2026-09-09 사장님 결정]
// 줄의 사진·이름을 누르면 상품 페이지로 **이동**했다. 주문서는 검토 단계라 손님을 밖으로
// 내보내면 입력하던 것을 잃거나 흐름이 끊긴다. 새 탭은 주문서를 떠나는 것이고, 링크를
// 없애면 "이게 뭐였지" 싶을 때 갈 데가 없다. 그래서 **그 자리에서 확인만 하고 닫는 창**으로 한다.
//
// 줄(row)은 상품을 통째로 들고 있어서(장바구니·바로구매 모두 상품 객체를 복사한다) 사진·설명을
// 서버에서 다시 받지 않는다. 어디로도 나가는 링크는 두지 않는다.

DialogProductPeek.propTypes = {
  open: PropTypes.bool,
  row: PropTypes.object,      // 주문 줄: 상품 필드 + groups + order_count
  onClose: PropTypes.func,
};

export default function DialogProductPeek({ open, row, onClose }) {
  const { translate, currentLang } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const 휴대폰 = useMediaQuery('(max-width:599.95px)');
  const [imgIdx, setImgIdx] = useState(0);
  // 줄에 상세설명·추가 사진이 없으면(장바구니 동기화가 가격·상태만 다시 받는다) 창을 열 때 한 번 받아온다.
  // cart-sync 의 조회는 로그인 쿠키를 빼고 물어보므로 '최근 본 상품' 이력이 남지 않는다.
  const [detail, setDetail] = useState(null);
  useEffect(() => {
    setImgIdx(0);
    setDetail(null);
    if (!open || !(Number(row?.id) > 0)) return undefined;
    const 부족 = row?.product_description === undefined || row?.sub_images === undefined;
    if (!부족) return undefined;
    let alive = true;
    fetchServerProduct(row.id, row?.seller_id).then((r) => { if (alive && r?.product) setDetail(r.product); });
    return () => { alive = false; };
  }, [open, row?.id]);
  if (!row) return null;

  // 줄의 값이 우선(고른 옵션·수량·주문 시점 가격). 줄에 없는 것만 상세로 채운다.
  const 상품 = detail
    ? Object.fromEntries(Object.keys({ ...detail, ...row }).map((k) => [k, row?.[k] === undefined ? detail[k] : row[k]]))
    : row;
  const 번역 = themeDnsData?.setting_obj?.is_use_lang == 1;
  const 글 = (col) => (번역 ? formatLang(상품, col, currentLang) : 상품?.[col]) ?? '';
  const images = buildProductImages(상품);
  const 옵션들 = orderLineOptionTexts(row, currentLang?.value);
  // 추가상품 줄이면 상품가 없이 추가상품 가격만(장바구니·주문서와 같은 규칙)
  const 개당 = (Number(row?.addon_line) === 1 ? 0 : (parseFloat(row?.product_sale_price) || 0)) + optionExtraPrice(row, { groups: row?.groups ?? [] });
  const 수량 = Number(row?.order_count) || 1;
  const 설명 = 글('product_description');

  return (
    <Dialog open={!!open} onClose={onClose} fullScreen={휴대폰} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle sx={{ pr: 6 }}>
        {translate('상품 정보')}
        <IconButton onClick={onClose} aria-label={translate('닫기')} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {images.length > 0 && (
            <Box {...imageSwipeHandlers(images, imgIdx, setImgIdx)} sx={{ userSelect: 'none' }}>
              <Box component="img" src={images[Math.min(imgIdx, images.length - 1)]} alt={글('product_name')}
                sx={{ width: '100%', maxHeight: 360, objectFit: 'contain', borderRadius: 1.5, bgcolor: 'background.neutral' }} />
              {images.length > 1 && (
                <Box sx={{ mt: 1 }}>
                  <ProductThumbs images={images} activeIndex={imgIdx} onSelect={setImgIdx} />
                </Box>
              )}
            </Box>
          )}
          <Box>
            <Typography variant="subtitle1">{글('product_name')}</Typography>
            {글('product_comment') && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{글('product_comment')}</Typography>
            )}
          </Box>
          <Divider />
          {/* 이 줄에서 고른 것 — 표·요약과 같은 글(orderLineOptionTexts) */}
          <Stack spacing={0.5}>
            {옵션들.length > 0 && (
              <Stack direction="row" spacing={2}>
                <Typography variant="body2" sx={{ color: 'text.secondary', flex: '0 0 72px' }}>{translate('선택한 옵션')}</Typography>
                <Box>{옵션들.map((t, i) => <Typography key={i} variant="body2">{t}</Typography>)}</Box>
              </Stack>
            )}
            <Stack direction="row" spacing={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary', flex: '0 0 72px' }}>{translate('수량')}</Typography>
              <Typography variant="body2">{수량} · {translate('개당')} {commarNumberWithUnit(개당, currentLang?.value)}</Typography>
            </Stack>
          </Stack>
          {설명 && (
            <>
              <Divider />
              {/* 상품 페이지의 상세설명 그대로. 그림이 창을 넘지 않게만 잡는다 */}
              <Box sx={{ fontSize: 14, lineHeight: 1.9, '& img': { maxWidth: '100%', height: 'auto' }, '& *': { maxWidth: '100%' } }}
                dangerouslySetInnerHTML={{ __html: 설명 }} />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="inherit">{translate('닫기')}</Button>
      </DialogActions>
    </Dialog>
  );
}
