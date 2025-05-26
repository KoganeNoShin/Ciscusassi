import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuAsportoPage } from './menu-asporto.page';

describe('MenuAsportoPage', () => {
  let component: MenuAsportoPage;
  let fixture: ComponentFixture<MenuAsportoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuAsportoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
