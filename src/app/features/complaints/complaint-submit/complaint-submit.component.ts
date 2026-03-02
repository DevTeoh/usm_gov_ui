import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ComplaintsService, type ComplaintRequest } from '../../../core/services/complaints.service';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplaintSubmitComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly complaintsService = inject(ComplaintsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedImages = signal<readonly File[]>([]);
  readonly location = signal<{ lat: number; lng: number } | null>(null);
  readonly locationLoading = signal(false);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required]],
    category: ['general'],
  });

  cancel(): void {
    this.router.navigate(['/complaints']);
  }

  onFilesSelected(evt: Event): void {
    const input = evt.target as HTMLInputElement | null;
    const files = input?.files ? Array.from(input.files) : [];
    this.selectedImages.set(files);
  }

  clearFiles(): void {
    this.selectedImages.set([]);
  }

  useMyLocation(): void {
    if (!('geolocation' in navigator)) {
      this.error.set('Geolocation is not supported on this device/browser.');
      return;
    }
    this.locationLoading.set(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.location.set({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        this.locationLoading.set(false);
      },
      () => {
        this.locationLoading.set(false);
        this.error.set('Unable to get your location. Please check permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  clearLocation(): void {
    this.location.set(null);
  }

  onSubmit(): void {
    this.error.set(null);
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const loc = this.location();
    const data: ComplaintRequest = {
      title: raw.title,
      description: raw.description,
      category: raw.category || undefined,
      ...(loc ? { latitude: loc.lat, longitude: loc.lng } : {}),
    };
    this.loading.set(true);
    this.complaintsService
      .submit(data, [...this.selectedImages()])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/complaints']);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          const msg =
            err instanceof HttpErrorResponse
              ? (err.error as { message?: string } | null)?.message
              : undefined;
          this.error.set(
            msg ??
              (err instanceof HttpErrorResponse && err.status === 0
                ? 'Cannot reach server.'
                : 'Failed to submit complaint.')
          );
        },
      });
  }
}
