import * as CryptoJS from 'crypto-js';
import {CryptoKey} from './crypto-key';

export class CryptoUtil {

    static encrypt(plaintText: any, cryptoKey: CryptoKey): string {
        const encryptedData = CryptoJS.AES.encrypt(plaintText, this.generateKey(cryptoKey.key, cryptoKey.salt), {
            iv:  CryptoJS.enc.Hex.parse(cryptoKey.iv),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }).ciphertext.toString();
        const encryptedHexStr = CryptoJS.enc.Hex.parse(encryptedData);
        const encryptedBase64Str = CryptoJS.enc.Base64.stringify(encryptedHexStr);
        return encryptedBase64Str;
    }

    static decrypt(encryptedBase64Str: any, cryptoKey: CryptoKey) {
        const decryptedData = CryptoJS.AES.decrypt(encryptedBase64Str, this.generateKey(cryptoKey.key, cryptoKey.salt), {
            iv:  CryptoJS.enc.Hex.parse(cryptoKey.iv),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        const decryptedStr = decryptedData.toString(CryptoJS.enc.Utf8);
        return decryptedStr;
    }

    private static generateKey(key, salt) {
        const passPhrase = CryptoJS.PBKDF2(
            key,
            CryptoJS.enc.Hex.parse(salt),
            {keySize: 256 / 32, iterations: 1000});
        return passPhrase;
    }
}
