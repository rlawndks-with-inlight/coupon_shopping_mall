import { useState } from 'react';
import { Box, Stack, Typography, Button, Chip, Divider } from '@mui/material';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/router';
import { GUIDE_PART1, GUIDE_PART2 } from './guideContent';

// 단일 소스(guideContent)를 렌더하는 공용 가이드 본문.
// - /manager/guide (로그인 후): showRouteButtons=true, brandId 전달 → '해당 메뉴로 이동' 노출
// - 랜딩 /manual (신청 전): showRouteButtons=false → 버튼 숨김
// 스크린샷: /manual/guide/{id}.png 가 있으면 표시, 없으면 '준비중' 자리.

const badgeColor = (badge) => {
  switch (badge) {
    case '필수': return { bg: '#fdecea', fg: '#d33' };
    case '권장': return { bg: '#eef4ff', fg: '#2e6bd6' };
    case '조건부': return { bg: '#fff4e5', fg: '#c67c00' };
    case '운영': return { bg: '#eaf7ee', fg: '#2e7d32' };
    default: return { bg: '#eef0f3', fg: '#7a828d' };
  }
};

// 스크린샷 캡션: 사진 아래에 초록 체크 + 설명 한 줄.
const CheckCaption = ({ text }) => (
  <Stack direction="row" alignItems="flex-start" spacing={0.75} sx={{ p: 1 }}>
    <Icon icon="mdi:check-circle" color="#2e7d32" width={16} height={16} style={{ marginTop: 2, flexShrink: 0 }} />
    <Typography sx={{ fontSize: 12.5, color: '#555', lineHeight: 1.55 }}>{text}</Typography>
  </Stack>
);

// 사진 한 장 카드: 로드되면 이미지(+캡션) 표시, 404면 스스로 숨김.
const ShotCard = ({ img, cap, onResolve }) => {
  const [state, setState] = useState('loading'); // loading | ok | failed
  if (state === 'failed') return null;
  return (
    <Box sx={{ border: '1px solid #eee', borderRadius: 1.5, overflow: 'hidden', bgcolor: '#fff', display: state === 'ok' ? 'block' : 'none' }}>
      <Box
        component="img"
        src={`/manual/guide/${img}.png`}
        alt=""
        onLoad={() => { setState('ok'); onResolve?.(img, true); }}
        onError={() => { setState('failed'); onResolve?.(img, false); }}
        sx={{ width: '100%', display: 'block' }}
      />
      {cap && (
        <Box sx={{ borderTop: '1px solid #f4f4f4', bgcolor: '#fafafa' }}>
          <CheckCaption text={cap} />
        </Box>
      )}
    </Box>
  );
};

// 단계별 스크린샷.
// - shots가 있으면 [{ img, cap }] 순서대로 (사진별 체크·설명) 렌더.
// - 없으면 {id}.png / {id}1~3.png 자동 후보로 캡션 없이 렌더.
// - 전부 없으면 '준비중' 자리.
const GuideImage = ({ id, shots }) => {
  const list = shots && shots.length ? shots : [id, `${id}1`, `${id}2`, `${id}3`].map((c) => ({ img: c }));
  const [resolved, setResolved] = useState({});
  const anyOk = Object.values(resolved).some(Boolean);
  const allResolved = list.every((sh) => resolved[sh.img] !== undefined);
  return (
    <Stack spacing={1.25} sx={{ mt: 1.5 }}>
      {list.map((sh) => (
        <ShotCard
          key={sh.img}
          img={sh.img}
          cap={sh.cap}
          onResolve={(img, v) => setResolved((p) => ({ ...p, [img]: v }))}
        />
      ))}
      {allResolved && !anyOk && (
        <Box sx={{ height: 108, border: '1px dashed #d8d8d8', borderRadius: 1.5, bgcolor: '#fafafa', color: '#bbb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5 }}>
          <Icon icon="mdi:image-outline" width={18} height={18} style={{ marginRight: 6 }} />
          스크린샷 준비중
        </Box>
      )}
    </Stack>
  );
};

const GuideCard = ({ s, ordered, showRouteButtons, brandId, router }) => {
  const bc = badgeColor(s.badge);
  const route = s.route ? s.route.replace('{id}', brandId ?? '') : null;
  return (
    <Box id={s.id} sx={{ border: '1px solid #eee', borderRadius: 2, p: { xs: 2, md: 2.5 }, bgcolor: '#fff', scrollMarginTop: 90 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        {ordered && (
          <Box sx={{ minWidth: 34, height: 34, borderRadius: '50%', bgcolor: '#111', color: '#fff', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {s.no}
          </Box>
        )}
        <Typography sx={{ fontSize: 17, fontWeight: 800, flex: 1 }}>{s.title}</Typography>
        <Chip label={s.badge} size="small" sx={{ bgcolor: bc.bg, color: bc.fg, fontWeight: 700, height: 22 }} />
      </Stack>

      <Typography sx={{ fontSize: 12.5, color: '#999', mb: 1 }}>
        <Icon icon="mdi:map-marker-outline" style={{ verticalAlign: '-2px' }} /> {s.where}
      </Typography>

      <Typography sx={{ fontSize: 13.5, color: '#555', lineHeight: 1.7, mb: 1.5 }}>{s.why}</Typography>

      <Stack component="ol" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
        {s.steps.map((step, i) => (
          <Typography key={i} component="li" sx={{ fontSize: 13.5, color: '#333', lineHeight: 1.7 }}>{step}</Typography>
        ))}
      </Stack>

      <GuideImage id={s.id} shots={s.shots} />

      {showRouteButtons && route && (
        <Button size="small" variant="outlined" onClick={() => router.push(route)} endIcon={<Icon icon="mdi:arrow-right" />} sx={{ mt: 1.5 }}>
          해당 메뉴로 이동
        </Button>
      )}
    </Box>
  );
};

const GuideBody = ({ showRouteButtons = false, brandId }) => {
  const router = useRouter();
  return (
    <>
      <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 0.5 }}>① 쇼핑몰 오픈까지 — 이 순서대로</Typography>
      <Typography sx={{ fontSize: 13, color: '#999', mb: 2 }}>앞 단계가 뒤 단계의 전제입니다.</Typography>
      <Stack spacing={2}>
        {GUIDE_PART1.map((s) => (
          <GuideCard key={s.id} s={s} ordered showRouteButtons={showRouteButtons} brandId={brandId} router={router} />
        ))}
      </Stack>

      <Box sx={{ my: 3, p: 2, borderRadius: 2, bgcolor: '#eaf7ee', border: '1px solid #cbe6d2' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#2e7d32' }}>
          ✅ 카테고리 · 상품 · 결제수단이 모두 준비되면 판매가 시작됩니다.
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 0.5 }}>② 운영하며 필요할 때</Typography>
      <Typography sx={{ fontSize: 13, color: '#999', mb: 2 }}>아래는 특별한 순서 없이, 그때그때 필요할 때 사용하는 기능입니다.</Typography>
      <Stack spacing={2}>
        {GUIDE_PART2.map((s) => (
          <GuideCard key={s.id} s={s} showRouteButtons={showRouteButtons} brandId={brandId} router={router} />
        ))}
      </Stack>
    </>
  );
};

export default GuideBody;
