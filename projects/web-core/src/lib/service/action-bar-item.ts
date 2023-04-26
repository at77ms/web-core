export enum ButtonType {
    CLOSE_FILE,
    PREVIOUS,
    NEXT,
    CONFIRM
}

export class ActionBarItem {
    label: string;
    name: string;
    btnClass: string;
    buttonType: ButtonType;
    sync: boolean;
    items: ActionBarItem[];
    disabled = false;

    constructor(label: string, btnClass: string, buttonType: ButtonType, items: ActionBarItem[], sync: boolean = true) {
        this.label = label;
        this.btnClass = btnClass;
        this.buttonType = buttonType;
        this.items = items;
        this.sync = sync;
    }

    command(source: any, handler?: any) {

    }
}
