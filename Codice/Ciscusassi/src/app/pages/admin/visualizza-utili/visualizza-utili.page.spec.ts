import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisualizzaUtiliPage } from './visualizza-utili.page';

describe('VisualizzaUtiliPage', () => {
  let component: VisualizzaUtiliPage;
  let fixture: ComponentFixture<VisualizzaUtiliPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizzaUtiliPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
