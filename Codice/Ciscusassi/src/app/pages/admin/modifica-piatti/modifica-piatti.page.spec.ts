import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModificaPiattiPage } from './modifica-piatti.page';

describe('ModificaPiattiPage', () => {
  let component: ModificaPiattiPage;
  let fixture: ComponentFixture<ModificaPiattiPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModificaPiattiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
