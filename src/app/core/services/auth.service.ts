import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AuthUser, AuthTokens } from '../models/user.model';

const TOKEN_KEY = 'usm_gov_access_token';
const REFRESH_KEY = 'usm_gov_refresh_token';
const USER_KEY = 'usm_gov_user';

export interface LoginRequest {
  icNumber?: string;
  email?: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  user: AuthUser;
  requiresTwoFactor?: boolean;
}

export interface RegisterRequest {
  icNumber: string;
  email: string;
  password: string;
  name: string;
  dateOfBirth: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSignal = signal<AuthUser | null>(this.loadStoredUser());
  private readonly tokenSignal = signal<string | null>(this.loadStoredToken());

  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly currentRole = computed(() => this.userSignal()?.role ?? null);
  readonly constituencyId = computed(() => this.userSignal()?.constituencyId ?? null);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((res) => {
          if (!res.requiresTwoFactor && res.accessToken) {
            this.setSession(res);
          }
        }),
        catchError((err) => {
          throw err;
        })
      );
  }

  verifyOtp(otp: string, tempToken?: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/verify-otp`, { otp, tempToken })
      .pipe(tap((res) => this.setSession(res)));
  }

  register(payload: RegisterRequest): Observable<{ id: string; message?: string }> {
    return this.http.post<{ id: string; message?: string }>(
      `${environment.apiUrl}/auth/register`,
      payload
    );
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this.router.navigate(['/auth/login']);
  }

  setSession(response: LoginResponse): void {
    const expiresAt = response.expiresIn
      ? Date.now() + response.expiresIn * 1000
      : undefined;
    this.tokenSignal.set(response.accessToken);
    this.userSignal.set(response.user);
    localStorage.setItem(TOKEN_KEY, response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem(REFRESH_KEY, response.refreshToken);
    }
    if (response.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  hasRole(role: string | string[]): boolean {
    const current = this.currentRole();
    if (!current) return false;
    return Array.isArray(role) ? role.includes(current) : current === role;
  }

  private loadStoredToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private loadStoredUser(): AuthUser | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
