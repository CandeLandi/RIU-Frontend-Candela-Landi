import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroActions } from './hero-actions';

describe('HeroActions', () => {
  let component: HeroActions;
  let fixture: ComponentFixture<HeroActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroActions],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroActions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
