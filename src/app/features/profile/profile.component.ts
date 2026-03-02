import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);

  readonly darkMode = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: [''],
    email: [''],
  });

  constructor() {
    const u = this.auth.user();
    if (u) {
      this.form.patchValue({ name: u.name ?? '', email: u.email ?? '' });
    }
  }

  onDarkModeChange(checked: boolean): void {
    this.darkMode.set(checked);
    document.documentElement.classList.toggle('dark-theme', checked);
  }
}
