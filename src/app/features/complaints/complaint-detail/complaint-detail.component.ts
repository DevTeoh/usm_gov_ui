import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs/operators';
import { ComplaintsService, type ComplaintResponse } from '../../../core/services/complaints.service';

@Component({
  selector: 'app-complaint-detail',
  standalone: true,
  imports: [DatePipe, RouterLink, MatCardModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './complaint-detail.component.html',
  styleUrl: './complaint-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplaintDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly complaintsService = inject(ComplaintsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly complaint = signal<ComplaintResponse | null>(null);

  constructor() {
    this.route.paramMap
      .pipe(
        map((p) => p.get('id')),
        switchMap((id) => {
          if (!id) throw new Error('Missing complaint id.');
          this.loading.set(true);
          this.error.set(null);
          return this.complaintsService.getById(id);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (c) => {
          this.complaint.set(c);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          const message =
            err instanceof HttpErrorResponse
              ? (err.error as { message?: string } | null)?.message
              : err instanceof Error
                ? err.message
                : undefined;
          this.error.set(message ?? 'Failed to load complaint.');
        },
      });
  }
}

