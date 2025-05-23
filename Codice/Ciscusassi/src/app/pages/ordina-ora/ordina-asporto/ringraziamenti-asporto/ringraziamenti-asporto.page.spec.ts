import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RingraziamentiAsportoPage } from './ringraziamenti-asporto.page';

describe('RingraziamentiAsportoPage', () => {
  let component: RingraziamentiAsportoPage;
  let fixture: ComponentFixture<RingraziamentiAsportoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RingraziamentiAsportoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
