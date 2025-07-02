import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AggiungiImpiegatiPage } from './aggiungi-impiegati.page';

describe('AggiungiImpiegatiPage', () => {
	let component: AggiungiImpiegatiPage;
	let fixture: ComponentFixture<AggiungiImpiegatiPage>;

	beforeEach(() => {
		fixture = TestBed.createComponent(AggiungiImpiegatiPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
