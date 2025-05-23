import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AggiungiDipendentiPage } from './aggiungi-dipendenti.page';

describe('AggiungiDipendentiPage', () => {
  let component: AggiungiDipendentiPage;
  let fixture: ComponentFixture<AggiungiDipendentiPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AggiungiDipendentiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
