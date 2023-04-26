import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MenuModule} from 'primeng/menu';

// import { UserPreferenceModule } from '../user-preference/user-preference.module';
// import { UserProfileModule } from '../user-profile/user-profile.module';
import { HeaderComponent } from './header.component';
import { SearchModule } from '../search/search.module';

@NgModule({
  imports: [
    MenuModule,
    SearchModule,
    CommonModule,
    // UserPreferenceModule,
    // UserProfileModule
  ],
  declarations: [ HeaderComponent ],
  exports: [HeaderComponent],
  providers: []
})
export class HeaderModule {}
