import { useRouter } from "next/router";
import { useEffect } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";

// /shop/guide/* 3종(위탁 가이드 등)은 지금 어느 프레임에도 없는 화면이다.
//
// 원래 이 자리에 있던 화면은 최초 템플릿 브랜드의 홍보 문구가 그대로 박힌 것이라
// 화면도 진입 링크(헤더·푸터·홈)도 전부 주석 처리돼 있었다. 그런데 페이지 파일은 남아
// getDemo 가 undefined 를 반환했고, 주소로 직접 들어오면 헤더·푸터만 있는 백지가 떴다.
//
// 남의 브랜드 문구를 되살릴 수는 없으므로 홈으로 보낸다.
// 가맹점별 안내가 필요해지면 게시판(공지사항)이나 메인페이지 관리로 만드는 쪽이 맞다.
const ConsignmentGuide = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace('/shop');
  }, []);
  return null;
};
ConsignmentGuide.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default ConsignmentGuide;
