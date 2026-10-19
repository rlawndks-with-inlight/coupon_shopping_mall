import { useRef } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Link, Stack, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { QRCodeCanvas } from 'qrcode.react';
import toast from 'react-hot-toast';

// 몰·상품 QR 코드 창(관리자). 2026-10-19 — 매장 POP·전단·포장지에 인쇄해 손님이 찍으면 그 페이지로 가게.
//
// 주소는 그 몰의 실제 도메인(brands.dns)으로 만든다. 관리자 화면을 본사 도메인에서 열어도
// QR 은 손님이 들어갈 몰 주소여야 한다. dns 가 없을 때만 지금 화면의 주소를 쓴다.
// 이미지 저장은 인쇄용으로 1024px QR + 여백 + 아래 제목(상품명·몰 이름)을 한 장으로 만든다.

export const 몰주소 = (themeDnsData) => {
  const dns = String(themeDnsData?.dns ?? '').trim();
  if (dns) return `https://${dns}`;
  return typeof window !== 'undefined' ? window.location.origin : '';
};
export const 상품주소 = (themeDnsData, id) => `${몰주소(themeDnsData)}/shop/item/${id}/`;

const QrDialog = ({ open, onClose, url, title, fileName = 'qr' }) => {
  const 큰QR = useRef(null);

  const 저장 = () => {
    const src = 큰QR.current?.querySelector('canvas');
    if (!src) return;
    const pad = 64;
    const 글칸 = title ? 120 : 0;
    const c = document.createElement('canvas');
    c.width = src.width + pad * 2;
    c.height = src.height + pad * 2 + 글칸;
    const g = c.getContext('2d');
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, c.width, c.height);
    g.drawImage(src, pad, pad);
    if (title) {
      g.fillStyle = '#111111';
      g.font = 'bold 44px "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      // 이름이 길면 폭에 맞춰 줄이고 끝에 … 를 붙인다
      let 글 = String(title);
      const 최대 = c.width - pad * 2;
      if (g.measureText(글).width > 최대) {
        while (글.length > 1 && g.measureText(글 + '…').width > 최대) 글 = 글.slice(0, -1);
        글 += '…';
      }
      g.fillText(글, c.width / 2, src.height + pad + 글칸 / 2);
    }
    const a = document.createElement('a');
    a.href = c.toDataURL('image/png');
    a.download = `${fileName}.png`;
    a.click();
  };

  const 복사 = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('주소를 복사했습니다.');
    } catch (e) {
      toast.error('복사하지 못했습니다. 아래 주소를 직접 선택해 복사해 주세요.');
    }
  };

  return (
    <Dialog open={!!open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>QR 코드</DialogTitle>
      <DialogContent>
        <Stack alignItems="center" spacing={1.5}>
          {title ? <Typography sx={{ fontWeight: 700, textAlign: 'center', wordBreak: 'keep-all' }}>{title}</Typography> : null}
          <QRCodeCanvas value={url || ''} size={240} level="M" includeMargin />
          <Link href={url} target="_blank" rel="noopener noreferrer" sx={{ fontSize: 12, wordBreak: 'break-all', textAlign: 'center' }}>{url}</Link>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', textAlign: 'center', wordBreak: 'keep-all' }}>
            휴대폰 카메라로 찍으면 이 페이지가 열립니다. 「이미지 저장」은 인쇄용(QR 1024px) 이미지입니다.
          </Typography>
        </Stack>
        {/* 인쇄용 큰 QR — 화면에는 그리지 않고 저장할 때만 쓴다 */}
        <div ref={큰QR} style={{ display: 'none' }}>
          <QRCodeCanvas value={url || ''} size={1024} level="M" />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={복사} startIcon={<Icon icon="mdi:content-copy" />}>주소 복사</Button>
        <Button variant="contained" onClick={저장} startIcon={<Icon icon="mdi:download" />}>이미지 저장</Button>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
};

export default QrDialog;
