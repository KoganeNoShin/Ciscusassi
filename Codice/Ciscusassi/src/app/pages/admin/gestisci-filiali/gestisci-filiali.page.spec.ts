import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestisciFilialiPage } from './gestisci-filiali.page';

describe('GestisciFilialiPage', () => {
	let component: GestisciFilialiPage;
	let fixture: ComponentFixture<GestisciFilialiPage>;

	beforeEach(() => {
		fixture = TestBed.createComponent(GestisciFilialiPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
