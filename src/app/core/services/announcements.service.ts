import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AnnouncementDetail, AnnouncementSummary } from '../models/announcement.model';

@Injectable({ providedIn: 'root' })
export class AnnouncementsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/announcements`;

  list(args?: {
    readonly limit?: number;
    readonly offset?: number;
    readonly constituencyId?: string;
  }): Observable<AnnouncementSummary[]> {
    let params = new HttpParams();
    if (args?.limit != null) params = params.set('limit', String(args.limit));
    if (args?.offset != null) params = params.set('offset', String(args.offset));
    if (args?.constituencyId) params = params.set('constituencyId', args.constituencyId);
    return this.http.get<AnnouncementSummary[]>(this.baseUrl, { params });
  }

  getById(id: string): Observable<AnnouncementDetail> {
    return this.http.get<AnnouncementDetail>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }
}

