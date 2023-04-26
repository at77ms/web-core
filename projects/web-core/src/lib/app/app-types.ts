import { CryptoKey } from '../crypto/crypto-key';

export class AppInfo {
    window: Window;
    appInstanceId?: string;
    openedSeqNo?: number;
    isAppAuthKeyAcknowledged?: boolean;

    constructor(window: Window) {
        this.window = window;
    }
}

export class AppAuthKey {
    tokenStorageKey: string;
    cryptoKey: CryptoKey;

    constructor(tokenStorageKey: string, cyptoKey: CryptoKey) {
        this.tokenStorageKey = tokenStorageKey;
        this.cryptoKey = cyptoKey;
    }
}
