import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { PreferencesService } from '../../core/services/preferences.service';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';
import type {
  LanguagePreference,
  ThemePreference,
  UserPreferences,
} from '../../core/models/preferences.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  private readonly prefsService = inject(PreferencesService);
  private readonly theme = inject(ThemeService);
  private readonly language = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly saved = signal(false);

  readonly themeOptions: readonly { value: ThemePreference; label: string }[] = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ] as const;

  readonly languageOptions: readonly { value: LanguagePreference; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'ms', label: 'Malay' },
    { value: 'zh', label: 'Chinese' },
  ] as const;

  readonly form = this.fb.nonNullable.group({
    name: [''],
    email: [''],
    theme: ['system' as ThemePreference, [Validators.required]],
    language: ['en' as LanguagePreference, [Validators.required]],
  });

  constructor() {
    const u = this.auth.user();
    if (u) {
      this.form.patchValue({ name: u.name ?? '', email: u.email ?? '' });
    }
    const local = this.prefsService.getLocal();
    this.form.patchValue({ theme: local.theme, language: local.language });

    // If authenticated, pull preferences from backend (best-effort).
    this.prefsService
      .getRemoteOrLocal()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((prefs) => {
        this.form.patchValue({ theme: prefs.theme, language: prefs.language }, { emitEvent: false });
        this.theme.apply(prefs.theme);
        this.language.apply(prefs.language);
      });
  }

  onThemeChange(value: ThemePreference): void {
    this.theme.apply(value);
  }

  onLanguageChange(value: LanguagePreference): void {
    this.language.apply(value);
  }

  savePreferences(): void {
    this.error.set(null);
    this.saved.set(false);
    const prefs: UserPreferences = {
      theme: this.form.controls.theme.value,
      language: this.form.controls.language.value,
    };
    this.saving.set(true);
    this.prefsService
      .save(prefs)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (saved) => {
          this.saving.set(false);
          this.theme.apply(saved.theme);
          this.language.apply(saved.language);
          this.saved.set(true);
          setTimeout(() => this.saved.set(false), 1500);
        },
        error: (err: unknown) => {
          this.saving.set(false);
          const msg =
            err instanceof HttpErrorResponse
              ? (err.error as { message?: string } | null)?.message
              : undefined;
          this.error.set(msg ?? 'Failed to save preferences.');
        },
      });
  }
}
