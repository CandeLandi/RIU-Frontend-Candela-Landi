import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Observable,
  catchError,
  finalize,
  map,
  of,
  take,
} from 'rxjs';

import { Hero, HeroCreate, HeroUniverse } from '../../models/hero.model';
import { HeroService } from '../../services/hero.service';
import { Uppercase } from '../../../shared/directives/uppercase';

@Component({
  selector: 'app-hero-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    Uppercase
  ],
  templateUrl: './hero-form.html',
  styleUrl: './hero-form.scss',
})
export class HeroForm implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly heroService = inject(HeroService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private heroId: number | null = null;

  readonly editingHeroName = signal<string>('');
  readonly isEditMode = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly submitError = signal<string>('');

  readonly heroForm = this.formBuilder.group({
    name: this.formBuilder.nonNullable.control('', {
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ],
      asyncValidators: [this.uniqueHeroNameValidator()],
    }),
    alterEgo: this.formBuilder.nonNullable.control('', [
      Validators.maxLength(50),
    ]),
    power: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(100),
    ]),
    universe: this.formBuilder.control<HeroUniverse | null>(
      null,
      Validators.required,
    ),
    description: this.formBuilder.nonNullable.control('', [
      Validators.maxLength(300),
    ]),
  });

  ngOnInit(): void {
    const idParam: string | null = this.route.snapshot.paramMap.get('id');

    if (idParam === null) {
      return;
    }

    const parsedId: number = Number(idParam);

    if (!Number.isInteger(parsedId)) {
      void this.router.navigate(['/heroes']);
      return;
    }

    this.heroId = parsedId;
    this.isEditMode.set(true);

    this.heroService
      .getHeroById(parsedId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((hero: Hero | undefined) => {
        if (!hero) {
          void this.router.navigate(['/heroes']);
          return;
        }

        this.editingHeroName.set(hero.name);

        this.heroForm.patchValue({
          name: hero.name,
          alterEgo: hero.alterEgo ?? '',
          power: hero.power,
          universe: hero.universe,
          description: hero.description ?? '',
        });
      });
  }

  onSubmit(): void {
    if (this.heroForm.invalid || this.heroForm.pending) {
      this.heroForm.markAllAsTouched();
      return;
    }

    const formValue = this.heroForm.getRawValue();

    if (!formValue.universe) {
      return;
    }

    const heroData: HeroCreate = {
      name: formValue.name.trim(),
      power: formValue.power.trim(),
      universe: formValue.universe,
      ...(formValue.alterEgo.trim() && {
        alterEgo: formValue.alterEgo.trim(),
      }),
      ...(formValue.description.trim() && {
        description: formValue.description.trim(),
      }),
    };

    const operation$ =
      this.heroId === null
        ? this.heroService.createHero(heroData)
        : this.heroService.updateHero(this.heroId, heroData);

    this.isSubmitting.set(true);
    this.submitError.set('');

    operation$
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          void this.router.navigate(['/heroes']);
        },
        error: () => {
          this.submitError.set(
            'No se pudo guardar el héroe. Intentá nuevamente.',
          );
        },
      });
  }

  onCancel(): void {
    void this.router.navigate(['/heroes']);
  }

  private uniqueHeroNameValidator(): AsyncValidatorFn {
    return (
      control: AbstractControl,
    ): Observable<ValidationErrors | null> => {
      const normalizedName: string = String(control.value ?? '')
        .trim()
        .toLowerCase();

      if (!normalizedName) {
        return of(null);
      }

      return this.heroService.getHeroes().pipe(
        map((heroes: Hero[]): ValidationErrors | null => {
          const duplicatedName: boolean = heroes.some(
            (hero: Hero): boolean =>
              hero.id !== this.heroId &&
              hero.name.trim().toLowerCase() === normalizedName,
          );

          return duplicatedName ? { duplicatedName: true } : null;
        }),
        catchError(() => of(null)),
        take(1),
      );
    };
  }
}
