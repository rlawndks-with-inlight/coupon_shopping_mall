import { useEffect, useState } from 'react'
import { Alert, Box, Stack, Typography } from '@mui/material'
import { logoDeliveryUrl } from 'src/data/data'

// 로고가 헤더에서 실제로 어떻게 보이는지 업로드 자리에서 바로 보여 준다.
//
// [왜 만들었나]
// 안내 문구를 아무리 잘 써도 '내 로고가 어떻게 되는지'는 안 보인다.
// 프레임별 대표 가맹점 13곳을 재 봤더니 6곳이 이미 흐리게 나가고 있었는데
// (bs-company 73px · asapmall 83px · jjpay 106px · glamup 112px ·
//  forsmall 159px · buddymall 174px), 정작 그 가맹점들은 알 방법이 없었다.
// 문장으로 '작으면 흐려집니다'라고 적어 두는 것과, 그 자리에서 '지금 작습니다'라고
// 말해 주는 것은 다르다.
//
// [무엇을 보여 주나]
//  · 여백을 깎아 낸 뒤의 모습을 헤더 높이(40px) 그대로 — 배달 시점의 e_trim 과 같은 일을
//    브라우저에서 미리 해 본다. 그래서 '여백을 넣어도 소용없다'가 눈으로 보인다.
//  · 밝은 배경과 어두운 배경 둘 다 — 배경 투명 PNG 를 권하는 이유가 여기서 드러난다.
//    (다크모드 로고를 안 올리면 어두운 배경에도 이 로고가 그대로 쓰인다)
//  · 여백을 뺀 세로가 최소치보다 작으면 실측값과 함께 경고한다.
//
// [측정 못 하는 경우]
// 이미 저장된 로고는 다른 도메인(Cloudinary)에서 오므로 캔버스가 오염돼 픽셀을 못 읽을 수 있다.
// 그때는 조용히 경고를 접고 미리보기만 띄운다 — 못 재는 것을 '작다'고 말하면 안 된다.

// 배달 규격(data.js LOGO_TRANSFORM 의 h_176)에 여유를 얹은 값.
// 이보다 작으면 늘려서 내보내게 되므로 흐려진다.
const 최소세로 = 200

// 큰 원본을 그대로 훑으면 메모리가 튄다(3375x3375 = 45MB ImageData).
// 줄여서 잰 뒤 배율로 되돌린다 — 200px 문턱을 가리는 데는 이 정밀도로 충분하다.
const 분석폭 = 600

// 여백(둘레의 균일한 색·투명)을 뺀 실제 그림 영역을 잰다. Cloudinary e_trim 과 같은 판정이다.
const 여백빼고재기 = img => {
  const 배율 = Math.min(1, 분석폭 / Math.max(img.naturalWidth, img.naturalHeight))
  const w = Math.max(1, Math.round(img.naturalWidth * 배율))
  const h = Math.max(1, Math.round(img.naturalHeight * 배율))
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, w, h)
  // 다른 도메인 이미지면 여기서 SecurityError 가 난다 — 부르는 쪽에서 잡는다.
  const { data } = ctx.getImageData(0, 0, w, h)

  // 기준은 좌상단 픽셀. 그게 투명하면 '투명 배경', 아니면 '그 색이 배경'으로 본다.
  const [br, bg, bb, ba] = [data[0], data[1], data[2], data[3]]
  const 투명배경 = ba < 16
  const 그림인가 = i =>
    투명배경
      ? data[i + 3] > 16
      : Math.abs(data[i] - br) + Math.abs(data[i + 1] - bg) + Math.abs(data[i + 2] - bb) > 30

  let x0 = w
  let y0 = h
  let x1 = -1
  let y1 = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (그림인가((y * w + x) * 4)) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  if (x1 < 0) return null // 전부 배경색 — 잴 것이 없다

  // 줄여서 잰 좌표를 원본 좌표로 되돌린다(가장자리는 한 픽셀 넉넉히).
  const 되돌림 = v => Math.round(v / 배율)
  const sx = Math.max(0, 되돌림(x0) - 1)
  const sy = Math.max(0, 되돌림(y0) - 1)
  const sw = Math.min(img.naturalWidth - sx, 되돌림(x1 - x0 + 1) + 2)
  const sh = Math.min(img.naturalHeight - sy, 되돌림(y1 - y0 + 1) + 2)

  // 잘라 낸 모습을 그대로 미리보기로 쓴다(배달 때 e_trim 이 하는 일과 같다).
  const out = document.createElement('canvas')
  out.width = sw
  out.height = sh
  out.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)

  return { w: img.naturalWidth, h: img.naturalHeight, tw: sw, th: sh, 잘린모습: out.toDataURL('image/png') }
}

