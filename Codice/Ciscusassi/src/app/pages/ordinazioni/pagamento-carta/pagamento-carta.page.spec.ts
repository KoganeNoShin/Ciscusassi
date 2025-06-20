import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagamentoCartaPage } from './pagamento-carta.page';

describe('PagamentoCartaPage', () => {
  let component: PagamentoCartaPage;
  let fixture: ComponentFixture<PagamentoCartaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PagamentoCartaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
