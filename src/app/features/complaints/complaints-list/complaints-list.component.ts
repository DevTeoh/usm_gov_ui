import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ComplaintsService, type ComplaintResponse } from '../../../core/services/complaints.service';

@Component({
  selector: 'app-complaints-list',
  standalone: true,
  imports: [DatePipe, RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './complaints-list.component.html',
  styleUrl: './complaints-list.component.css',
})
export class ComplaintsListComponent {
  private readonly complaintsService = inject(ComplaintsService);
  readonly complaints = signal<ComplaintResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.complaintsService.list().subscribe({
      next: (list) => {
        this.complaints.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Failed to load complaints.');
      },
    });
  }
}
