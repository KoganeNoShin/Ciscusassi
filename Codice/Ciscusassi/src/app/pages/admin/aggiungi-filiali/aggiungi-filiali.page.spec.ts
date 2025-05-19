import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AggiungiFilialiPage } from './aggiungi-filiali.page';

describe('AggiungiFilialiPage', () => {
  let component: AggiungiFilialiPage;
  let fixture: ComponentFixture<AggiungiFilialiPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AggiungiFilialiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
