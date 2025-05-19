import { useEffect, useRef, useState } from 'react';
import { encryptAES256, decryptAES256 } from './encryption';
import { sha256 } from 'js-sha256'
import Button from '@mui/material/Button';
import { useSettingsContext } from 'src/components/settings';
import { makePayData } from './shop-util';
import toast from 'react-hot-toast';

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
    let mid = 'chchhh001m'//'fintrtst1m' 테스트키
    //let id = 'hamonyshop', 
    // tid = 'tester', '
    let apiKey = 'pgSettle30y739r82jtd709yOfZ2yK5K'
    let shaKey = 'N4COCwG7yR88hkpVEVZydMj7aEZ8Q8p+/kVZIwBpqfJvD+pAEke7a32ytjZXA1RGIgqKjfTSvgfw81EXtM3djA=='//'Lg+QGq2qip/iI2sID1U951W++FLXmFlEM3CvQ8uf7rezi+SE/7ogXUPI1SMQ8chL1VCqOuHgPJLMKOZUTsl17A==' 테스트키
    //let user = 0;
    //let ver = 0;

    const make_pay_data = async (data) => {
        const productArray = Array.isArray(data) ? data : [data];
        const pay_data = await makePayData(productArray, payData);

        const pay_data_ = {
            ...pay_data,
            ord_num: `${pay_data?.user_id || pay_data?.password}${new Date().getTime().toString().substring(0, 11)}`,
        }
        if (pay_data_?.products?.length > 1 || !pay_data_?.item_name) {
            pay_data_.item_name = `${pay_data_?.products[0]?.order_name} 외 ${pay_data_?.products?.length - 1}`;
        }
        pay_data_.seller_id = themeDnsData?.seller_id
        pay_data_.agent_amount = data?.product_agent_price
        sessionStorage.setItem("products", JSON.stringify(pay_data_));
        //console.log(pay_data_)
    }

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
            input.value = params[key] !== undefined && params[key] !== null ? params[key] : "";
            form.appendChild(input);
        });

        document.body.appendChild(form);
        return form;
    }

    useEffect(() => {
        make_pay_data(products)
        window.addEventListener("message", (event) => {
            if (event.origin == "https://api.fintree.kr" && event.data[0] == 'SUCCESS') {

                const data = event.data;

                sessionStorage.setItem("fintreePaymentResult", JSON.stringify(data));
                window.location.href = "/shop/auth/pay-result";
            } else if (event.data[0] == 'CANCEL') {
                toast.error('결제가 취소되었습니다.');
                window.location.reload();
                return;
            } else {
                toast.error('문제가 발생했습니다.');
                window.location.reload();
                return;
            }
        });
    }, []);

    const handlePayment = () => {

        if (!scriptLoaded) {
            console.error('결제 스크립트가 로드되지 않았습니다.');
            return;
        }

        const ymd = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const his = new Date().toISOString().split('T')[1].slice(0, 8).replace(/:/g, '');

        const returnUrl = `${window.location.protocol}//${window.location.host}/shop/auth/pay-result`
        //const notiUrl = `https://thegrazia.com/api/transactions/fintree`

        const productArray = Array.isArray(products) ? products : [products];


        const totalPrice = productArray.length > 1
            ? productArray.reduce((acc, product) => acc + Number(product.order_amount * product.order_count), 0)
            : Number(productArray[0].order_amount * productArray[0].order_count);

        const productNames = productArray.length > 1
            ? `${productArray[0].order_name} 외 ${productArray.length - 1}건`
            : productArray[0].order_name;


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
            //goodsSplAmt: null, //0으로 보내든가 아예 보내지 말 것
            //goodsVat: null, //0으로 보내든가 아예 보내지 말 것
            //goodsSvsAmt: null, //0으로 보내든가 아예 보내지 말 것
            channel: null,
            period: null,
            ediDate: ymd + his,
            encData: sha256(mid + ymd + his + String(totalPrice) + shaKey),
            //notiUrl: notiUrl,
            charset: null,
            //authType: '02',
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