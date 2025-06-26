import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListaOrdiniComponent } from './lista-ordini.component';

describe('ListaOrdiniComponent', () => {
  let component: ListaOrdiniComponent;
  let fixture: ComponentFixture<ListaOrdiniComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ListaOrdiniComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaOrdiniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
