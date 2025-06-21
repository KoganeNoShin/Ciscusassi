import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NumeroPersonePage } from './numero-persone.page';

describe('NumeroPersonePage', () => {
  let component: NumeroPersonePage;
  let fixture: ComponentFixture<NumeroPersonePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NumeroPersonePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
