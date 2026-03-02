import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import type {
  ParliamentarianDetail,
  ParliamentarianSummary,
  VoteRecord,
} from '../models/parliamentarian.model';

interface ParliamentarianSummaryDto {
  readonly id: string;
  readonly fullName: string;
  readonly party?: string;
  readonly photoUrl?: string;
  readonly constituencyId?: string;
}

@Injectable({ providedIn: 'root' })
export class ParliamentariansService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/parliamentarians`;

  list(args: {
    readonly limit?: number;
    readonly offset?: number;
    readonly constituencyId: string;
  }): Observable<ParliamentarianSummary[]> {
    let params = new HttpParams();
    if (args.limit != null) params = params.set('limit', String(args.limit));
    if (args.offset != null) params = params.set('offset', String(args.offset));
    // Swagger: GET /api/parliamentarians/constituency/{constituencyId}
    return this.http
      .get<ParliamentarianSummaryDto[]>(
        `${this.baseUrl}/constituency/${encodeURIComponent(args.constituencyId)}`,
        { params }
      )
      .pipe(
        map((list) =>
          (list ?? []).map((dto) => ({
            id: dto.id,
            name: dto.fullName,
            party: dto.party,
            photoUrl: dto.photoUrl,
            constituencyId: dto.constituencyId ?? args.constituencyId,
          }))
        )
      );
  }

  getById(id: string): Observable<ParliamentarianDetail> {
    return this.http.get<ParliamentarianDetail>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }

  getVotes(
    id: string,
    args?: { readonly limit?: number; readonly offset?: number }
  ): Observable<VoteRecord[]> {
    let params = new HttpParams();
    if (args?.limit != null) params = params.set('limit', String(args.limit));
    if (args?.offset != null) params = params.set('offset', String(args.offset));
    return this.http.get<VoteRecord[]>(
      `${this.baseUrl}/${encodeURIComponent(id)}/votes`,
      { params }
    );
  }
}

