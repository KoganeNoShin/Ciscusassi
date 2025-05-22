import { TestBed } from '@angular/core/testing';
import { ProdottoService } from './prodotto.service';

describe('ServicePiattiService', () => {
	let service: ProdottoService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(ProdottoService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
