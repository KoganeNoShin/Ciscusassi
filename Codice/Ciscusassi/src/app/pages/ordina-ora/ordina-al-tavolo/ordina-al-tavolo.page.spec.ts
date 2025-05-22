import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdinaAlTavoloPage } from './ordina-al-tavolo.page';

describe('OrdinaAlTavoloPage', () => {
	let component: OrdinaAlTavoloPage;
	let fixture: ComponentFixture<OrdinaAlTavoloPage>;

	beforeEach(() => {
		fixture = TestBed.createComponent(OrdinaAlTavoloPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
