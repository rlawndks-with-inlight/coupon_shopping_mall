import CryptoJS from "crypto-js";

export const encryptAES256 = (text, secretKey) => {
    const key = CryptoJS.enc.Utf8.parse(secretKey); // 256비트 키 변환
    const encrypted = CryptoJS.AES.encrypt(text, key, {
        mode: CryptoJS.mode.ECB,  // AES-ECB 모드 사용
        padding: CryptoJS.pad.Pkcs7, // PKCS5Padding 적용 (CryptoJS에서는 Pkcs7로 설정)
    });
    //alert(text)
    return encrypted.toString(); // Base64로 자동 인코딩됨
};

export const decryptAES256 = (encryptedText, secretKey) => {
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8); // 원문 복원
};