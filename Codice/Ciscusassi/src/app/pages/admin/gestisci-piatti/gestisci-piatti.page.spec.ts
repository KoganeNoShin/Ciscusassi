import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestisciPiattiPage } from './gestisci-piatti.page';

describe('GestisciPiattiPage', () => {
  let component: GestisciPiattiPage;
  let fixture: ComponentFixture<GestisciPiattiPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestisciPiattiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
