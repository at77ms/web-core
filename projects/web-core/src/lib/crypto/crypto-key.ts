export class CryptoKey {
    key: string;
    salt: string;
    iv: string;
    constructor(key: string, salt: string, iv: string) {
        this.key = key;
        this.salt = salt;
        this.iv = iv;
    }
}
