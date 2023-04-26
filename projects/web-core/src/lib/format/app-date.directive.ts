import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidatorFn } from '@angular/forms';
import { AppConfService } from '../service/app-conf.service';



@Directive({
    selector: '[appDateCheck]',
    providers: [{ provide: NG_VALIDATORS, useExisting: AppDateDirective, multi: true }]
})
export class AppDateDirective implements Validator {

    constructor(private el: ElementRef) { }

    validate(control: AbstractControl): { [key: string]: any; } {
        const inputDate: string = control.value;
        if (!inputDate) { return null; }
        if (inputDate.length !== 10 || inputDate.toUpperCase().endsWith('Y')) { return { dateCheckNotPass: true }; }

        const format: string = AppConfService.getInstance().getDateFormat();

        if ((!format || format.toUpperCase() === 'MM/DD/YYYY')) {
            const dateArray = inputDate.split('/');
            if (dateArray && dateArray.length === 3) {
                const year = Number(dateArray[2]);
                const month = Number(dateArray[0]);
                const day = Number(dateArray[1]);
                const d = new Date(year, month - 1, day);
                return (d.getFullYear() === year && (d.getMonth() + 1) === month && d.getDate() === day)
                    ? null : { dateCheckNotPass: true };
            }
        }
        return null;
    }
}
