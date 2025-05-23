import { TestBed } from '@angular/core/testing';

import { ServiceDipendentiService } from './impiegato.service';

describe('ServiceDipendentiService', () => {
  let service: ServiceDipendentiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceDipendentiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
