import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import type {
  LanguagePreference,
  ThemePreference,
  UserPreferences,
} from '../models/preferences.model';

const PREFS_KEY = 'usm_gov_preferences_v1';

function normalizeTheme(value: unknown): ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}

function normalizeLanguage(value: unknown): LanguagePreference {
  return value === 'en' || value === 'ms' || value === 'zh' ? value : 'en';
}

function normalizePrefs(raw: unknown): UserPreferences {
  const obj = (raw ?? {}) as { theme?: unknown; language?: unknown };
  return {
    theme: normalizeTheme(obj.theme),
    language: normalizeLanguage(obj.language),
  };
}

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users/me/preferences`;

  getLocal(): UserPreferences {
    if (typeof localStorage === 'undefined') {
      return { theme: 'system', language: 'en' };
    }
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { theme: 'system', language: 'en' };
    try {
      return normalizePrefs(JSON.parse(raw));
    } catch {
      return { theme: 'system', language: 'en' };
    }
  }

  setLocal(prefs: UserPreferences): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }

  /** Best-effort: returns local prefs if server unavailable/unauthorized. */
  getRemoteOrLocal(): Observable<UserPreferences> {
    return this.http.get<Record<string, unknown>>(this.baseUrl).pipe(
      map((obj) => normalizePrefs(obj)),
      tap((prefs) => this.setLocal(prefs)),
      catchError(() => of(this.getLocal()))
    );
  }

  /** Best-effort: always updates local, tries PATCH remote. */
  save(prefs: UserPreferences): Observable<UserPreferences> {
    this.setLocal(prefs);
    return this.http.patch<Record<string, unknown>>(this.baseUrl, prefs).pipe(
      map((obj) => normalizePrefs(obj)),
      tap((remotePrefs) => this.setLocal(remotePrefs)),
      catchError(() => of(prefs))
    );
  }
}

