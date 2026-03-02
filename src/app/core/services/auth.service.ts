import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import type { AuthUser, AuthTokens, UserRole } from '../models/user.model';

const TOKEN_KEY = 'usm_gov_access_token';
const REFRESH_KEY = 'usm_gov_refresh_token';
const USER_KEY = 'usm_gov_user';
const EXPIRES_AT_KEY = 'usm_gov_expires_at';

const USER_ROLES: readonly UserRole[] = [
  'VOTER',
  'MP',
  'CONSTITUENCY_ADMIN',
  'CENTRAL_GOV_ADMIN',
  'DEVELOPER',
] as const;

function asUserRole(value: string | undefined): UserRole {
  if (value && (USER_ROLES as readonly string[]).includes(value)) {
    return value as UserRole;
  }
  return 'VOTER';
}

export interface LoginRequest {
  icNumber?: string;
  email?: string;
  password: string;
}

/** Backend returns flat fields (userId, role, constituencyId); we normalize to this. */
export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  user: AuthUser;
  requiresTwoFactor?: boolean;
}

/** Raw response from API (matches Spring Boot DTO). */
interface LoginResponseDto {
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  role?: string;
  constituencyId?: string;
  requiresTwoFactor?: boolean;
}

/** Matches backend RegisterRequest: "name" maps to fullName, dateOfBirth as ISO "yyyy-MM-dd". */
export interface RegisterRequest {
  icNumber: string;
  email: string;
  password: string;
  name: string;
  dateOfBirth: string;
  constituencyId?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly userSignal = signal<AuthUser | null>(this.loadStoredUser());
  private readonly tokenSignal = signal<string | null>(this.loadStoredToken());
  /** When backend returns requiresTwoFactor, we store the token to send with 2FA verify. */
  private pending2FAToken: string | null = null;

  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => {
    const token = this.tokenSignal();
    if (!token) return false;
    const expiresAt = this.loadStoredExpiresAt();
    if (!expiresAt) return true;
    return Date.now() < expiresAt;
  });
  readonly currentRole = computed(() => this.userSignal()?.role ?? null);
  readonly constituencyId = computed(() => this.userSignal()?.constituencyId ?? null);

  /** Normalize backend DTO (flat userId/role/constituencyId) to LoginResponse with user object. */
  private normalizeLoginResponse(dto: LoginResponseDto): LoginResponse {
    const user: AuthUser = {
      id: dto.userId ?? '',
      role: asUserRole(dto.role),
      constituencyId: dto.constituencyId ?? undefined,
    };
    return {
      accessToken: dto.accessToken ?? '',
      refreshToken: dto.refreshToken,
      user,
      requiresTwoFactor: dto.requiresTwoFactor ?? false,
    };
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const icOrEmail = (credentials.icNumber ?? credentials.email ?? '').trim();
    const body = { icOrEmail, password: credentials.password };
    return this.http
      .post<LoginResponseDto>(`${environment.apiUrl}/auth/login`, body)
      .pipe(
        tap((dto) => {
          const res = this.normalizeLoginResponse(dto);
          if (res.requiresTwoFactor && res.accessToken) {
            this.pending2FAToken = res.accessToken;
          } else if (res.accessToken) {
            this.setSession(res);
          }
        }),
        map((dto) => this.normalizeLoginResponse(dto)),
        catchError((err: unknown) => throwError(() => err))
      );
  }

  verifyOtp(otp: string): Observable<LoginResponse> {
    const token = this.pending2FAToken;
    if (!token) {
      return throwError(() => new Error('No pending 2FA session. Please log in again.'));
    }
    const params = { token, code: otp };
    return this.http
      .post<LoginResponseDto>(
        `${environment.apiUrl}/auth/2fa/verify`,
        null,
        { params }
      )
      .pipe(
        tap((dto) => {
          this.pending2FAToken = null;
          this.setSession(this.normalizeLoginResponse(dto));
        }),
        map((dto) => this.normalizeLoginResponse(dto))
      );
  }

  register(payload: RegisterRequest): Observable<{ id: string; message?: string }> {
    const body = {
      fullName: payload.name,
      email: payload.email,
      icNumber: payload.icNumber,
      dateOfBirth: payload.dateOfBirth,
      password: payload.password,
      ...(payload.constituencyId != null && payload.constituencyId !== ''
        ? { constituencyId: payload.constituencyId }
        : {}),
    };
    return this.http.post<{ id: string; message?: string }>(
      `${environment.apiUrl}/auth/register`,
      body
    );
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
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
    if (expiresAt) {
      localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
    } else {
      localStorage.removeItem(EXPIRES_AT_KEY);
    }
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  hasRole(role: UserRole | readonly UserRole[]): boolean {
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

  private loadStoredExpiresAt(): number | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(EXPIRES_AT_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
}
