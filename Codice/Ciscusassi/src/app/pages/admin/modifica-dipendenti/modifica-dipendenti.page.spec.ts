import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModificaDipendentiPage } from './modifica-dipendenti.page';

describe('ModificaDipendentiPage', () => {
  let component: ModificaDipendentiPage;
  let fixture: ComponentFixture<ModificaDipendentiPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModificaDipendentiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
