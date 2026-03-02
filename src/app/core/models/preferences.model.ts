export type ThemePreference = 'system' | 'light' | 'dark';

export type LanguagePreference = 'en' | 'ms' | 'zh';

export interface UserPreferences {
  readonly theme: ThemePreference;
  readonly language: LanguagePreference;
}

