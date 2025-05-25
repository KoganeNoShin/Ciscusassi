import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatiAccountPage } from './dati-account.page';

describe('DatiAccountPage', () => {
  let component: DatiAccountPage;
  let fixture: ComponentFixture<DatiAccountPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DatiAccountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
