import { Component, OnInit, Input } from '@angular/core';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-error-sidebar',
  templateUrl: './error-sidebar.component.html',
  styleUrls: ['./error-sidebar.component.css']
})
export class ErrorSidebarComponent implements OnInit {

  constructor(public notificationService: NotificationService) { }

  ngOnInit() {}

  public removeNotify(message): void {
    this.notificationService.removeNotify(message);
  }
}
