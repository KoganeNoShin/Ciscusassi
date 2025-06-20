import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagamentoTavoloPage } from './pagamento-tavolo.page';

describe('PagamentoTavoloPage', () => {
  let component: PagamentoTavoloPage;
  let fixture: ComponentFixture<PagamentoTavoloPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PagamentoTavoloPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
