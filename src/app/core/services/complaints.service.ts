import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ComplaintRequest {
  title: string;
  description: string;
  category?: string;
  latitude?: number;
  longitude?: number;
}

export interface ComplaintResponse {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status: string;
  createdAt?: string;
  latitude?: number;
  longitude?: number;
  imageUrls?: string[];
}

@Injectable({ providedIn: 'root' })
export class ComplaintsService {
  private readonly baseUrl = `${environment.apiUrl}/complaints`;

  constructor(private readonly http: HttpClient) {}

  /** Submit complaint with optional images. Backend expects multipart: part "data" (JSON), optional part "images" (files). */
  submit(data: ComplaintRequest, images: File[] = []): Observable<ComplaintResponse> {
    const formData = new FormData();
    formData.append(
      'data',
      new Blob([JSON.stringify(data)], { type: 'application/json' })
    );
    for (const file of images) {
      formData.append('images', file, file.name);
    }
    return this.http.post<ComplaintResponse>(this.baseUrl, formData);
  }

  list(status?: string): Observable<ComplaintResponse[]> {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<ComplaintResponse[]>(this.baseUrl, { params });
  }

  getById(id: string): Observable<ComplaintResponse> {
    return this.http.get<ComplaintResponse>(`${this.baseUrl}/${id}`);
  }
}
