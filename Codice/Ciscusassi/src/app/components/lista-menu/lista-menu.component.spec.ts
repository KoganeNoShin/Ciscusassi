import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListaMenuComponent } from './lista-menu.component';

describe('ListaMenuComponent', () => {
  let component: ListaMenuComponent;
  let fixture: ComponentFixture<ListaMenuComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ListaMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
