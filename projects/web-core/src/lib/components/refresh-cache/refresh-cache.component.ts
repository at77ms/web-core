import { Component, OnInit } from '@angular/core';
import { DropdownService } from '../../service/dropdown.service';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-refresh-cache',
  templateUrl: './refresh-cache.component.html',
  styleUrls: ['./refresh-cache.component.css']
})
export class RefreshCacheComponent implements OnInit {
  reFreshComplete = false;
  constructor(private dropdownService: DropdownService) { }

  ngOnInit() {
    this.dropdownService.refreshCache().pipe(delay(3000)).subscribe(() => {
      this.reFreshComplete = true;
    });
  }

}

