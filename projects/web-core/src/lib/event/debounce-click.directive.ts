import { Directive, EventEmitter, HostListener, OnInit, Output, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AppConfService } from '../service/app-conf.service';
import { Logger } from '../logger/logger';
@Directive({
  selector: '[appDebounceClick]'
})
export class DebounceClickDirective implements OnInit, OnDestroy {
  @Output() debounceClick = new EventEmitter();
  private clicks = new Subject<any>();
  private subscription: Subscription;
  dbtime = 500;
  constructor(private appConfService: AppConfService, private logger: Logger) {
    const time = this.appConfService.getValueByName('debounceTime');
    if (time) {
      this.dbtime = time;
    }
  }

  ngOnInit() {
    this.logger.debug('DebounceClickDirective->ngOnInit()->this.dbtime:', this.dbtime);
    this.subscription = this.clicks.pipe(debounceTime(this.dbtime)).subscribe(e => this.debounceClick.emit(e));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  @HostListener('click', ['$event'])
  clickEvent(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.clicks.next(event);
  }
}
