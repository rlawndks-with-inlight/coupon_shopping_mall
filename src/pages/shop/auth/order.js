import { useRouter } from "next/router";
import ShopLayout from "src/layouts/shop/ShopLayout";
import OrderSheet from "src/views/shop/order/OrderSheet";

// 공용 주문서(주문/결제) 페이지 — 데모 무관 단일 화면.
// 장바구니의 '주문하기' 및 상품상세 '바로구매'가 이 페이지로 이동한다.
const Order = () => {
  const router = useRouter();
  return <OrderSheet router={router} />;
};

Order.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default Order;
