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

// 대표이미지 + 서브이미지를 한 배열로 만든다. fix 는 각 프레임의 fixImgUrl.
export const buildProductImages = (item, fix = (u) => u) => [
  item?.product_img,
  ...((item?.sub_images ?? []).map((s) => s?.product_sub_img)),
]
  .filter(Boolean)
  .map(fix);

export default ProductThumbs;
