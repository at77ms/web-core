import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AbstractActionBarService } from '../../service/action-bar.service';
import { ActionBarItem } from '../../service/action-bar-item';

@Component({
  selector: 'app-action-bar',
  templateUrl: './action-bar.component.html',
})
export class ActionBarComponent implements OnInit, OnDestroy {
  currentBtns: ActionBarItem[] = [];
  currentBtnSubcription: Subscription;
  requestNo: string;

  constructor(
  ) { }

  ngOnInit() {
    this.currentBtnSubcription = AbstractActionBarService.currentBtnsSubject.subscribe(curBtnItems => {
      if (curBtnItems) {
        this.currentBtns = curBtnItems;
      }
    });
  }

  ifBtnGenerate(btn): boolean {
    if (!btn.items || btn.items.length === 0) {
      return this.checkIfBtnGen(btn);
    }
    return false;
  }

  ifSplitBtnGenerate(btn): boolean {
    if (btn.items && btn.items.length > 0) {
      return this.checkIfBtnGen((btn));
    }
    return false;
  }

  private checkIfBtnGen(btn): boolean {
    if (btn.isBtnGenrate !== false) {
      return true;
    }
    return false;
  }

  btnClick(event: Event, btn: any) {
    if (btn.disabled) {
      event.preventDefault();
      return;
    }
    if (!btn.url) {
      event.preventDefault();
    }
    if (btn.command) {
      btn.command(event, btn);
    }
  }

  ngOnDestroy() {
    if (this.currentBtnSubcription) {
      this.currentBtnSubcription.unsubscribe();
    }
  }

}
