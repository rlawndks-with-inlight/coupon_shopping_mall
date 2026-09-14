import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import {
  Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Rating, Stack, TextField, Typography,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { Upload } from 'src/components/upload';
import Iconify from 'src/components/iconify/Iconify';
import { apiManager, uploadFilesByManager } from 'src/utils/api';
import { useLocales } from 'src/locales';
import { useSettingsContext } from 'src/components/settings';
import { reviewSettings } from 'src/utils/review';

// 후기 작성·수정 창. 여섯 프레임과 주문내역이 같은 창을 쓴다 — 버튼 색만 프레임을 따른다(accent).
//
// 무엇을 받나: 별점(정수 1~5) · 본문 · 사진(최대 5장, Cloudinary 로 먼저 올린 뒤 URL 만 보낸다).
// 제목은 받지 않는다(쿠팡·네이버 모두 제목이 없다). 어느 주문 줄에 쓰는지는 line.order_id 가 정한다 —
// 구매·시점·기한 판정은 서버가 다시 한다(utils.js/review-policy.js).

const STAR_WORDS = ['', '아쉬워요', '그저 그래요', '보통이에요', '좋아요', '최고예요'];

ReviewWriteDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  line: PropTypes.object,     // { order_id, product_name, product_img, option_text }
  review: PropTypes.object,   // 수정일 때 기존 후기
  onDone: PropTypes.func,
  accent: PropTypes.string,
};

export default function ReviewWriteDialog({ open, onClose, line, review, onDone, accent }) {
  const { translate } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const settings = reviewSettings(themeDnsData);
  const [scope, setScope] = useState(0);
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]); // 이미 올라간 URL(수정 때)
  const [files, setFiles] = useState([]);   // 새로 고른 파일
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setScope(Number(review?.scope) || 0);
    setContent(review?.content ?? '');
    setImages(Array.isArray(review?.images) ? review.images : []);
    setFiles([]);
    setBusy(false);
  }, [open, review?.id]);

  const total = images.length + files.length;
  const handleDrop = (accepted) => {
    const room = settings.max_images - total;
    if (room <= 0) { toast.error(translate('사진은 최대 5장까지 올릴 수 있습니다.')); return; }
    const next = (accepted || []).slice(0, room).map((f) => Object.assign(f, { preview: URL.createObjectURL(f) }));
    if ((accepted || []).length > room) toast.error(translate('사진은 최대 5장까지 올릴 수 있습니다.'));
    setFiles((prev) => [...prev, ...next]);
  };

  const submit = async () => {
    if (busy) return;
    if (!(scope >= 1)) { toast.error(translate('별점을 선택해 주세요.')); return; }
    const text = String(content ?? '').replace(/\r\n/g, '\n').trim();
    const len = [...text].length;
    if (len < settings.min_length) { toast.error(translate('후기가 너무 짧습니다. 조금 더 적어 주세요.')); return; }
    if (len > settings.max_length) { toast.error(translate('후기는 1,000자 이내로 입력해 주세요.')); return; }
    setBusy(true);
    let urls = [...images];
    if (files.length) {
      const uploaded = await uploadFilesByManager({ images: files.map((f) => ({ image: f })) });
      const ok = (uploaded || []).map((u) => u?.url).filter(Boolean);
      if (ok.length < files.length) {
        toast.error(translate('사진 일부를 올리지 못했습니다. 다시 시도해 주세요.'));
        setBusy(false);
        return;
      }
      urls = [...urls, ...ok];
    }
    const body = { scope, content: text, images: JSON.stringify(urls.slice(0, settings.max_images)) };
    const result = review?.id
      ? await apiManager('product-reviews', 'update', { ...body, id: review.id })
      : await apiManager('product-reviews', 'create', { ...body, order_id: line?.order_id });
    setBusy(false);
    if (result) {
      toast.success(translate(review?.id ? '후기를 수정했어요.' : '후기가 등록됐어요.'));
      onDone?.();
      onClose?.();
    }
  };

  const productName = line?.product_name || review?.product_name || '';
  const optionText = review?.option_text ?? line?.option_text ?? '';
  const button = { bgcolor: accent || undefined, '&:hover': accent ? { bgcolor: accent, filter: 'brightness(0.92)' } : undefined };

  return (
    <Dialog open={!!open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 1 }}>{translate(review?.id ? '후기 수정' : '후기 쓰기')}</DialogTitle>
      <DialogContent>
        {(productName || line?.product_img) && (
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2, p: 1.25, borderRadius: 1.5, bgcolor: 'action.hover' }}>
            {line?.product_img && <Box component="img" src={line.product_img} alt="" sx={{ width: 48, height: 48, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }} />}
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>{productName}</Typography>
              {optionText && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{translate('구매 옵션')}: {optionText}</Typography>}
            </Box>
          </Stack>
        )}

        {settings.notice && (
          <Typography variant="body2" sx={{ mb: 2, p: 1.25, borderRadius: 1.5, bgcolor: 'warning.lighter', color: 'text.primary', whiteSpace: 'pre-line' }}>
            {settings.notice}
          </Typography>
        )}

        <Stack alignItems="center" spacing={0.5} sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{translate('별점을 선택해 주세요.')}</Typography>
          {/* 정수 1~5 — 서버 검사와 같은 눈금. 예전 폼은 ×2 로 보내 3점 이상이 거절됐다. */}
          <Rating value={scope} precision={1} size="large" onChange={(e, v) => setScope(v || 0)} />
          <Typography variant="subtitle2" sx={{ minHeight: 22, color: scope ? 'text.primary' : 'text.disabled' }}>
            {scope ? translate(STAR_WORDS[scope]) : ' '}
          </Typography>
        </Stack>

        <TextField
          value={content}
          onChange={(e) => setContent(e.target.value)}
          label={translate('후기를 남겨 주세요.')}
          placeholder={translate('상품을 받아 보신 느낌을 적어 주세요. 다른 손님에게 큰 도움이 됩니다.')}
          multiline minRows={5} fullWidth
          inputProps={{ maxLength: settings.max_length }}
          helperText={`${[...String(content ?? '')].length} / ${settings.max_length} · ${translate('최소 {{n}}자', { n: settings.min_length })}`}
        />

        {settings.allow_photo && (
          <Stack spacing={1} sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              {translate('사진 추가 (최대 {{n}}장)', { n: settings.max_images })}
            </Typography>
            {images.length > 0 && (
              <Stack direction="row" flexWrap="wrap" sx={{ gap: 1 }}>
                {images.map((url) => (
                  <Box key={url} sx={{ position: 'relative', width: 72, height: 72 }}>
                    <Box component="img" src={url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1 }} />
                    <IconButton size="small" onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                      sx={{ position: 'absolute', top: -6, right: -6, bgcolor: 'grey.800', color: '#fff', p: 0.25, '&:hover': { bgcolor: 'grey.900' } }}>
                      <Iconify icon="eva:close-fill" width={14} />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}
            {total < settings.max_images && (
              <Upload
                multiple
                files={files}
                thumbnail
                onDrop={handleDrop}
                onRemove={(file) => setFiles((prev) => prev.filter((f) => f !== file))}
                onRemoveAll={() => setFiles([])}
                accept={{ 'image/*': [] }}
              />
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button color="inherit" variant="outlined" onClick={onClose} disabled={busy}>{translate('취소')}</Button>
        <Button variant="contained" onClick={submit} disabled={busy} sx={button}
          startIcon={busy ? <CircularProgress size={16} color="inherit" /> : null}>
          {translate(review?.id ? '저장' : '등록')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
