import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService, type LoginRequest } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showOtpStep = signal(false);

  readonly form = this.fb.nonNullable.group({
    icNumber: [''],
    email: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly otpForm = this.fb.nonNullable.group({
    otp: ['', [Validators.required, Validators.minLength(4)]],
  });

  onSubmit(): void {
    this.error.set(null);
    const { icNumber, email, password } = this.form.getRawValue();
    if (!password) return;
    const hasId = !!(icNumber?.trim() || email?.trim());
    if (!hasId) {
      this.error.set('Please enter IC number or email.');
      return;
    }
    this.loading.set(true);
    const request: LoginRequest = {
      password,
      ...(icNumber?.trim() ? { icNumber: icNumber.trim() } : {}),
      ...(email?.trim() ? { email: email.trim() } : {}),
    };
    this.auth.login(request).subscribe({
      next: (res) => {
        if (res.requiresTwoFactor) {
          this.showOtpStep.set(true);
          this.loading.set(false);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Login failed. Please try again.');
      },
    });
  }

  onOtpSubmit(): void {
    this.error.set(null);
    const otp = this.otpForm.getRawValue().otp;
    if (!otp) return;
    this.loading.set(true);
    this.auth.verifyOtp(otp).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Invalid OTP.');
      },
    });
  }
}
