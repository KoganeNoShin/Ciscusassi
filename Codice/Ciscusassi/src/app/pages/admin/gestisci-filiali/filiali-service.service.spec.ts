import { TestBed } from '@angular/core/testing';

import { FilialiServiceService } from './filiali-service.service';

describe('FilialiServiceService', () => {
  let service: FilialiServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilialiServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
