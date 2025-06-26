import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProdottoOrdineComponent } from './prodotto-ordine.component';

describe('ProdottoOrdineComponent', () => {
  let component: ProdottoOrdineComponent;
  let fixture: ComponentFixture<ProdottoOrdineComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ProdottoOrdineComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProdottoOrdineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
