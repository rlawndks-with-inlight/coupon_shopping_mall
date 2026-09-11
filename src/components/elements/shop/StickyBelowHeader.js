import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

// 스크롤을 따라 붙는 옆 상자(주문서 PC 오른쪽 결제 상자)를 몰 헤더 바로 밑에 붙인다.
//
// 예전엔 top: 24 로 적어 두었는데, 스토어프론트 헤더는 대부분 position:fixed 로 화면 위에 떠 있어서
// (mbc01 프레임 162px) 상자 윗부분 — 주문 요약정보·상품금액 — 이 헤더 밑에 가려진 채 따라 내려왔다(2026-09-11 지적).
// 헤더 높이는 프레임마다 다르고 스크롤하면 줄어드는 헤더도 있어서(shop demo-6 는 113px 을 넘기면 로고 줄을 접는다)
// 상수를 두지 않고 스크롤할 때마다 헤더 아래 끝을 잰다. sticky 헤더(blog demo-6)도 붙어 있는 동안은 같은 자리를 차지한다.
//
// 화면이 낮아 상자가 헤더 밑 공간에 다 안 들어가면(노트북 150% 배율 등) 위에만 붙여서는 총 결제금액·결제하기가
// 화면 밖으로 밀린 채 따라온다. 그때는 긴 옆칸이 흔히 쓰는 방식으로 — 내려갈 때는 아래 끝이 화면 바닥 위에,
// 올라갈 때는 위 끝이 헤더 밑에 보이도록 — 스크롤한 만큼 붙는 자리를 옮긴다. 들어가는 화면에서는 늘 헤더 밑이다.
const GAP = 16;

// 다음에 붙을 자리(화면 위에서 px). 상자가 헤더 밑 공간에 들어가면 늘 헤더 밑이고, 안 들어가면 스크롤한 만큼
// [아래 끝이 화면 바닥 위 ~ 위 끝이 헤더 밑] 사이에서 옮긴다. 이전이 없으면(처음) 헤더 밑.
export const 붙을자리 = ({ 이전, 스크롤변화, 헤더끝, 화면높이, 상자높이, 여백 = GAP }) => {
  const 위끝자리 = 헤더끝 + 여백;
  const 아래끝자리 = Math.min(위끝자리, 화면높이 - 상자높이 - 여백);
  if (이전 === null || 이전 === undefined) return 위끝자리;
  return Math.min(위끝자리, Math.max(아래끝자리, 이전 - 스크롤변화));
};

const headerBottom = () => {
  const header = document.querySelector('.storefront header') || document.querySelector('header');
  if (!header) return 0;
  const { position } = window.getComputedStyle(header);
  if (position !== 'fixed' && position !== 'sticky') return 0;
  return Math.max(0, header.getBoundingClientRect().bottom);
};

export default function StickyBelowHeader({ children, sx }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let top = null;
    let lastY = window.scrollY;
    let frame = 0;
    const place = () => {
      frame = 0;
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      // 휴대폰 폭에서는 부모 칸이 숨는다(display:none) — 잴 것이 없다
      if (el.offsetParent === null) return;
      top = 붙을자리({ 이전: top, 스크롤변화: dy, 헤더끝: headerBottom(), 화면높이: window.innerHeight, 상자높이: el.offsetHeight });
      el.style.top = `${Math.round(top)}px`;
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(place);
    };
    place();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // 결제수단을 고르면 상자 안에 결제하기가 생겨 높이가 바뀐다 — 그때도 다시 잰다
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    observer?.observe(el);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <Box ref={ref} sx={{ position: { md: 'sticky' }, top: GAP, ...sx }}>
      {children}
    </Box>
  );
}
