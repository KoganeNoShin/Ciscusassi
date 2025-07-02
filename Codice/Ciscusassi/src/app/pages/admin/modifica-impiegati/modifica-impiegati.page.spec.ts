import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModificaImpiegatiPage } from './modifica-impiegati.page';

describe('ModificaDatiDipendentiPage', () => {
	let component: ModificaImpiegatiPage;
	let fixture: ComponentFixture<ModificaImpiegatiPage>;

	beforeEach(() => {
		fixture = TestBed.createComponent(ModificaImpiegatiPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
