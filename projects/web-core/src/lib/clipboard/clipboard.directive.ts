import { Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { ClipboardService } from './clipboard.service';

@Directive({
    selector: '[clipboard]'
})
export class ClipboardDirective implements OnInit, OnDestroy {
    @Input('clipboard')
    public targetElm: HTMLInputElement;
    @Input()
    public container: HTMLInputElement;

    @Input()
    public cbContent: string;

    @Output()
    public cbOnSuccess: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    public cbOnError: EventEmitter<any> = new EventEmitter<any>();
    constructor(private clipboardSrv: ClipboardService) {}

    public ngOnInit() {}

    public ngOnDestroy() {
        this.clipboardSrv.destroy(this.container);
    }

    @HostListener('click', ['$event.target'])
    public onClick(event: Event) {
        if (!this.clipboardSrv.isSupported) {
            this.handleResult(false, undefined);
        } else if (this.targetElm && this.clipboardSrv.isTargetValid(this.targetElm)) {
            this.handleResult(this.clipboardSrv.copyFromInputElement(this.targetElm), this.targetElm.value);
        } else if (this.cbContent) {
            this.handleResult(this.clipboardSrv.copyFromContent(this.cbContent, this.container), this.cbContent);
        }
    }

    /**
     * Fires an event based on the copy operation result.
     * @param succeeded a boolean value
     */
    private handleResult(succeeded: boolean, copiedContent: string | undefined) {
        if (succeeded) {
            this.cbOnSuccess.emit({ isSuccess: true, content: copiedContent });
        } else {
            this.cbOnError.emit({ isSuccess: false });
        }
    }
}
