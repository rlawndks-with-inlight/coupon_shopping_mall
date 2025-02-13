import { useEffect, useRef, useState } from 'react';
import { encryptAES256, decryptAES256 } from './encryption';
import { sha256 } from 'js-sha256'

const PayProductsByAuthHecto = ({ props }) => {
    const scriptRef = useRef(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [product, payData] = props;
    const {
        brand_id,
        brand_name,
        buying_count,
        id,
        order_count,
        product_code,
        product_name,
        product_sale_price,
    } = product;

    const {
        user_id,
        buyer_name,
        buyer_phone
    } = payData;

    //console.log(props)

    //let products = products_;
    //let payData = payData_;
    let ord_num = `${user_id}${new Date().getTime().toString().substring(0, 11)}`
    let mid = 'nxca_jt_il'
    //let id = 'hamonyshop', 
    // tid = 'tester', 
    let apiKey = 'pgSettle30y739r82jtd709yOfZ2yK5K'
    let shaKey = 'ST1009281328226982205'
    //let user = 0;
    //let ver = 0;

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://npg.settlebank.co.kr/resources/js/v1/SettlePG.js';
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


    const handlePayment = () => {

        if (!scriptLoaded) {
            console.error('결제 스크립트가 로드되지 않았습니다.');
            return;
        }

        const ymd = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const his = new Date().toISOString().split('T')[1].slice(0, 8).replace(/:/g, '');

        const returnUrl = `${window.location.protocol}//${window.location.host}/shop/auth/pay-result`
        const notiUrl = `${window.location.protocol}//${window.location.host}/shop` //임시

        const encParams = {
            trdAmt: encryptAES256(String(product_sale_price), apiKey),
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
            ...encParams,
            mchtId: mid,
            method: 'card',
            trdDt: ymd,
            trdTm: his,
            mchtTrdNo: ord_num,
            mchtName: id,
            mchtEName: id,
            pmtPrdtNm: product_name,
            custAcntSumry: null,
            expireDt: null,
            mchtParam: {},
            telecomCd: null,
            prdtTerm: null,
            taxTypeCd: null,//user.tax_category_type ? 'Y' : 'N',
            mchtCustId: null,//tid,
            certNotiUrl: null,
            skipCd: 'Y',
            multiPay: '',
            autoPayType: '',
            linkMethod: '',
            appScheme: '',
            instmtMon: /*noti.installment*/null,
            custIp: /*window.location.hostname*/null,
            corpPayCode: '',
            corpPayType: '',
            cashRcptUIYn: '',
            respMchtParam: null,
            pktHash: sha256(mid + 'card' + ord_num + ymd + his + String(product_sale_price) + shaKey),
            env: 'https://tbnpg.settlebank.co.kr',
            notiUrl: notiUrl,
            nextUrl: returnUrl,
            cancUrl: returnUrl,
            cardType: 3,//form.cardType.value,
            chainUserId: null,//form.chainUserId.value,
            cardGb: null,//form.cardGb.value,
            ui: { type: 'self' },
        };

        SETTLE_PG.pay(params, (rsp) => {
            console.log('Payment Response:', rsp);
        });

    };

    return (
        <div>
            <button onClick={handlePayment}>결제하기</button>
        </div>
    );
};

export default PayProductsByAuthHecto