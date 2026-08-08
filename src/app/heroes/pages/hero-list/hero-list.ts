import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Hero } from '../../models/hero.model';
import { HeroService } from '../../services/hero.service';
import { Router } from '@angular/router';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { filter, switchMap } from 'rxjs';

@Component({
  selector: 'app-hero-list',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './hero-list.html',
  styleUrl: './hero-list.scss',
})
export class HeroList {
  private readonly router = inject(Router);
  private readonly heroService = inject(HeroService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns: string[] = ['name', 'alterEgo', 'universe', 'power', 'actions'];

  readonly heroes = signal<Hero[]>([]);
  readonly searchTerm = signal<string>('');
  readonly pageIndex = signal<number>(0);
  readonly pageSize = signal<number>(5);

  readonly filteredHeroes = computed((): Hero[] => {
    const term: string = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.heroes();
    }

    return this.heroes().filter((hero: Hero) => hero.name.toLowerCase().includes(term));
  });

  readonly paginatedHeroes = computed((): Hero[] => {
    const start: number = this.pageIndex() * this.pageSize();
    const end: number = start + this.pageSize();

    return this.filteredHeroes().slice(start, end);
  });

  constructor() {
    this.heroService
      .getHeroes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((heroes: Hero[]) => {
        this.heroes.set(heroes);
      });
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.pageIndex.set(0);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onAdd(): void {
    void this.router.navigate(['/heroes/new']);
  }

  onEdit(hero: Hero): void {
    void this.router.navigate(['/heroes', hero.id, 'edit']);
  }

  onDelete(hero: Hero): void {
    const data: ConfirmDialogData = {
      title: 'Eliminar héroe',
      message: `¿Estás segura de que querés eliminar a ${hero.name}?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    };

    this.dialog
      .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
        width: '26rem',
        maxWidth: 'calc(100vw - 2rem)',
        data,
      })
      .afterClosed()
      .pipe(
        filter((confirmed): confirmed is true => confirmed === true),
        switchMap(() => this.heroService.deleteHero(hero.id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.heroes.update((heroes) => heroes.filter((currentHero) => currentHero.id !== hero.id));

        const lastPageIndex = Math.max(
          Math.ceil(this.filteredHeroes().length / this.pageSize()) - 1,
          0,
        );

        if (this.pageIndex() > lastPageIndex) {
          this.pageIndex.set(lastPageIndex);
        }
      });
  }
}
