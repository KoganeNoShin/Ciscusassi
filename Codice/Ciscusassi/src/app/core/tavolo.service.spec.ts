import { TestBed } from '@angular/core/testing';
import { TavoloService } from './tavolo.service';

describe('TavoloService', () => {
  let service: TavoloService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TavoloService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
