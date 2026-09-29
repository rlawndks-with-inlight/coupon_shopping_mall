import { forwardRef } from 'react';
import {
  LazyLoadImage as 원본LazyLoadImage,
  LazyLoadComponent,
  trackWindowScroll,
} from 'react-lazy-load-image-component/build/index.js';

// 'react-lazy-load-image-component' 를 import 하는 모든 곳이 이 파일을 받는다(next.config.js 의 alias).
//
// 왜: 이 라이브러리는 사진이 화면에 들어올 때까지 <img> 대신 빈 자리만 그린다.
// 인쇄·PDF 저장은 스크롤을 일으키지 않으므로, 열자마자 인쇄하면 아래쪽 상품 사진이 전부 빈칸으로 찍혔다
// (카드사 심사 화면, 2026-09-29).
// 그래서 <img> 는 처음부터 그리고, 늦게 받는 일은 브라우저 기본 기능(loading="lazy")에 맡긴다.
// 브라우저는 인쇄 직전에 lazy 사진을 알아서 다 받아 오므로 인쇄에도 실리고, 평소 지연 로딩도 그대로다.
// 호출하는 쪽이 loading 을 따로 주면 그 값이 이긴다.
export const LazyLoadImage = forwardRef((props, ref) => (
  <원본LazyLoadImage ref={ref} loading="lazy" {...props} visibleByDefault />
));
LazyLoadImage.displayName = 'LazyLoadImage';

export { LazyLoadComponent, trackWindowScroll };
