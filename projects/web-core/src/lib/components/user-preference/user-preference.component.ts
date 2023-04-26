import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-user-preference',
  templateUrl: './user-preference.component.html',
  styleUrls: ['./user-preference.component.css']
})
export class UserPreferenceComponent implements OnInit {
  @Input() userPreferenceDisplay: boolean;
  @Output() userPreferenceDialogDisplayChange = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit() {
  }

  onCloseClick(): void {
    this.userPreferenceDisplay = false;
    this.userPreferenceDialogDisplayChange.emit(false);
  }

}
