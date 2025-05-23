import { TestBed } from '@angular/core/testing';

import { FilialeAsportoService } from './filiale-asporto.service';

describe('FilialeAsportoService', () => {
  let service: FilialeAsportoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilialeAsportoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
