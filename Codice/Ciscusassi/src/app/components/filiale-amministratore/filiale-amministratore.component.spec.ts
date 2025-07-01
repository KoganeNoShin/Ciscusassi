import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FilialeAmministratoreComponent } from './filiale-amministratore.component';

describe('FilialeAmministratoreComponent', () => {
  let component: FilialeAmministratoreComponent;
  let fixture: ComponentFixture<FilialeAmministratoreComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FilialeAmministratoreComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FilialeAmministratoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
