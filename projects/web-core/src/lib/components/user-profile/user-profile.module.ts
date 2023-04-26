import { NgModule } from '@angular/core';

import { DialogModule } from 'primeng/dialog';

import { UserProfileComponent } from './user-profile.component';

@NgModule({
  imports: [
    DialogModule
  ],
  declarations: [
    UserProfileComponent
  ],
  exports: [
    UserProfileComponent
  ],
  providers: []
})
export class UserProfileModule {}
