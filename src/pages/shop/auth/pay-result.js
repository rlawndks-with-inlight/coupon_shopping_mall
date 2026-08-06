import ShopLayout from "src/layouts/shop/ShopLayout";
import PayResultView from "src/views/shop/order/PayResultView";

// 결제결과 페이지 — 데모 구분 없는 공용 화면 한 벌.
//
// 기존엔 shop_demo_num 으로 9개 데모 화면(views/shop/demo-N/auth/pay-result.js)을 분기했는데,
// PG 복귀 URL 이 /shop/auth/pay-result 로 고정이라 블로그형 브랜드(shop_demo_num=0)도 여기로 오고
// 그 경우 어느 분기에도 안 걸려 '결제는 됐는데 화면이 백지' 가 됐다.
// 폴백으로 shop 데모1 화면을 붙였더니 이번엔 블로그 레이아웃 안에 쇼핑몰 톤 본문이 들어가 결이 어긋났다.
// → 주문완료(order-complete)와 같이 중립적인 공용 화면으로 통일한다.
//   레이아웃(헤더·푸터)은 ShopLayout 이 브랜드 유형에 맞게 감싸므로 각 프레임의 디자인이 유지된다.
//
// 기존 데모별 pay-result 뷰는 지우지 않고 남겨둔다(되돌릴 여지 + 다른 클라이언트 포크 대비).
const PayResult = () => <PayResultView />;

PayResult.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default PayResult;
