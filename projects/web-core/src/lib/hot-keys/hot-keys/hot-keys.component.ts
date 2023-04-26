import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { HotKeysService } from '../hot-keys.service';

@Component({
  selector: 'app-hot-keys',
  templateUrl: './hot-keys.component.html',
  styleUrls: ['./hot-keys.component.css']
})
export class HotKeysComponent implements OnInit, OnDestroy {
  hotkeys: any = [];
  display = false;
  subscription: Subscription;
  constructor(private hotKeysService: HotKeysService) { }

  ngOnInit() {
    this.subscription = this.hotKeysService.dialogOpenSubject
      .subscribe((data) => {
        const keys = data;
        keys.forEach(key => {
          let hotKey = key[0];
          hotKey = hotKey.replace(/^[\w]/, c => c.toUpperCase());
          key[0] = hotKey.replace(/\.\w/, c => '+' + c[1].toUpperCase());
        });
        this.hotkeys = data;
        this.display = true;
      });
  }

  close() {
    this.display = false;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
