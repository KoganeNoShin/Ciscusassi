import { TestBed } from '@angular/core/testing';

import { FilialeService } from './filiale.service';

describe('PrenotaService', () => {
	let service: FilialeService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(FilialeService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
