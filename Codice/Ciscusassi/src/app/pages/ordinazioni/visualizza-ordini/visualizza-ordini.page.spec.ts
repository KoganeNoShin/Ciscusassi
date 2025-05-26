import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisualizzaOrdiniPage } from './visualizza-ordini.page';

describe('VisualizzaOrdiniPage', () => {
  let component: VisualizzaOrdiniPage;
  let fixture: ComponentFixture<VisualizzaOrdiniPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizzaOrdiniPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
