import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdinaAsportoPage } from './ordina-asporto.page';

describe('OrdinaAsportoPage', () => {
  let component: OrdinaAsportoPage;
  let fixture: ComponentFixture<OrdinaAsportoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdinaAsportoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
