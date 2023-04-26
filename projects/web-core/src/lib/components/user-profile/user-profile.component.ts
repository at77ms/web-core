import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  @Input() userProfileDisplay: boolean;
  @Output() userProfileDialogDisplayChange = new EventEmitter<boolean>();

  constructor() {
  }

  ngOnInit() {
  }

  onCloseClick(): void {
    this.userProfileDisplay = false;
    this.userProfileDialogDisplayChange.emit(false);
  }

}
