import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { Hero } from '../models/hero.model';
import { HeroService } from './hero.service';

const heroesMock: Hero[] = [
  {
    id: 1,
    name: 'SUPERMAN',
    alterEgo: 'Clark Kent',
    power: 'Strength, flight and heat vision',
    universe: 'DC',
    description: 'A hero with extraordinary strength and a strong sense of justice.',
  },
  {
    id: 2,
    name: 'SPIDERMAN',
    alterEgo: 'Peter Parker',
    power: 'Agility, spider sense and web shooting',
    universe: 'Marvel',
    description: 'A young hero known for responsibility, agility and quick reflexes.',
  },
];

describe('HeroService', () => {
  let service: HeroService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(HeroService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get all heroes from local json', async () => {
    const resultPromise = firstValueFrom(service.getHeroes());

    httpMock.expectOne('/data/heroes.json').flush(heroesMock);

    expect(await resultPromise).toEqual(heroesMock);
  });

  it('should get a hero by id', async () => {
    const resultPromise = firstValueFrom(service.getHeroById(2));

    httpMock.expectOne('/data/heroes.json').flush(heroesMock);

    expect(await resultPromise).toEqual(heroesMock[1]);
  });

  it('should search heroes by name', async () => {
    const resultPromise = firstValueFrom(service.searchHeroesByName('man'));

    httpMock.expectOne('/data/heroes.json').flush(heroesMock);

    expect(await resultPromise).toEqual(heroesMock);
  });

  it('should create a hero with uppercase name', async () => {
    const resultPromise = firstValueFrom(
      service.createHero({
        name: 'batman',
        alterEgo: 'Bruce Wayne',
        power: 'Strategy and technology',
        universe: 'DC',
        description: 'A detective and strategist.',
      }),
    );

    httpMock.expectOne('/data/heroes.json').flush(heroesMock);

    expect(await resultPromise).toEqual({
      id: 3,
      name: 'BATMAN',
      alterEgo: 'Bruce Wayne',
      power: 'Strategy and technology',
      universe: 'DC',
      description: 'A detective and strategist.',
    });
  });

  it('should update a hero', async () => {
    const resultPromise = firstValueFrom(
      service.updateHero(1, {
        power: 'Updated power',
      }),
    );

    httpMock.expectOne('/data/heroes.json').flush(heroesMock);

    expect(await resultPromise).toEqual({
      ...heroesMock[0],
      power: 'Updated power',
    });
  });

  it('should delete a hero', async () => {
    const resultPromise = firstValueFrom(service.deleteHero(1));

    httpMock.expectOne('/data/heroes.json').flush(heroesMock);

    await resultPromise;

    expect(await firstValueFrom(service.getHeroes())).toEqual([heroesMock[1]]);
  });
});
