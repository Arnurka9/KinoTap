import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-shell">
      <header class="topbar">
        <a routerLink="/" class="brand" aria-label="KinoTap home">
          <img src="logo-transparent.png" alt="KinoTap logo" class="brand-logo" />
          <span class="brand-copy">
            <strong>KinoTap</strong>
            <small>Кино, коллекции и избранное</small>
          </span>
        </a>

        <nav class="nav">
          <a
            routerLink="/"
            routerLinkActive="nav-link-active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="nav-link"
          >
            Главная
          </a>
          <a routerLink="/catalog" routerLinkActive="nav-link-active" class="nav-link">Каталог</a>
          <a routerLink="/favorites" routerLinkActive="nav-link-active" class="nav-link">Избранное</a>
        </nav>

        <div class="actions">
          @if (isAuthenticated()) {
            <span class="user-pill">{{ displayName() }}</span>
            <button type="button" class="secondary-button" (click)="logout()">Выйти</button>
          } @else {
            <a routerLink="/login" class="primary-button">Войти</a>
            <a routerLink="/register" class="secondary-button">Регистрация</a>
          }
        </div>
      </header>

      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styleUrl: './app.css',
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly displayName = this.authService.displayName;

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}
