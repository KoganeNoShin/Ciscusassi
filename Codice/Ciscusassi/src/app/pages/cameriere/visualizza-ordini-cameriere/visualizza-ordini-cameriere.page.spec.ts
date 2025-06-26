import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisualizzaOrdiniCamerierePage } from './visualizza-ordini-cameriere.page';

describe('VisualizzaOrdiniCamerierePage', () => {
  let component: VisualizzaOrdiniCamerierePage;
  let fixture: ComponentFixture<VisualizzaOrdiniCamerierePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizzaOrdiniCamerierePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
