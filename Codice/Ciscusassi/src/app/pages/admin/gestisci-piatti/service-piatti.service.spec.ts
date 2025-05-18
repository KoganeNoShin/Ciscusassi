import { TestBed } from '@angular/core/testing';
import { ServicePiattiService } from './service-piatti.service';

describe('ServicePiattiService', () => {
  let service: ServicePiattiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicePiattiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
