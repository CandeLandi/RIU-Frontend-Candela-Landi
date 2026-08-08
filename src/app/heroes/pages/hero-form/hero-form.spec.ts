import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { Hero } from '../../models/hero.model';
import { HeroService } from '../../services/hero.service';
import { HeroForm } from './hero-form';

const heroMock: Hero = {
  id: 1,
  name: 'SUPERMAN',
  alterEgo: 'Clark Kent',
  power: 'Strength',
  universe: 'DC',
  description: 'A powerful hero.',
};

describe('HeroForm', () => {
  let component: HeroForm;
  let fixture: ComponentFixture<HeroForm>;
  let routeId: string | null;

  const heroServiceMock = {
    getHeroes: vi.fn(() => of([heroMock])),
    getHeroById: vi.fn(() => of(heroMock)),
    createHero: vi.fn(() => of(heroMock)),
    updateHero: vi.fn(() => of(heroMock)),
  };

  const routerMock = {
    navigate: vi.fn(() => Promise.resolve(true)),
  };

  beforeEach(async () => {
    routeId = null;
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [HeroForm],
      providers: [
        { provide: HeroService, useValue: heroServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => routeId,
              },
            },
          },
        },
      ],
    }).compileComponents();
  });

  function createComponent(id: string | null = null): void {
    routeId = id;
    fixture = TestBed.createComponent(HeroForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should keep the form invalid when required fields are empty', () => {
    createComponent();

    component.onSubmit();

    expect(component.heroForm.invalid).toBe(true);
    expect(heroServiceMock.createHero).not.toHaveBeenCalled();
  });

  it('should create a hero and return to the list', async () => {
    createComponent();

    component.heroForm.setValue({
      name: 'Flash',
      alterEgo: 'Barry Allen',
      power: 'Speed',
      universe: 'DC',
      description: 'A fast hero.',
    });

    await fixture.whenStable();
    component.onSubmit();

    expect(heroServiceMock.createHero).toHaveBeenCalledWith({
      name: 'Flash',
      alterEgo: 'Barry Allen',
      power: 'Speed',
      universe: 'DC',
      description: 'A fast hero.',
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/heroes']);
  });

  it('should reject an existing hero name when creating', async () => {
    createComponent();

    component.heroForm.patchValue({
      name: ' superman ',
      power: 'Strength',
      universe: 'DC',
    });

    component.heroForm.controls.name.markAsTouched();
    await fixture.whenStable();

    expect(
      component.heroForm.controls.name.hasError('duplicatedName'),
    ).toBe(true);

    component.onSubmit();

    expect(heroServiceMock.createHero).not.toHaveBeenCalled();
  });

  it('should load the selected hero in edit mode', async () => {
    createComponent('1');
    await fixture.whenStable();

    expect(heroServiceMock.getHeroById).toHaveBeenCalledWith(1);
    expect(component.isEditMode()).toBe(true);
    expect(component.editingHeroName()).toBe('SUPERMAN');
    expect(component.heroForm.controls.name.value).toBe('SUPERMAN');
    expect(
      component.heroForm.controls.name.hasError('duplicatedName'),
    ).toBe(false);
  });

  it('should update the selected hero', async () => {
    createComponent('1');
    component.heroForm.controls.power.setValue('Updated strength');

    await fixture.whenStable();
    component.onSubmit();

    expect(heroServiceMock.updateHero).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        name: 'SUPERMAN',
        power: 'Updated strength',
      }),
    );
    expect(routerMock.navigate).toHaveBeenCalledWith(['/heroes']);
  });

  it('should return to the list when cancelling', () => {
    createComponent();

    component.onCancel();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/heroes']);
  });
});
