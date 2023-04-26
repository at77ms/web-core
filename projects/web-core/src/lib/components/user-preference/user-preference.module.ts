import { NgModule } from '@angular/core';

import { DialogModule } from 'primeng/dialog';

import { UserPreferenceComponent } from './user-preference.component';

@NgModule({
  imports: [ DialogModule ],
  declarations: [ UserPreferenceComponent ],
  exports: [UserPreferenceComponent],
  providers: []
})
export class UserPreferenceModule {}
