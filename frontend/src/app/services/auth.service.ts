import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { LoginCredentials, LoginResponse, RegistrationCredentials, RegistrationResponse } from '../models';

interface AuthSession {
  username: string;
  access: string;
  refresh: string;
}

const STORAGE_KEY = 'kinotap.auth';
const BASE_URL = 'http://localhost:8000/api';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessionState = signal<AuthSession | null>(this.loadSession());

  readonly accessToken = computed(() => this.sessionState()?.access ?? null);
  readonly isAuthenticated = computed(() => !!this.sessionState()?.access);
  readonly displayName = computed(() => this.sessionState()?.username ?? 'Гость');

  login(credentials: LoginCredentials): Observable<void> {
    const username = credentials.username.trim();

    return this.http.post<LoginResponse>(`${BASE_URL}/login/`, {
      username,
      password: credentials.password,
    }).pipe(
      tap((response) => {
        this.setSession({
          username,
          access: response.access,
          refresh: response.refresh,
        });
      }),
      map(() => void 0)
    );
  }

  register(credentials: RegistrationCredentials): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${BASE_URL}/register/`, {
      username: credentials.username.trim(),
      email: credentials.email.trim(),
      password: credentials.password,
      confirm_password: credentials.confirmPassword,
    });
  }

  logout(): Observable<void> {
    const refresh = this.sessionState()?.refresh;

    if (!refresh) {
      this.clearSession();
      return of(void 0);
    }

    return this.http.post<void>(`${BASE_URL}/logout/`, { refresh }).pipe(
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of(void 0);
      }),
      map(() => void 0)
    );
  }

  private loadSession(): AuthSession | null {
    const rawSession = localStorage.getItem(STORAGE_KEY);

    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession) as AuthSession;
    } catch {
      return null;
    }
  }

  private setSession(session: AuthSession): void {
    this.sessionState.set(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  private clearSession(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.sessionState.set(null);
  }
}