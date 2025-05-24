import { TestBed } from '@angular/core/testing';

import { AsportoService } from './asporto.service';

describe('AsportoService', () => {
  let service: AsportoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AsportoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
