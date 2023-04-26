import { Injectable } from '@angular/core';

import {MenuItem} from 'primeng/api';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationBarService {
  constructor() { }
  rooute = location.href.toString();
  result: any;
  itemes: MenuItem[] = [];


  getItem(): MenuItem[] {
    this.itemes = [];
    this.rooute = location.href.toString();
    this.result = this.rooute.split('/');
    for (let i = 2; i < this.result.length; i++) {
      const menuItem = {label: this.result[i], icon: 'pi pi-pencil'};
      this.itemes.push(menuItem);
    }
    this.itemes[0].icon = 'pi pi-home';
    return this.itemes;
  }

  getHerf(): string {
    return this.rooute;
  }

}
