import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisualizzaTavoliPage } from './visualizza-tavoli.page';

describe('VisualizzaTavoliPage', () => {
  let component: VisualizzaTavoliPage;
  let fixture: ComponentFixture<VisualizzaTavoliPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizzaTavoliPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
