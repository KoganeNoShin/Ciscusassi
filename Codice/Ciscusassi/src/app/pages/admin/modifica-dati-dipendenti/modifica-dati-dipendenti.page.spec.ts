import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModificaDatiDipendentiPage } from './modifica-dati-dipendenti.page';

describe('ModificaDatiDipendentiPage', () => {
  let component: ModificaDatiDipendentiPage;
  let fixture: ComponentFixture<ModificaDatiDipendentiPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModificaDatiDipendentiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
