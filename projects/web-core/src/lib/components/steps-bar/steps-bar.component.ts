import { Component, OnInit, ViewEncapsulation, OnDestroy, ElementRef, Renderer2, AfterViewChecked } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { StepBarService } from '../../service';
import { Logger } from '../../logger';

@Component({
  selector: 'app-steps-bar',
  templateUrl: './steps-bar.component.html',
  encapsulation: ViewEncapsulation.None
})

export class StepsBarComponent implements OnInit, OnDestroy, AfterViewChecked {
  steps: MenuItem[];
  currentStepIndex = 0;
  averageWidth: string;
  constructor(public stepBarService: StepBarService, private el: ElementRef,
              private renderer2: Renderer2, private logger: Logger) { }

  ngOnInit() {
    this.stepBarService.stepsSubject.subscribe((data: any) => {
      this.steps = data;
      this.logger.debug('StepsBarComponent.steps', this.steps);
    });
    this.stepBarService.currStepsSubject.subscribe((data: any) => {
      this.currentStepIndex = data;
      this.logger.debug('StepsBarComponent.currentStepIndex', this.currentStepIndex);
    });
  }

  ngAfterViewChecked() {
    if (this.steps && this.steps.length > 0) {
      const stepItems = this.el.nativeElement.querySelectorAll('#step-bar .ui-steps-item');
      this.averageWidth = Math.floor((100 / this.steps.length) * 100) / 100 + '%';
      this.logger.debug('StepsBarComponent.ngAfterViewChecked.averageWidth', this.averageWidth);
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < stepItems.length; i++) {
        this.renderer2.setStyle(stepItems[i], 'width', this.averageWidth, 1);
      }
    }
  }

  ngOnDestroy() {

  }

}
