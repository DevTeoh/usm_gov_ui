import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService, type RegisterRequest } from '../../../core/services/auth.service';

const MIN_AGE = 18;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    icNumber: ['', [Validators.required]],
    dateOfBirth: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly isEligible = computed(() => {
    const dob = this.form.controls.dateOfBirth.value;
    if (!dob) return true;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= MIN_AGE;
  });

  onSubmit(): void {
    this.error.set(null);
    if (!this.isEligible()) {
      this.error.set(`You must be at least ${MIN_AGE} years old to register.`);
      return;
    }
    const raw = this.form.getRawValue();
    const payload: RegisterRequest = {
      name: raw.name,
      email: raw.email,
      icNumber: raw.icNumber,
      dateOfBirth: raw.dateOfBirth,
      password: raw.password,
    };
    this.loading.set(true);
    this.auth.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Registration failed. Please try again.');
      },
    });
  }
}
