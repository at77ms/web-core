import { Injectable, ElementRef } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';
import { AppConfService } from '../service/app-conf.service';

export interface Option {
  element: any;
  keys: string;
  description: string | undefined;
}

@Injectable({
  providedIn: 'root'
})
export class HotKeysService {
  hotkeys = new Map();
  defaultsElement: Partial<Option>;
  dialogOpenSubject: Subject<[string, string][]> = new Subject();

  constructor(private eventManager: EventManager, private appConfService: AppConfService) {
    this.defaultsElement = {element: document as Document};
    const hotKeyDescriptionOption = this.appConfService.getValueAsNumber('hotKeyDescriptionOption') as Partial<Option> ||
      { keys: 'alt.h', description: 'Show Keyboard Shortcuts Reference' };
    this.addShortcut(hotKeyDescriptionOption).subscribe(() => {
      this.openHelpModal();
    });
  }

  addShortcut(option: Partial<Option>) {
    const merged = { ...this.defaultsElement, ...option };
    const event = `keydown.${merged.keys}`;
    if (merged.description) {
      this.hotkeys.set(merged.keys, merged.description);
    }

    return new Observable(observer => {
      const handler = (e) => {
        e.preventDefault();
        observer.next(e);
      };
      const dispose = this.eventManager.addEventListener(merged.element, event, handler);
      return () => {
        // when the component destory, is should unSubscribe the subjce and then it will be remove the eventlisterner
        dispose();
        this.hotkeys.delete(merged.keys);
      };
    });
  }

  openHelpModal() {
    const data = Array.from(this.hotkeys);
    this.dialogOpenSubject.next(data);
  }
}
