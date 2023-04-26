import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { ActionBarItem, ButtonType } from './action-bar-item';
import { Logger } from '../logger/logger';

const GRAY_BUTTON_CLASS = 'action-btn ui-button-raised ui-button-secondary third-btn';
const ACTIVE_BUTTON_CLASS = 'action-btn ui-button-raised';
// const PREVIOUS_BUTTON_CLASS:string= 'action-btn btn-primary ui-button-secondary previous-btn';
const PREVIOUS_BUTTON_CLASS = GRAY_BUTTON_CLASS;

export interface IActionBarService<T extends ActionBarItem> {
  getActionBar(): ActionBarItem[];
  addButton(label: string, subItems: ActionBarItem[], btnClass: string, buttonType: ButtonType, syncButton: boolean): T;
  addCloseFileButton(label: string, subItems: ActionBarItem[]): T;
  addNextButton(label: string, subItems: ActionBarItem[]): T;
  addPreviousButton(label: string, subItems: ActionBarItem[]): T;
  addConfirmButton(label: string, subItems: ActionBarItem[]): T;
}


export abstract class AbstractActionBarService<T extends ActionBarItem> implements IActionBarService<T> {
  static currentBtnsSubject = new ReplaySubject<ActionBarItem[]>();
  private actionBarPool: T[] = [];
  private controlBtnList: ActionBarItem[] = [];

  constructor(public logger: Logger) {

  }

  getActionBarButtons(): T[] {
    return this.getActionBar();
  }

  getActionBar(): T[] {
    return (this.actionBarPool == null ? [] : this.actionBarPool);
  }

  abstract addButton(label: string, subItems: ActionBarItem[], btnClass: string, buttonType: ButtonType, syncButton: boolean): T;

  addCloseFileButton(label: string, subItems: ActionBarItem[], syncButton: boolean = true): T {
    return this.addButton(label, subItems, GRAY_BUTTON_CLASS, ButtonType.CLOSE_FILE, syncButton);
  }

  addNextButton(label: string, subItems: ActionBarItem[], syncButton: boolean = true): T {
    return this.addButton(label, subItems, ACTIVE_BUTTON_CLASS, ButtonType.NEXT, syncButton);
  }

  addPreviousButton(label: string, subItems: ActionBarItem[], syncButton: boolean = true): T {
    return this.addButton(label, subItems, PREVIOUS_BUTTON_CLASS, ButtonType.PREVIOUS, syncButton);
  }

  addConfirmButton(label: string, subItems: ActionBarItem[], syncButton: boolean = true): T {
    return this.addButton(label, subItems, ACTIVE_BUTTON_CLASS, ButtonType.CONFIRM, syncButton);
  }

  findActionBarItem(btnName: string): T {
    return this.getActionBarItem(btnName);
  }

  private getActionBarItem(btnName: string) {
    let result = null;
    const actionBar = this.getActionBar();
    if (actionBar) {
      actionBar.forEach(actionBarItem => {
        if (actionBarItem.name === btnName) {
          result = actionBarItem;
        }
      });
    }
    return result;
  }

  clearActiveButton() {
    if (this.actionBarPool) {
      this.actionBarPool.forEach(button => {
        if ( typeof button.command === 'function') {
          button.command = null;
        }
      });
      this.actionBarPool = [];
      this.buttonUpdateNotify([]);
    }
  }

  protected buttonUpdateNotify(actionBar: T[]) {
    this.logger.debug('buttonUpdateNotify=>', actionBar);
    AbstractActionBarService.currentBtnsSubject.next(actionBar);
  }

  disableActionBarBtns(excludeBtns: ActionBarItem[]) {
    if (this.actionBarPool) {
      this.controlBtnList = [];
      // tslint:disable: prefer-for-of
      for (let i = 0; i < this.actionBarPool.length; i++) {
        if (!this.actionBarPool[i].disabled) {
          this.controlBtnList.push(this.actionBarPool[i]);
        }
        for (let j = 0; j < excludeBtns.length; j++) {
          const resultIndex = this.controlBtnList.indexOf(excludeBtns[j]);
          if (resultIndex !== -1) {
            this.controlBtnList.splice(resultIndex);
          }
        }
      }
      for (let i = 0; i < this.controlBtnList.length; i++) {
        this.controlBtnList[i].disabled = true;
      }
    }
  }

  enableActionBarBtns() {
    for (let i = 0; i < this.controlBtnList.length; i++) {
      this.controlBtnList[i].disabled = false;
    }
  }

  enableAllBtns() {
    this.switchAllBtnEnableDisable(false);
  }

  disableAllBtns() {
    this.switchAllBtnEnableDisable(true);
  }

  private switchAllBtnEnableDisable(boo: boolean) {
    const allBtns = this.getAllTheBtns();
    allBtns.forEach((btn: ActionBarItem) => {
      btn.disabled = boo;
    });
  }

  private getAllTheBtns(): ActionBarItem[] {
    const allBtns: ActionBarItem[] = [];
    if (Array.isArray(this.actionBarPool)) {
      this.actionBarPool.forEach((btn: ActionBarItem) => {
        allBtns.push(btn);
        if (Array.isArray(btn.items)) {
          btn.items.forEach((subBtn) => {
            allBtns.push(subBtn);
          });
        }
      });
    }
    return allBtns;
  }

  enableBtn(btn: ActionBarItem | ActionBarItem[]) {
    this.switchBtnEnableDisable(btn, false);
  }

  disableBtn(btn: ActionBarItem | ActionBarItem[]) {
    this.switchBtnEnableDisable(btn, true);
  }

  private switchBtnEnableDisable(btn: ActionBarItem | ActionBarItem[], bool: boolean) {
    if (Array.isArray(btn)) {
      btn.forEach((eachBtn) => {
        eachBtn.disabled = bool;
      });
    } else {
      btn.disabled = bool;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class ActionBarService extends AbstractActionBarService<ActionBarItem> {
  constructor(public logger: Logger) {
    super(logger);
  }

  addButton(label: string, subItems: ActionBarItem[], btnClass: string, buttonType: ButtonType): ActionBarItem {
    const button: ActionBarItem =
      new ActionBarItem(label, btnClass, buttonType, subItems);
    this.getActionBar().push(button);
    this.buttonUpdateNotify(this.getActionBar());
    return button;
  }
}
