import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RistorantiPage } from './ristoranti.page';

describe('RistorantiPage', () => {
  let component: RistorantiPage;
  let fixture: ComponentFixture<RistorantiPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RistorantiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
