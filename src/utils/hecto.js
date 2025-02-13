import { useEffect, useRef, useState } from 'react';

export const onPayProductsByAuthHecto = (props) => {
    // const formRef = useRef(null);
    //const [scriptLoaded, setScriptLoaded] = useState(false);

    const {
        brand_id,
        brand_name,
        buying_count,
        id,
        order_count,
        product_code,
        product_name,
        product_sale_price,
        user_id,
    } = props;

    //let products = products_;
    //let payData = payData_;
    let ord_num = `${user_id}${new Date().getTime().toString().substring(0, 11)}`
    let mid = 'nxca_jt_il'
    //let id = 'hamonyshop', 
    // tid = 'tester', 
    let apiKey = 'pgSettle30y739r82jtd709yOfZ2yK5K'
    //let user = 0;
    //let ver = 0;

    const script = document.createElement('script');
    script.src = 'https://npg.settlebank.co.kr/resources/js/v1/SettlePG.js';
    script.async = true;
    //script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);


    const handlePayment = () => {
        /*
                if (!scriptLoaded) {
                    console.error('결제 스크립트가 로드되지 않았습니다.');
                    return;
                }
        
                const form = formRef.current;
                if (!form) return;
        */
        const ymd = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const his = new Date().toISOString().split('T')[1].slice(0, 8).replace(/:/g, '');

        const returnUrl = `${window.location.protocol}//${window.location.host}/shop/auth/pay-result`
        //const notiUrl = `${window.location.protocol}//${window.location.host}/shop` //임시

        const encParams = {
            trdAmt: product_sale_price,
            mchtCustNm: null,
            //cphoneNo: noti.buyer_phone,
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
            mchtCustId: tid,
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
            pktHash: window.btoa(mid + 'card' + ord_num + ymd + his + product_sale_price + apiKey),
            env: 'https://tbnpg.settlebank.co.kr',
            //notiUrl,
            nextUrl: returnUrl,
            cancUrl: returnUrl,
            cardType: 3,//form.cardType.value,
            //chainUserId: form.chainUserId.value,
            //cardGb: form.cardGb.value,
            ui: { type: 'self' },
        };

        SETTLE_PG.pay(params, (rsp) => {
            console.log('Payment Response:', rsp);
        });
        document.body.removeChild(script);

    };

    return (
        <div>
            <form /*ref={formRef}*/ id="STPG_payForm">
                <input type="text" name="cardType" placeholder="Card Type" />
                <input type="text" name="chainUserId" placeholder="Chain User ID" />
                <input type="text" name="cardGb" placeholder="Card GB" />
            </form>
            <button onClick={handlePayment}>결제하기</button>
        </div>
    );
};