import { Injectable, inject, signal } from '@angular/core';
import { PreferencesService } from './preferences.service';
import type { LanguagePreference } from '../models/preferences.model';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly prefs = inject(PreferencesService);

  private readonly language = signal<LanguagePreference>(this.prefs.getLocal().language);
  readonly current = this.language.asReadonly();

  init(): void {
    this.apply(this.language());
  }

  apply(lang: LanguagePreference): void {
    this.language.set(lang);
    document.documentElement.lang = lang;
  }
}

