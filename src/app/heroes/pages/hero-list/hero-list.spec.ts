import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { Hero } from '../../models/hero.model';
import { HeroService } from '../../services/hero.service';
import { HeroList } from './hero-list';

const heroesMock: Hero[] = [
  { id: 1, name: 'SUPERMAN', power: 'Strength', universe: 'DC' },
  { id: 2, name: 'FLASH', power: 'Speed', universe: 'DC' },
  { id: 3, name: 'BATMAN', power: 'Strategy', universe: 'DC' },
  { id: 4, name: 'SPIDERMAN', power: 'Agility', universe: 'Marvel' },
  { id: 5, name: 'IRON MAN', power: 'Technology', universe: 'Marvel' },
  { id: 6, name: 'WONDER WOMAN', power: 'Strength', universe: 'DC' },
];

describe('HeroList', () => {
  let component: HeroList;
  let fixture: ComponentFixture<HeroList>;

  const heroServiceMock = {
    getHeroes: vi.fn(() => of(heroesMock)),
    deleteHero: vi.fn(() => of(undefined)),
  };

  const routerMock = {
    navigate: vi.fn(() => Promise.resolve(true)),
  };

  const dialogMock = {
    open: vi.fn(() => ({
      afterClosed: () => of(true),
    })),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [HeroList],
      providers: [
        { provide: HeroService, useValue: heroServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    })
      .overrideProvider(MatDialog, { useValue: dialogMock })
      .compileComponents();

    fixture = TestBed.createComponent(HeroList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load and paginate heroes', () => {
    expect(component.heroes()).toEqual(heroesMock);
    expect(component.paginatedHeroes()).toHaveLength(5);
  });

  it('should filter heroes by name', () => {
    component.onSearch('super');

    expect(component.filteredHeroes()).toEqual([heroesMock[0]]);
    expect(component.pageIndex()).toBe(0);
  });

  it('should navigate to create and edit pages', () => {
    component.onAdd();
    component.onEdit(heroesMock[0]);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/heroes/new']);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/heroes', 1, 'edit']);
  });

  it('should change the current page', () => {
    component.onPageChange({
      pageIndex: 1,
      pageSize: 5,
      length: 6,
      previousPageIndex: 0,
    });

    expect(component.pageIndex()).toBe(1);
    expect(component.paginatedHeroes()).toEqual([heroesMock[5]]);
  });

  it('should delete a hero after confirmation', () => {
    component.onDelete(heroesMock[0]);

    expect(dialogMock.open).toHaveBeenCalled();
    expect(heroServiceMock.deleteHero).toHaveBeenCalledWith(1);
    expect(component.heroes()).not.toContain(heroesMock[0]);
  });
});
