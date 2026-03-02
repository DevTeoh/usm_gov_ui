import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AnnouncementsService } from '../../../core/services/announcements.service';
import { AuthService } from '../../../core/services/auth.service';
import type { AnnouncementSummary } from '../../../core/models/announcement.model';

@Component({
  selector: 'app-announcements-list',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './announcements-list.component.html',
  styleUrl: './announcements-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnouncementsListComponent {
  private readonly announcementsService = inject(AnnouncementsService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly announcements = signal<readonly AnnouncementSummary[]>([]);

  readonly constituencyId = computed(() => this.auth.constituencyId());

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.error.set(null);

    this.announcementsService
      .list({ limit: 20, constituencyId: this.constituencyId() ?? undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.announcements.set(list ?? []);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          const message =
            err instanceof HttpErrorResponse
              ? (err.error as { message?: string } | null)?.message
              : undefined;
          this.error.set(message ?? 'Failed to load announcements.');
        },
      });
  }
}

