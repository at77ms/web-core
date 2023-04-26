
export class ReTree {

    constructor() {

    }

    public test(str: string , regex: any): any {
        const self = this;
        if (typeof regex === 'string') {
            regex = new RegExp(regex);
        }

        if (regex instanceof RegExp) {
            return regex.test(str);
        } else if (regex && Array.isArray(regex.and)) {
            return regex.and.every((item: any) => {
                return self.test(str, item);
            });
        } else if (regex && Array.isArray(regex.or)) {
            return regex.or.some((item: any) => {
                return self.test(str, item);
            });
        } else if (regex && regex.not) {
            return !self.test(str, regex.not);
        } else {
            return false;
        }
    }

    public exec(str: string, regex: any): any {
        const self = this;
        if (typeof regex === 'string') {
            regex = new RegExp(regex);
        }

        if (regex instanceof RegExp) {
            return regex.exec(str);
        } else if (regex && Array.isArray(regex)) {
            return regex.reduce((res: any, item: any) => {
                return (!!res) ? res : self.exec(str, item);
            }, null);
        } else {
            return null;
        }
    }
}