const 이미지불러오기 = src =>
  new Promise((resolve, reject) => {
    const img = new Image()
    // 이미 저장된 로고(다른 도메인)도 재 볼 수 있게 시도한다. 막히면 onerror 로 떨어진다.
    if (!src.startsWith('blob:') && !src.startsWith('data:')) img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

// SVG 는 벡터라 아무리 키워도 흐려지지 않는다. 그런데 <img> 로 읽으면 naturalWidth 가
// '의도된 표시 크기'(예: 100x30)로 잡혀서, 그대로 재면 '작다'고 잘못 경고하게 된다.
// (배달 때도 Cloudinary 가 h_176 으로 다시 그리므로 또렷하다.)
// 미리보기는 그대로 보여 주되 경고만 접는다.
const 벡터인가 = (file, url) => {
  if (file?.type === 'image/svg+xml') return true
  const 이름 = String(file?.name ?? '')
  const 주소 = String(url ?? '')
  return /\.svg$/i.test(이름) || /\.svg($|\?)/i.test(주소.split('#')[0]) || 주소.startsWith('data:image/svg')
}

const 칸 = (배율) => ({ height: 40 * (Number(배율) || 100) / 100, display: 'block', width: 'auto', maxWidth: '100%' })

const 배경칸 = ({ 라벨, 색, src, 배율 }) => (
  <Stack spacing={0.5} alignItems='center'>
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 색,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,
        minHeight: 64
      }}
    >
      <Box component='img' src={src} alt='' sx={칸(배율)} />
    </Box>
    <Typography variant='caption' sx={{ color: 'text.disabled' }}>
      {라벨}
    </Typography>
  </Stack>
)

// file  — 방금 고른 파일(있으면 이쪽을 본다). Upload 가 붙여 준 .preview(blob URL)를 쓴다.
// url   — 이미 저장돼 있는 로고 주소.
// dark  — 다크모드 로고면 true. 어두운 배경 한 칸만 보여 준다.
// scale — 가맹점이 정한 로고 배율(%). 미리보기도 같은 크기로 보여야 조절한 보람이 있다.
const LogoPreview = ({ file, url, dark = false, scale = 100 }) => {
  const [측정, set측정] = useState(null)
  const [미리보기, set미리보기] = useState('')

  const 원본 = (file && (file.preview || (typeof file === 'string' ? file : ''))) || url || ''

  useEffect(() => {
    let 살아있음 = true
    set측정(null)
    set미리보기('')
    if (!원본) return undefined

    // 못 재더라도 미리보기는 띄운다. 저장된 주소면 배달 URL(e_trim 포함)을 그대로 쓴다.
    set미리보기(원본.startsWith('blob:') || 원본.startsWith('data:') ? 원본 : logoDeliveryUrl(원본))

    이미지불러오기(원본)
      .then(img => {
        if (!살아있음) return
        const r = 여백빼고재기(img)
        if (!r) return
        set측정(r)
        set미리보기(r.잘린모습)
      })
      .catch(() => {
        // 다른 도메인이라 픽셀을 못 읽는 경우. 못 재는 것을 '작다'고 말하면 안 되니 조용히 넘어간다.
      })

    return () => {
      살아있음 = false
    }
  }, [원본])

  if (!원본) return null

  const 작음 = 측정 && 측정.th < 최소세로 && !벡터인가(file, url)

  return (
    <Stack spacing={1} sx={{ pt: 0.5 }}>
      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
        쇼핑몰 상단에서 이렇게 보입니다
      </Typography>
      <Stack direction='row' spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1.5 }}>
        {!dark && <배경칸 라벨='밝은 배경' 색='#ffffff' src={미리보기} 배율={scale} />}
        <배경칸 라벨={dark ? '어두운 배경' : '어두운 배경(다크모드)'} 색='#1a1a1a' src={미리보기} 배율={scale} />
      </Stack>
      {측정 && (
        <Typography variant='caption' sx={{ color: 'text.disabled' }}>
          올리신 파일 {측정.w} × {측정.h} · 여백을 뺀 로고 부분 {측정.tw} × {측정.th}
        </Typography>
      )}
      {작음 && (
        <Alert severity='warning' sx={{ py: 0.5 }}>
          <Typography variant='caption'>
            여백을 뺀 세로가 {측정.th}px 라 화면에서 흐려 보일 수 있습니다. 같은 로고를 더 크게 내보낸 파일이
            있으면 그걸로 올려 주세요. (세로 {최소세로}px 이상 권장)
          </Typography>
        </Alert>
      )}
    </Stack>
  )
}

export default LogoPreview
