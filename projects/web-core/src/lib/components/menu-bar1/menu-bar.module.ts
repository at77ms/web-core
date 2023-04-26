import { NgModule } from '@angular/core';

import { MenubarModule } from 'primeng/menubar';

import { MenuBarComponent1 } from './menu-bar.component';

@NgModule({
  imports: [ MenubarModule ],
  declarations: [ MenuBarComponent1 ],
  exports: [ MenuBarComponent1 ],
  providers: []
})
export class MenuBarModule1 {}
