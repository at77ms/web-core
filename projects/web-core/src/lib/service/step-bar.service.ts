import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Logger } from '../logger/logger';

@Injectable({
  providedIn: 'root'
})
export class StepBarService implements OnDestroy {
  private stepFlow: any[] = [];
  private currentStepIndex: number;
  stepsSubject = new Subject<any[]>();
  currStepsSubject = new Subject<number>();

  constructor(private logger: Logger) {
  }

  setCurrentStep(currentStepIndex: number) {
    this.currentStepIndex = currentStepIndex;
    this.currStepsSubject.next(currentStepIndex);
  }

  setSteps(menuItems: any[]) {
    if (menuItems) {
      this.stepsSubject.next(menuItems);
    }
  }

  private refreshStepBar(currentStepIndex: number, currentStepCode: string, queryParams: any) {
    this.setCurrentStep(currentStepIndex);
    this.refreshMenuItems(currentStepIndex, queryParams);
  }

  private refreshMenuItems(currentStepIndex: number, queryParams: any) {
    const menuItems: any = [];
    if (this.stepFlow && this.stepFlow.length > 0) {
      this.stepFlow.forEach((step, index) => {
        const menuItem: any = {};
        menuItem.label = step.label;
        if (index > currentStepIndex || step.isSkipped) {
          menuItem.disabled = true;
        } else if (index < currentStepIndex) {
          menuItem.disabled = false;
        }
        menuItem.command = ((event: any) => {
        });
        menuItems.push(menuItem);
      });
    }
    this.setSteps(menuItems);
  }

  getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  ngOnDestroy() {
    if (this.stepsSubject) {
      this.stepsSubject.unsubscribe();
    }
    if (this.currStepsSubject) {
      this.currStepsSubject.unsubscribe();
    }
  }
}
