import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdinaOraPage } from './ordina-ora.page';

describe('OrdinaOraPage', () => {
  let component: OrdinaOraPage;
  let fixture: ComponentFixture<OrdinaOraPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdinaOraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
