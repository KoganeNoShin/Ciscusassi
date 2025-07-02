import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestisciImpiegatiPage } from './gestisci-impiegati.page';

describe('GestisciImpiegatiPage', () => {
	let component: GestisciImpiegatiPage;
	let fixture: ComponentFixture<GestisciImpiegatiPage>;

	beforeEach(() => {
		fixture = TestBed.createComponent(GestisciImpiegatiPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
