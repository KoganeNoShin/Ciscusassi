import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PiattoAmministratoreComponent } from './piatto-amministratore.component';

describe('PiattoAmministratoreComponent', () => {
  let component: PiattoAmministratoreComponent;
  let fixture: ComponentFixture<PiattoAmministratoreComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PiattoAmministratoreComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PiattoAmministratoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
