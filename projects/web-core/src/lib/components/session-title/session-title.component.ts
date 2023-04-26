import { Component, OnInit, Input } from '@angular/core';
import { style } from '@angular/animations';

@Component({
  selector: 'app-session-title',
  templateUrl: './session-title.component.html',
  styleUrls: ['./session-title.component.css']
})
export class SessionTitleComponent implements OnInit {

  constructor() { }

  @Input() title: string;
  @Input() style: string;

  ngOnInit() {
  }

}
