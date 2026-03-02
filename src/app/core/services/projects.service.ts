import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ProjectDetail, ProjectSummary } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/projects`;

  list(args?: {
    readonly constituencyId?: string;
    readonly limit?: number;
    readonly offset?: number;
    readonly summary?: boolean;
  }): Observable<ProjectSummary[]> {
    let params = new HttpParams();
    if (args?.constituencyId) params = params.set('constituencyId', args.constituencyId);
    if (args?.limit != null) params = params.set('limit', String(args.limit));
    if (args?.offset != null) params = params.set('offset', String(args.offset));
    if (args?.summary != null) params = params.set('summary', String(args.summary));
    return this.http.get<ProjectSummary[]>(this.baseUrl, { params });
  }

  getById(id: string): Observable<ProjectDetail> {
    return this.http.get<ProjectDetail>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }
}

