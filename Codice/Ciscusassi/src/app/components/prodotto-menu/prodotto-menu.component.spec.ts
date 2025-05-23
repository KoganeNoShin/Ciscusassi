import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProdottoMenuComponent } from './prodotto-menu.component';

describe('ProdottoMenuComponent', () => {
  let component: ProdottoMenuComponent;
  let fixture: ComponentFixture<ProdottoMenuComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ProdottoMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProdottoMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
