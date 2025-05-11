import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MenuDividerComponent } from './menu-divider.component';

describe('MenuDividerComponent', () => {
  let component: MenuDividerComponent;
  let fixture: ComponentFixture<MenuDividerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MenuDividerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuDividerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
