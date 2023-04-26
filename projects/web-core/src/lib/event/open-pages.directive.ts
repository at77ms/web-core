import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { AuthenticationService } from '../auth/service/authentication.service';
import { AppContextService } from '../app/app-context.service';

@Directive({
  selector: '[appOpenPages]'
})
export class OpenPagesDirective {
  @Input() openPagesObject: Page | Page[];
  @Output() openned = new EventEmitter<Window[]>();

  constructor(private authenticationService: AuthenticationService, private appContextService: AppContextService) {
  }

  @HostListener('click', ['$event'])
  clickEvent(event: MouseEvent) {
    const winArray: Array<Window> = [];
    if (this.openPagesObject instanceof Array) {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.openPagesObject.length; i++) {
        const inpage = this.openPagesObject[i];
        const ourPage = this.openPage(inpage);
        winArray.push(ourPage);
      }
    } else if (this.openPagesObject instanceof Object) {
      const ourPage = this.openPage(this.openPagesObject);
      winArray.push(ourPage);
    }
    this.openned.emit(winArray);
  }

  openPage(page: Page) {
    let checkandedit;
    const model = page.openMode || '';
    const name: string = page.name || '';
    if (model === '2') {
      checkandedit = window.open(page.url, name);
    } else {
      const width = page.width || screen.availWidth - 10;
      const height = page.height || screen.availHeight - 60;
      const top = page.top || 0;
      const left = page.left || 0;
      const css = `width=${width},height=${height},top=${top},left=${left},
                  toolbar=no, location=no, directories=no, status=no, menubar=no, fullscreen=yes, resizable=yes, titlebar=yes`;
      checkandedit = window.open(page.url, name, css);
    }
    this.appContextService.addOpenedApp(checkandedit);
    return checkandedit;
  }
}

export class Page {
  url: string;
  openMode?: string;
  name?: string;
  width?: number;
  height?: number;
  top?: number;
  left?: number;
}
