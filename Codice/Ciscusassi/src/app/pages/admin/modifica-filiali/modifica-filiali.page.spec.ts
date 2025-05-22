import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModificaFilialiPage } from './modifica-filiali.page';

describe('ModificaFilialiPage', () => {
	let component: ModificaFilialiPage;
	let fixture: ComponentFixture<ModificaFilialiPage>;

	beforeEach(() => {
		fixture = TestBed.createComponent(ModificaFilialiPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
