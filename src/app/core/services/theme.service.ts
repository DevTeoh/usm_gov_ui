import { Injectable, computed, inject, signal } from '@angular/core';
import { PreferencesService } from './preferences.service';
import type { ThemePreference } from '../models/preferences.model';

type ResolvedTheme = 'light' | 'dark';

function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === 'light' || pref === 'dark') return pref;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly prefs = inject(PreferencesService);

  private readonly themePref = signal<ThemePreference>(this.prefs.getLocal().theme);
  readonly preference = this.themePref.asReadonly();
  readonly resolved = computed(() => resolveTheme(this.themePref()));

  init(): void {
    this.apply(this.themePref());
    // Keep system theme in sync.
    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener?.('change', () => {
        if (this.themePref() === 'system') this.apply('system');
      });
    }
  }

  apply(pref: ThemePreference): void {
    this.themePref.set(pref);
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'theme-system');
    root.classList.add(pref === 'light' ? 'theme-light' : pref === 'dark' ? 'theme-dark' : 'theme-system');
  }
}

