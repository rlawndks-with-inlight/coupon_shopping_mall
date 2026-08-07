import { useEffect } from "react";
import { useRouter } from "next/router";

// /blog 경로는 /shop 으로 통일했다. 이 파일은 옛 주소로 들어온 방문자를 넘겨주기만 한다.
// (화면은 /shop 쪽 페이지가 브랜드 유형을 보고 고른다)
// 남은 옛 링크가 404 로 죽지 않도록 지우지 않고 리다이렉트로 둔다.
const Redirect = () => {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    // 쿼리스트링은 그대로 넘긴다(?type=0 같은 탭 지정이 살아 있어야 한다).
    const qs = router.asPath.split('?')[1];
    router.replace('/shop/auth/cart' + (qs ? `?${qs}` : ''));
  }, [router.isReady]);

  return <></>;
};

export default Redirect;
