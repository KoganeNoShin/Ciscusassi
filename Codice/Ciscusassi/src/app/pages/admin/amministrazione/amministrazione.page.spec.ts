import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AmministrazionePage } from './amministrazione.page';

describe('AmministrazionePage', () => {
  let component: AmministrazionePage;
  let fixture: ComponentFixture<AmministrazionePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AmministrazionePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
