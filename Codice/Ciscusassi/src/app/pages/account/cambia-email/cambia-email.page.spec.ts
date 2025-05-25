import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CambiaEmailPage } from './cambia-email.page';

describe('CambiaEmailPage', () => {
  let component: CambiaEmailPage;
  let fixture: ComponentFixture<CambiaEmailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CambiaEmailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
