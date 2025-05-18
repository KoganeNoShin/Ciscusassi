import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AggiungiPiattiPage } from './aggiungi-piatti.page';

describe('AggiungiPiattiPage', () => {
  let component: AggiungiPiattiPage;
  let fixture: ComponentFixture<AggiungiPiattiPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AggiungiPiattiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
