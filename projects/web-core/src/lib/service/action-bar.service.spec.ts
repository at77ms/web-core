import { TestBed, inject } from '@angular/core/testing';

import { ActionBarService } from './action-bar.service';

describe('ActionBarService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActionBarService]
    });
  });

  it('should be created', inject([ActionBarService], (service: ActionBarService) => {
    expect(service).toBeTruthy();
  }));
});
