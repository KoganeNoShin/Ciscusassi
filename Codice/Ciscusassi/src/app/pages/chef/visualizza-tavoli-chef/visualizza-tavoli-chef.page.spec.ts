import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisualizzaTavoliChefPage } from './visualizza-tavoli-chef.page';

describe('VisualizzaTavoliChefPage', () => {
	let component: VisualizzaTavoliChefPage;
	let fixture: ComponentFixture<VisualizzaTavoliChefPage>;

	beforeEach(() => {
		fixture = TestBed.createComponent(VisualizzaTavoliChefPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
