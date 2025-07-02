import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ImpiegatoAmministratoreComponent } from './impiegato-amministratore.component';

describe('DipendenteAmministratoreComponent', () => {
	let component: ImpiegatoAmministratoreComponent;
	let fixture: ComponentFixture<ImpiegatoAmministratoreComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [ImpiegatoAmministratoreComponent],
			imports: [IonicModule.forRoot()],
		}).compileComponents();

		fixture = TestBed.createComponent(ImpiegatoAmministratoreComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
