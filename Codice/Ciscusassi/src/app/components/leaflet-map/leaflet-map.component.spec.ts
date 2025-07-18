import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LeafletMapComponent } from './leaflet-map.component';

describe('LeafletMapComponent', () => {
	let component: LeafletMapComponent;
	let fixture: ComponentFixture<LeafletMapComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [LeafletMapComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(LeafletMapComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
