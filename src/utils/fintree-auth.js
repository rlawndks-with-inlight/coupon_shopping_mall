import { useEffect, useRef, useState } from 'react';
import { encryptAES256, decryptAES256 } from './encryption';
import { sha256 } from 'js-sha256'
import Button from '@mui/material/Button';
import { useSettingsContext } from 'src/components/settings';

const PayProductsByAuthFintree = ({ props }) => {
    const scriptRef = useRef(null);
    const { themeDnsData } = useSettingsContext()
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [products, payData] = props;

    const {
        user_id,
        buyer_name,
        buyer_phone
    } = payData;

    //console.log(props)

    //let products = products_;
    //let payData = payData_;
    let ord_num = `${user_id}${new Date().getTime().toString().substring(0, 11)}`
    let mid = 'chchhh001m'
    //let id = 'hamonyshop', 
    // tid = 'tester', 
    let apiKey = 'pgSettle30y739r82jtd709yOfZ2yK5K'
    let shaKey = 'N4COCwG7yR88hkpVEVZydMj7aEZ8Q8p+/kVZIwBpqfJvD+pAEke7a32ytjZXA1RGIgqKjfTSvgfw81EXtM3djA=='
    //let user = 0;
    //let ver = 0;

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://api.fintree.kr/js/v1/pgAsistant.js';
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        document.body.appendChild(script);
        scriptRef.current = script;
        return () => {
            if (scriptRef.current) {
                document.body.removeChild(scriptRef.current);
            }
        };
    }, []);

    function createPaymentForm(params) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://api.fintree.kr/v1/payInit";  // API URL
        form.target = "pgPayFrame";  // iframe 결제 방식

        // params 객체의 모든 키-값을 input 요소로 추가
        Object.keys(params).forEach(key => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = params[key] || "";  // 값이 없으면 빈 문자열
            form.appendChild(input);
        });

        document.body.appendChild(form);
        return form;
    }


    const handlePayment = () => {

        if (!scriptLoaded) {
            console.error('결제 스크립트가 로드되지 않았습니다.');
            return;
        }

        const ymd = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const his = new Date().toISOString().split('T')[1].slice(0, 8).replace(/:/g, '');

        const returnUrl = `${window.location.protocol}//${window.location.host}/shop/auth/pay-result`
        const notiUrl = `${window.location.protocol}//${window.location.host}/shop` //임시

        const totalPrice = products.length > 1
            ? products.reduce((acc, product) => acc + Number(product.product_sale_price * product.order_count), 0)
            : Number(products.product_sale_price * products.order_count)
        const productNames = products.length > 1
            ? `${products[0].product_name} 외 ${products.length - 1}건`
            : products.product_name;

        const encParams = {
            trdAmt: encryptAES256(String(totalPrice), apiKey),
            mchtCustNm: encryptAES256(buyer_name, apiKey),
            cphoneNo: encryptAES256(buyer_phone, apiKey),
            email: null,
            taxAmt: null,
            vatAmt: null,
            taxFreeAmt: null,
            svcAmt: null,
            clipCustNm: null,
            clipCustCi: null,
            clipCustPhoneNo: null,
        };

        const params = {
            //...encParams,
            payMethod: 'card',
            mid: mid,
            trxCd: '0',
            goodsNm: productNames,
            ordNo: ord_num,
            goodsAmt: String(totalPrice),
            ordNm: themeDnsData?.name,
            ordTel: buyer_phone,
            ordEmail: null,
            userIp: null,
            mbsReserved: null,
            goodsSplAmt: null,
            goodsVat: null,
            goodsSvsAmt: null,
            channel: null,
            period: null,
            ediDate: ymd + his,
            encData: sha256(mid + ymd + his + String(totalPrice) + shaKey),
            notiUrl: notiUrl,
            charset: null,
        };

        const form = createPaymentForm(params);
        SendPay(form);

    };

    return (
        <div>
            <Button style={{ border: `1px solid black`, color: 'black' }} onClick={() => { handlePayment() }}>
                {'결제창으로 이동하시려면 눌러주세요.'}
            </Button>
        </div>
    );
};

export default PayProductsByAuthFintree