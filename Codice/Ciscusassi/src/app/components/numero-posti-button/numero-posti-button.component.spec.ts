import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NumeroPostiButton } from './numero-posti-button.component';

describe('TavoloCircleComponent', () => {
	let component: NumeroPostiButton;
	let fixture: ComponentFixture<NumeroPostiButton>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [NumeroPostiButton],
			imports: [IonicModule.forRoot()],
		}).compileComponents();

		fixture = TestBed.createComponent(NumeroPostiButton);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
