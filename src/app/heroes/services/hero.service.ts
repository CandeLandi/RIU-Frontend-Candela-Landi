import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, of, tap } from 'rxjs';

import { Hero, HeroCreate, HeroUpdate } from '../models/hero.model';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly heroesState = signal<Hero[]>([]);
  private loaded = false;

  getHeroes(): Observable<Hero[]> {
    return this.ensureLoaded().pipe(
      map((): Hero[] => this.heroesState()),
    );
  }

  getHeroById(id: number): Observable<Hero | undefined> {
    return this.ensureLoaded().pipe(
      map((): Hero | undefined => this.heroesState().find((hero) => hero.id === id)),
    );
  }

  searchHeroesByName(term: string): Observable<Hero[]> {
    const normalizedTerm: string = term.trim().toLowerCase();

    return this.getHeroes().pipe(
      map((heroes): Hero[] =>
        normalizedTerm
          ? heroes.filter((hero) => hero.name.toLowerCase().includes(normalizedTerm))
          : heroes,
      ),
    );
  }

  createHero(hero: HeroCreate): Observable<Hero> {
    return this.ensureLoaded().pipe(
      map((): Hero => {
        const newHero: Hero = {
          ...hero,
          id: this.getNextId(),
          name: hero.name.trim().toUpperCase(),
        };

        this.heroesState.update((heroes) => [...heroes, newHero]);

        return newHero;
      }),
    );
  }

  updateHero(id: number, hero: HeroUpdate): Observable<Hero> {
    return this.ensureLoaded().pipe(
      map((): Hero => {
        const heroes: Hero[] = this.heroesState();
        const heroIndex: number = heroes.findIndex((currentHero) => currentHero.id === id);

        if (heroIndex === -1) {
          throw new Error('Hero not found');
        }

        const updatedHero: Hero = {
          ...heroes[heroIndex],
          ...hero,
          name: hero.name?.trim().toUpperCase() ?? heroes[heroIndex].name,
        };

        const updatedHeroes: Hero[] = [...heroes];
        updatedHeroes[heroIndex] = updatedHero;
        this.heroesState.set(updatedHeroes);

        return updatedHero;
      }),
    );
  }

  deleteHero(id: number): Observable<void> {
    return this.ensureLoaded().pipe(
      tap((): void => {
        this.heroesState.update((heroes) =>
          heroes.filter((hero) => hero.id !== id),
        );
      }),
      map((): void => undefined),
    );
  }

  private ensureLoaded(): Observable<Hero[]> {
    if (this.loaded) {
      return of(this.heroesState());
    }

    return this.http.get<Hero[]>('/data/heroes.json').pipe(
      tap((heroes: Hero[]): void => {
        this.heroesState.set(heroes);
        this.loaded = true;
      }),
    );
  }

  private getNextId(): number {
    const ids: number[] = this.heroesState().map((hero) => hero.id);

    return ids.length ? Math.max(...ids) + 1 : 1;
  }
}
