import { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import toast from "react-hot-toast";
import { useSettingsContext } from "src/components/settings";
import { makePayData } from "./shop-util";

const PayProductsByAuthWayup = ({ props }) => {
    const scriptRef = useRef(null);
    const wayupPayRef = useRef(null);

    const { themeDnsData } = useSettingsContext();
    const [scriptLoaded, setScriptLoaded] = useState(false);

    const [products, payData] = props;

    const { user_id, buyer_name, buyer_phone, buyer_email } = payData || {};

    // WAYUP 공개키 (필수) - 발급 받은 publicKey로 교체
    const WAYUP_PUBLIC_KEY = 'pk_17663765931177cc1';

    // 환경별 SDK URL (테스트/운영)
    // 테스트
    const WAYUP_SDK_SRC = "https://teapi.wayup.co.kr/static/cko/sdk/wayup-sdk.js";
    // const WAYUP_SDK_SRC = "https://eapi.wayup.co.kr/static/cko/sdk/wayup-sdk.js";

    const make_pay_data = async (data) => {
        const productArray = Array.isArray(data) ? data : [data];
        const pay_data = await makePayData(productArray, payData);

        const pay_data_ = {
            ...pay_data,
            ord_num: `${pay_data?.user_id || pay_data?.password}${new Date().getTime().toString().substring(0, 11)}`,
        };

        if (pay_data_?.products?.length > 1 || !pay_data_?.item_name) {
            pay_data_.item_name = `${pay_data_?.products[0]?.order_name} 외 ${pay_data_?.products?.length - 1}`;
        }

        pay_data_.seller_id = themeDnsData?.seller_id;
        pay_data_.agent_amount = Array.isArray(data)
            ? data.reduce((sum, item) => sum + (item?.product_agent_price || 0), 0)
            : data?.product_agent_price;

        sessionStorage.setItem("products", JSON.stringify(pay_data_));
    };

    // WAYUP 결제용 form 생성 (SDK에 body로 넘김)
    function createWayupPaymentForm({ trackId, amount, directMethod, returnUrl, failureUrl, udf, products, customer }) {
        // 기존 폼 제거(중복 방지)
        const prev = document.getElementById("__WAYUP_FORM__");
        if (prev) prev.remove();

        const form = document.createElement("form");
        form.id = "__WAYUP_FORM__";
        form.name = "frm";
        form.action = "/";
        form.method = "POST";

        const appendHidden = (name, value) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = name;
            input.value = value !== undefined && value !== null ? String(value) : "";
            form.appendChild(input);
        };

        // 필수(문서 기준)
        appendHidden("trackId", trackId);
        appendHidden("amount", amount);
        appendHidden("directMethod", directMethod);
        appendHidden("returnUrl", returnUrl);
        appendHidden("failureUrl", failureUrl || returnUrl);

        // 선택 udf1~3
        appendHidden("udf1", udf?.udf1);
        appendHidden("udf2", udf?.udf2);
        appendHidden("udf3", udf?.udf3);

        // (선택) 세금 필드 - 필요 없으면 빈 값/0 처리
        appendHidden("taxFree", 0);
        appendHidden("supply", 0);
        appendHidden("vat", 0);
        appendHidden("service", 0);

        // 상품: 문서 예시는 productName/productQty/productPrice를 상품 개수만큼 반복 가능 형태
        (products || []).forEach((p) => {
            appendHidden("productName", p?.name || "");
            appendHidden("productQty", p?.qty || 1);
            appendHidden("productPrice", p?.price || 0);
        });

        // 고객
        appendHidden("customerName", customer?.name);
        appendHidden("customerEmail", customer?.email);
        appendHidden("customerPhoneNo", customer?.phoneNo);
        appendHidden("customerMemberId", customer?.memberId);

        // 주소(선택) — 필요하면 채워 넣기
        appendHidden("billAddr1", "");
        appendHidden("billAddr2", "");
        appendHidden("billZipCode", "");
        appendHidden("shipAddr1", "");
        appendHidden("shipAddr2", "");
        appendHidden("shipZipCode", "");

        document.body.appendChild(form);
        return form;
    }

    // SDK 스크립트 로드 + 인스턴스 생성
    useEffect(() => {
        const script = document.createElement("script");
        script.src = WAYUP_SDK_SRC;
        script.async = true;

        script.onload = () => {
            try {
                if (!window.WAYUP) {
                    console.error("WAYUP SDK 로드 후에도 window.WAYUP이 없습니다.");
                    toast.error("결제 모듈 로드에 실패했습니다.");
                    return;
                }

                // viewType: iframe으로 두면 callback을 받아서 set()까지 여기서 처리 가능
                wayupPayRef.current = window.WAYUP({
                    publicKey: WAYUP_PUBLIC_KEY,
                    viewType: "iframe",
                    debug: true,
                });

                setScriptLoaded(true);
            } catch (e) {
                console.error(e);
                toast.error("결제 모듈 초기화에 실패했습니다.");
            }
        };

        script.onerror = () => {
            toast.error("결제 스크립트 로드 실패");
        };

        document.body.appendChild(script);
        scriptRef.current = script;

        return () => {
            // 생성해둔 폼 제거
            const prev = document.getElementById("__WAYUP_FORM__");
            if (prev) prev.remove();

            // 스크립트 제거
            if (scriptRef.current) {
                document.body.removeChild(scriptRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 최초 products/payData 세션 저장
    useEffect(() => {
        make_pay_data(products);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePayment = async () => {
        if (!scriptLoaded || !wayupPayRef.current) {
            toast.error("결제 스크립트가 아직 로드되지 않았습니다.");
            return;
        }

        const productArray = Array.isArray(products) ? products : [products];

        const totalPrice =
            productArray.length > 1
                ? productArray.reduce((acc, p) => acc + Number(p.order_amount) * Number(p.order_count), 0)
                : Number(productArray[0].order_amount) * Number(productArray[0].order_count);

        const trackId = `${user_id}${new Date().getTime().toString().substring(0, 11)}`;

        const returnUrl = `${window.location.protocol}//${window.location.host}/shop/auth/pay-result`;
        const failureUrl = returnUrl;

        // WAYUP 상품 배열(반복 필드로 넣기 위해)
        const wayupProducts = productArray.map((p) => ({
            name: p?.order_name || "",
            qty: Number(p?.order_count || 1),
            price: Number(p?.order_amount || 0),
        }));

        // 합계 검증(문서에서 “상품 합계 = 총액” 강조)
        const productsSum = wayupProducts.reduce((sum, p) => sum + p.price * p.qty, 0);
        if (productsSum !== totalPrice) {
            toast.error("상품 금액 합계가 총 결제금액과 일치하지 않습니다.");
            return;
        }

        // 결제 요청 폼 생성
        const form = createWayupPaymentForm({
            trackId,
            amount: totalPrice, // 원화는 정수 권장
            directMethod: "card_3d",
            returnUrl,
            failureUrl,
            udf: {
                udf1: themeDnsData?.seller_id || "",
                udf2: String(user_id || ""),
                udf3: "",
            },
            products: wayupProducts,
            customer: {
                name: buyer_name || "",
                email: buyer_email || "",
                phoneNo: buyer_phone || "",
                memberId: String(user_id || ""),
            },
        });

        try {
            // 결제 호출
            wayupPayRef.current.payment({
                body: form, // form 태그 또는 json
                callback: async (data) => {
                    // 인증 결과(data) 저장
                    sessionStorage.setItem("wayupAuthResult", JSON.stringify(data));

                    if (data?.resultCd === "0000") {
                        // 인증 성공 → 결제 확정(SET)
                        const setRes = await wayupPayRef.current.set();
                        sessionStorage.setItem("wayupSetResult", JSON.stringify(setRes));

                        if (setRes?.resultCd === "0000") {
                            window.location.href = "/shop/auth/pay-result";
                            return;
                        }

                        toast.error(setRes?.resultMsg || setRes?.message || "결제 확정(SET)에 실패했습니다.");
                        return;
                    }

                    // 인증 실패/취소
                    toast.error(data?.resultMsg || data?.message || "결제가 취소되었거나 실패했습니다.");
                },
            });
        } catch (e) {
            console.error(e);
            toast.error("결제 호출 중 오류가 발생했습니다.");
        }
    };

    return (
        <div>
            <Button style={{ border: "1px solid black", color: "black" }} onClick={handlePayment}>
                결제창으로 이동하시려면 눌러주세요.
            </Button>
        </div>
    );
};

export default PayProductsByAuthWayup;
