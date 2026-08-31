import styled from 'styled-components';

// 상품 서브이미지 썸네일 줄 — 블로그형 프레임(6~11) 상품상세용.
//
// 이 프레임들은 대표이미지(product_img) 한 장만 그렸다. 관리자에서 서브이미지를 아무리
// 올려도 고객 화면에는 나오지 않아서, 옷·가방처럼 여러 컷이 필요한 상품은 사실상 한 컷만
// 보고 사야 했다.
//
// 프레임마다 색·모서리 처리가 달라 색을 직접 정하지 않는다 — 테두리는 currentColor 를 따른다.
// 이미지가 한 장뿐이면 아무것도 그리지 않는다(빈 줄이 생기지 않게).

const Strip = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`
const Thumb = styled.button`
  width: 64px;
  height: 64px;
  padding: 0;
  border: 1px solid currentColor;
  background-color: transparent;
  background-image: ${(p) => `url(${p.$src})`};
  background-size: cover;
  background-position: center;
  cursor: pointer;
  opacity: ${(p) => (p.$active ? 1 : 0.45)};
  transition: opacity 0.15s ease;
  &:hover { opacity: 1; }
`

const ProductThumbs = ({ images = [], activeIndex = 0, onSelect, className }) => {
  if (!Array.isArray(images) || images.length < 2) return null;
  return (
    <Strip className={className}>
      {images.map((src, idx) => (
        <Thumb
          key={`${src}-${idx}`}
          type="button"
          aria-label={`이미지 ${idx + 1}`}
          $src={src}
          $active={idx === activeIndex}
          onClick={() => onSelect && onSelect(idx)}
        />
      ))}
    </Strip>
  );
};

// 큰 사진을 손가락으로 밀어 넘기기.
//
// [왜 필요한가 — 2026-08-31 제보]
// "모바일에서 상품 슬라이드가 드래그가 안 된다."
// 확인해 보니 프레임5·6(블로그 4·9번)의 사진 영역은 **슬라이더가 아니라 그냥 <img> 한 장**이다.
// 사진을 바꾸려면 아래 썸네일을 눌러야만 했다. 실제로 사진 4장짜리 상품에서
// 큰 사진을 밀어도 그대로였고(썸네일을 눌러야만 바뀜) 제보 그대로였다.
// 휴대폰에서 상품 사진은 미는 것이 기본 동작이라, 미는 길을 열어 준다.
//
// [왜 슬라이더를 안 넣나]
// 이 프레임들의 사진 영역은 프레임마다 모양이 다르다(둥근 블롭, 세로 긴 칸 등).
// react-slick 을 끼우면 그 모양이 깨진다. 사진을 바꾸는 주체는 이미 imgIdx 라
// **손가락 동작만 얹으면 된다** — 썸네일과 같은 상태를 쓰므로 둘이 항상 맞는다.
//
// ⚠ 세로 스크롤을 막지 않는다.
//   preventDefault 를 부르지 않고, 가로로 더 많이 움직였을 때만 사진을 넘긴다.
//   (React 는 onTouchMove 를 passive 로 걸어서 preventDefault 가 먹지도 않는다)
// ⚠ 끝에서는 멈춘다(순환하지 않는다) — 썸네일도 순환하지 않으므로 맞춘다.
// ⚠ 훅이 아니라 그냥 함수다. 일부러 그렇게 만들었다.
//   이 프레임들은 `if (notFound) return ...` / `if (!item) return ...` 가
//   images 를 만드는 줄보다 **위에** 있다. 훅으로 만들면 그 자리에서는 부를 수 없고
//   (조건부 호출 → 훅 순서가 깨져 화면이 백지가 된다), 위로 올리자니 images 가 아직 없다.
//   손가락은 한 번에 하나뿐이고 누른 뒤 뗄 때까지가 한 동작이라, 시작점은 모듈에 둬도 된다.
let 터치시작 = null;
const 미는거리 = 40; // 이보다 적게 움직이면 '민 것'이 아니라 '누른 것'으로 본다

export const imageSwipeHandlers = (images = [], index = 0, onSelect) => {
  const 장수 = Array.isArray(images) ? images.length : 0;
  if (장수 < 2 || typeof onSelect !== 'function') return {};
  return {
    onTouchStart: (e) => {
      const t = e.touches?.[0];
      터치시작 = t ? { x: t.clientX, y: t.clientY } : null;
    },
    onTouchEnd: (e) => {
      const s = 터치시작;
      터치시작 = null;
      const t = e.changedTouches?.[0];
      if (!s || !t) return;
      const dx = t.clientX - s.x;
      const dy = t.clientY - s.y;
      // 세로로 더 많이 움직였으면 화면을 굴린 것이다 — 사진을 건드리지 않는다.
      if (Math.abs(dx) < 미는거리 || Math.abs(dx) <= Math.abs(dy)) return;
      const 다음 = dx < 0 ? index + 1 : index - 1;
      if (다음 < 0 || 다음 > 장수 - 1) return;
      onSelect(다음);
    },
  };
};

// 대표이미지 + 서브이미지를 한 배열로 만든다. fix 는 각 프레임의 fixImgUrl.
export const buildProductImages = (item, fix = (u) => u) => [
  item?.product_img,
  ...((item?.sub_images ?? []).map((s) => s?.product_sub_img)),
]
  .filter(Boolean)
  .map(fix);

export default ProductThumbs;
