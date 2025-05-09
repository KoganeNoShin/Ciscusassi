import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PiattoDelGiornoComponent } from './piatto-del-giorno.component';

describe('PiattoDelGiornoComponent', () => {
  let component: PiattoDelGiornoComponent;
  let fixture: ComponentFixture<PiattoDelGiornoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PiattoDelGiornoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PiattoDelGiornoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
