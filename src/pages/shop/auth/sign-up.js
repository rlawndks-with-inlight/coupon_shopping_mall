import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";

import { SignUpDemo1 } from "src/views/shop/demo-1";
import { SignUpDemo2 } from "src/views/shop/demo-2";
import { SignUpDemo3 } from "src/views/shop/demo-3";
import { SignUpDemo4 } from "src/views/shop/demo-4";
import { SignUpDemo5 } from "src/views/shop/demo-5";
import { SignUpDemo6 } from "src/views/shop/demo-6";
import { SignUpDemo7 } from "src/views/shop/demo-7";
import { SignUpDemo8 } from "src/views/shop/demo-8";
import { SignUpDemo9 } from "src/views/shop/demo-9";
import { isBlogBrand } from "src/utils/blog-shop-route";
import Blog_Demo1 from "src/views/blog/auth/sign-up/demo-1";
import Blog_Demo2 from "src/views/blog/auth/sign-up/demo-2";
import Blog_Demo3 from "src/views/blog/auth/sign-up/demo-3";
import Blog_Demo4 from "src/views/blog/auth/sign-up/demo-4";
import Blog_Demo5 from "src/views/blog/auth/sign-up/demo-5";
//import { SignUpDemo10 } from "src/views/shop/demo-10";

// 블로그형 브랜드용 화면. URL 을 /shop 으로 통일하면서 blog 페이지의 뷰 선택을 여기로 옮겼다.
const getBlogDemo = (num, common) => {
    // 모든 blog 프레임 회원가입을 demo-2 로 수렴 — 장바구니·검색과 같은 방식.
    //
    // 기존: demo-1/3/4/5 는 폼만 있고 `auth/sign-up` API 를 아예 호출하지 않는다.
    //       (apiManager import 조차 없다) 마지막 '완료' 버튼이 setActiveStep(+1) 만 해서
    //       입력을 다 채워도 계정이 만들어지지 않고 '축하합니다' 화면만 떴다.
    //       → 프레임4(blog:1)·6(blog:4)·7(blog:5) 에서 회원가입이 불가능했다.
    //       거기에 '휴대폰 번호 인증' 단계도 껍데기로 살아 있어(인증완료=다음단계 이동)
    //       의미 없는 단계가 하나 더 끼어 있었다.
    // demo-2 는 회원가입 API 가 붙어 있고 휴대폰 인증 단계도 이미 꺼져 있다.
    //
    // 보안질문은 blog 가입폼에 없지만, 로그인 후 ShopLayout 의 SecurityQuestionBanner 가
    // 미설정 회원에게 등록을 안내하므로 비밀번호 찾기 경로는 유지된다.
    return <Blog_Demo2 {...common} />
}

// 첫 인자가 데모번호가 아니라 브랜드 정보다 — 어떤 화면을 보여줄지는 경로가 아니라
// 브랜드 유형으로 정한다(/blog 경로를 /shop 으로 통일하면서 바뀐 규칙).
const getDemo = (dns, common) => {
  if (isBlogBrand(dns)) return getBlogDemo(dns?.blog_demo_num, common);
  const num = dns?.shop_demo_num;

  if (num == 1)
    return <SignUpDemo1 {...common} />
  else if (num == 2)
    return <SignUpDemo2 {...common} />
  else if (num == 3)
    return <SignUpDemo3 {...common} />
  else if (num == 4)
    return <SignUpDemo4 {...common} />
  else if (num == 5)
    return <SignUpDemo5 {...common} />
  else if (num == 6)
    return <SignUpDemo6 {...common} />
  else if (num == 7)
    return <SignUpDemo7 {...common} />
  else if (num == 8)
    return <SignUpDemo8 {...common} />
  else if (num == 9)
    return <SignUpDemo9 {...common} />
  /*else if (num == 10)
    return <SignUpDemo10 {...common} />*/
}
const SignUp = () => {
  const router = useRouter();
  const { themeDnsData } = useSettingsContext();

  return (
    <>
      {themeDnsData?.is_closure == 1 ?
        <>
          {getDemo(themeDnsData, {
            data: {
            },
            func: {
              router
            },
          })}
        </>
        :
        <>
          <ShopLayout>
            {getDemo(themeDnsData, {
              data: {
              },
              func: {
                router
              },
            })}
          </ShopLayout>
        </>}
    </>
  )
}
export default SignUp;
