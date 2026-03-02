import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-complaint-submit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './complaint-submit.component.html',
  styleUrl: './complaint-submit.component.css',
})
export class ComplaintSubmitComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required]],
    category: ['general'],
  });

  cancel(): void {
    this.router.navigate(['/complaints']);
  }

  onSubmit(): void {
    this.error.set(null);
    if (this.form.invalid) return;
    this.loading.set(true);
    // TODO: call complaints API
    setTimeout(() => {
      this.loading.set(false);
      this.router.navigate(['/complaints']);
    }, 500);
  }
}
