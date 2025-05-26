import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuTavoloPage } from './menu-tavolo.page';

describe('MenuTavoloPage', () => {
  let component: MenuTavoloPage;
  let fixture: ComponentFixture<MenuTavoloPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuTavoloPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
