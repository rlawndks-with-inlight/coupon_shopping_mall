import { useEffect, useRef, useState } from 'react';
import { encryptAES256, decryptAES256 } from './encryption';
import { sha256 } from 'js-sha256'
import Button from '@mui/material/Button';
import { useSettingsContext } from 'src/components/settings';
import { apiManager } from './api';
import { makePayData } from './shop-util';

const PayProductsByHandFintree = ({ props }) => {
    const scriptRef = useRef(null);
    const { themeDnsData } = useSettingsContext()
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [products, payData, selectProductGroups] = props;

    const {
        user_id,
        buyer_name,
        buyer_phone,
        card_num,
        card_pw,
        yymm
    } = payData;

    let product_item = products;
    let select_product_groups = selectProductGroups;
    product_item.order_count = selectProductGroups?.count;
    select_product_groups = selectProductGroups?.groups;

    //console.log(props)

    //let products = products_;
    //let payData = payData_;
    let ord_num = `${user_id}${new Date().getTime().toString().substring(0, 11)}`
    let mid = 'hpftsugi1m'
    //let id = 'hamonyshop', 
    // tid = 'tester', 
    let apiKey = 'pgSettle30y739r82jtd709yOfZ2yK5K'
    let shaKey = 'ozImAPcI95NDe86AC2k757SAkpN5fFUlwwzr5qsKpXdYONTGHk9/V6xWn0fYeHaipdZEHuK7eVKayLEuMiuUTg=='
    //let user = 0;
    //let ver = 0;


    const handlePayment = async () => {

        const pay_data = await makePayData([{ ...product_item, groups: select_product_groups }], payData);
        //console.log(pay_data)

        const ymd = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const his = new Date().toISOString().split('T')[1].slice(0, 8).replace(/:/g, '');

        let yymm_ = yymm.replace('/', '');
        yymm_ = yymm_.slice(2) + yymm_.slice(0, 2);

        const returnUrl = `${window.location.protocol}//${window.location.host}/shop/auth/pay-result`
        const notiUrl = `https://thegrazia.com/api/transactions/fintree` //임시

        const productArray = Array.isArray(products) ? products : [products];

        const totalPrice = productArray.length > 1
            ? productArray.reduce((acc, product) => acc + Number(product.product_sale_price * product.order_count), 0)
            : Number(productArray[0].product_sale_price * productArray[0].order_count);

        const productNames = productArray.length > 1
            ? `${productArray[0].product_name} 외 ${productArray.length - 1}건`
            : productArray[0].product_name;

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
        console.log(pay_data)
        const params = {
            //...encParams,
            //...pay_data,
            payMethod: 'card',
            mid: mid,
            trxCd: '0',
            goodsNm: productNames,
            ordNo: ord_num,
            goodsAmt: String(totalPrice),
            ordNm: buyer_name,//themeDnsData?.name,
            ordTel: buyer_phone,
            //ordEmail: null,
            //userIp: null,
            //mbsReserved: null,
            //cpCd: null,
            cardNo: card_num,
            //cardTypeCd: null,
            expireYymm: yymm_,
            ordAuthNo: pay_data.auth_num,
            cardPw: card_pw,
            quotaMon: '00',
            noIntFlg: '0',
            pointFlg: '0',
            goodsSplAmt: '1',
            goodsVat: '1',
            goodsSvsAmt: '1',
            //channel: '0001',
            ediDate: ymd + his,
            encData: sha256(mid + ymd + his + String(totalPrice) + shaKey),
            products: pay_data.products,
            //lmtDay: 1,
            //notiUrl: notiUrl,
            //charset: null,
            //returnUrl: returnUrl
        };

        try {
            let insert_pay_ready = await apiManager('pays/hand_fintree', 'create', params);
            //console.log(insert_pay_ready)
            if (insert_pay_ready?.id > 0) {
                return {
                    ...payData,
                    trans_id: insert_pay_ready?.id
                };
            } else {
                return false;
            }

        } catch (err) {
            console.log(err);
            return false;
        }

    };

    return (
        <div>
            <Button variant='contained' onClick={() => { handlePayment() }}>
                결제하기
            </Button>
        </div>
    );
};

export default PayProductsByHandFintree