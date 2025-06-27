import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RicevutaComponent } from './ricevuta.component';

describe('RicevutaComponent', () => {
  let component: RicevutaComponent;
  let fixture: ComponentFixture<RicevutaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RicevutaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RicevutaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
