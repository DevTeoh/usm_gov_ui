import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PreferencesService } from './core/services/preferences.service';
import { ThemeService } from './core/services/theme.service';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('usm-gov-ui');

  private readonly prefs = inject(PreferencesService);
  private readonly theme = inject(ThemeService);
  private readonly language = inject(LanguageService);

  constructor() {
    // Apply local prefs immediately (before any API calls).
    const local = this.prefs.getLocal();
    this.theme.apply(local.theme);
    this.language.apply(local.language);
    this.theme.init();
    this.language.init();
  }
}
