import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagamentoCassaPage } from './pagamento-cassa.page';

describe('PagamentoCassaPage', () => {
  let component: PagamentoCassaPage;
  let fixture: ComponentFixture<PagamentoCassaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PagamentoCassaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
