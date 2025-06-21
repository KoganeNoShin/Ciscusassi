import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisualizzaTavoliCamerierePage } from './visualizza-tavoli-cameriere.page';

describe('VisualizzaTavoliPage', () => {
	let component: VisualizzaTavoliCamerierePage;
	let fixture: ComponentFixture<VisualizzaTavoliCamerierePage>;

	beforeEach(() => {
		fixture = TestBed.createComponent(VisualizzaTavoliCamerierePage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
