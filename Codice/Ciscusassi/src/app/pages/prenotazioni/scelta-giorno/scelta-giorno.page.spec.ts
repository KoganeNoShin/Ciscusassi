import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SceltaGiornoPage } from './scelta-giorno.page';

describe('SceltaGiornoPage', () => {
  let component: SceltaGiornoPage;
  let fixture: ComponentFixture<SceltaGiornoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SceltaGiornoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
