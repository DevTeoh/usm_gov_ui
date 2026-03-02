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
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs/operators';
import { ParliamentariansService } from '../../../core/services/parliamentarians.service';
import type {
  ParliamentarianDetail,
  VoteRecord,
} from '../../../core/models/parliamentarian.model';

@Component({
  selector: 'app-parliamentarian-detail',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './parliamentarian-detail.component.html',
  styleUrl: './parliamentarian-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParliamentarianDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ParliamentariansService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly mp = signal<ParliamentarianDetail | null>(null);
  readonly votes = signal<readonly VoteRecord[]>([]);

  constructor() {
    this.route.paramMap
      .pipe(
        map((p) => p.get('id')),
        switchMap((id) => {
          if (!id) throw new Error('Missing parliamentarian id.');
          this.loading.set(true);
          this.error.set(null);
          this.votes.set([]);
          this.mp.set(null);
          return this.service.getById(id);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (detail) => {
          this.mp.set(detail);
          this.loading.set(false);
          // Load vote history after profile; independent request.
          this.loadVotes(detail.id);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.error.set(this.errorMessage(err, 'Failed to load parliamentarian.'));
        },
      });
  }

  private loadVotes(id: string): void {
    this.service
      .getVotes(id, { limit: 20 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => this.votes.set(list ?? []),
        error: () => {
          // Keep profile usable even if votes fail.
          this.votes.set([]);
        },
      });
  }

  private errorMessage(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse) {
      return (err.error as { message?: string } | null)?.message ?? fallback;
    }
    if (err instanceof Error) return err.message;
    return fallback;
  }
}

