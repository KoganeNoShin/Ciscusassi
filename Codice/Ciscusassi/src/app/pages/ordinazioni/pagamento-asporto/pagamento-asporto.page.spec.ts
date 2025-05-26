import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagamentoAsportoPage } from './pagamento-asporto.page';

describe('PagamentoAsportoPage', () => {
  let component: PagamentoAsportoPage;
  let fixture: ComponentFixture<PagamentoAsportoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PagamentoAsportoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
