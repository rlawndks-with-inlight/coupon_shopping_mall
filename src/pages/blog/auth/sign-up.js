import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import Demo1 from "src/views/blog/auth/sign-up/demo-1";
import { useSettingsContext } from "src/components/settings";
import Demo2 from "src/views/blog/auth/sign-up/demo-2";
import Demo3 from "src/views/blog/auth/sign-up/demo-3";
import Demo4 from "src/views/blog/auth/sign-up/demo-4";
import Demo5 from "src/views/blog/auth/sign-up/demo-5";

const getDemo = (num, common) => {
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
    return <Demo2 {...common} />
}
const SignUp = () => {
    const router = useRouter();
    const { themeDnsData } = useSettingsContext();

    return (
        <>
            {getDemo(themeDnsData?.blog_demo_num, {
                data: {
                },
                func: {
                    router
                },
            })}
        </>
    )
}
SignUp.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default SignUp;
