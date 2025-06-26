import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisualizzaOrdiniChefPage } from './visualizza-ordini-chef.page';

describe('VisualizzaOrdiniChefPage', () => {
  let component: VisualizzaOrdiniChefPage;
  let fixture: ComponentFixture<VisualizzaOrdiniChefPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizzaOrdiniChefPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
