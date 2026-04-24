import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="login-page">
      <section class="login-intro">
        <p class="eyebrow">Авторизация</p>
        <h1>Вход в KinoTap</h1>
        <p>
          Для демо-проверки используйте аккаунт <strong>demo / demo1234</strong>.
          После входа можно открыть избранное и оставить отзыв.
        </p>

        @if (successMessage()) {
          <p class="feedback success">{{ successMessage() }}</p>
        }

        <div class="intro-links">
          <a routerLink="/catalog" class="back-link">Вернуться в каталог</a>
          <a routerLink="/register" class="back-link">Нет аккаунта? Зарегистрироваться</a>
        </div>
      </section>

      <form class="login-card" (ngSubmit)="submit()">
        <label class="field">
          <span>Логин</span>
          <input
            type="text"
            name="username"
            [(ngModel)]="username"
            autocomplete="username"
            placeholder="Введите логин"
            required
          />
        </label>

        <label class="field">
          <span>Пароль</span>
          <input
            type="password"
            name="password"
            [(ngModel)]="password"
            autocomplete="current-password"
            placeholder="Введите пароль"
            required
          />
        </label>

        <button type="submit" class="submit-button" [disabled]="isSubmitting()">
          {{ isSubmitting() ? 'Входим...' : 'Войти' }}
        </button>

        @if (errorMessage()) {
          <p class="feedback error">{{ errorMessage() }}</p>
        }
      </form>
    </section>
  `,
  styles: [
    `
      .login-page {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(320px, 440px);
        gap: 1.25rem;
        align-items: stretch;
      }

      .login-intro,
      .login-card {
        padding: 1.7rem;
        border-radius: 1.9rem;
        border: 1px solid rgba(255, 255, 255, 0.06);
        background: rgba(255, 255, 255, 0.04);
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.34);
      }

      .eyebrow {
        margin: 0 0 0.65rem;
        color: var(--accent);
        text-transform: uppercase;
        letter-spacing: 0.2em;
        font-size: 0.76rem;
      }

      h1 {
        margin: 0;
        font-size: clamp(2.4rem, 5vw, 4rem);
        line-height: 0.96;
      }

      .login-intro p {
        max-width: 34rem;
        margin: 1rem 0 0;
        color: var(--muted-text);
        line-height: 1.65;
      }

      .intro-links {
        display: flex;
        flex-wrap: wrap;
        gap: 0.95rem;
        margin-top: 1.25rem;
      }

      .back-link {
        display: inline-flex;
        text-decoration: none;
        color: #ffffff;
        opacity: 0.82;
      }

      .login-card {
        display: grid;
        gap: 1rem;
        align-content: start;
        background: linear-gradient(180deg, rgba(124, 58, 237, 0.14), rgba(255, 255, 255, 0.04));
      }

      .field {
        display: grid;
        gap: 0.55rem;
      }

      .field span {
        color: var(--muted-text);
        font-size: 0.95rem;
      }

      .field input {
        min-height: 48px;
        padding: 0.95rem 1rem;
        border-radius: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(8, 8, 14, 0.82);
        color: var(--text-color);
        outline: none;
      }

      .field input:focus {
        border-color: rgba(157, 78, 221, 0.6);
        box-shadow: 0 0 0 4px rgba(157, 78, 221, 0.18);
      }

      .submit-button {
        min-height: 48px;
        border: 0;
        border-radius: 1rem;
        background: linear-gradient(135deg, var(--accent), var(--accent-strong));
        color: #ffffff;
        font-weight: 700;
        cursor: pointer;
      }

      .submit-button:disabled {
        cursor: wait;
        opacity: 0.75;
      }

      .feedback {
        margin: 0;
      }

      .error {
        color: var(--danger);
      }

      .success {
        color: var(--success);
      }

      @media (max-width: 900px) {
        .login-page {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  username = 'demo';
  password = 'demo1234';
  private returnUrl = '/catalog';

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/catalog';

    const registered = this.route.snapshot.queryParamMap.get('registered');

    if (registered === '1') {
      const registeredUsername = this.route.snapshot.queryParamMap.get('username')?.trim() ?? '';
      const emailSent = this.route.snapshot.queryParamMap.get('emailSent');

      if (registeredUsername) {
        this.username = registeredUsername;
        this.password = '';
      }

      this.successMessage.set(
        emailSent === '0'
          ? 'Аккаунт создан, но письмо не отправлено. Проверь SMTP-настройки.'
          : 'Аккаунт создан. Проверьте почту и войдите.'
      );
    }

    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  submit(): void {
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage.set('Заполните логин и пароль.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigateByUrl(this.returnUrl);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Не удалось войти. Проверьте demo-аккаунт или данные пользователя.');
      },
    });
  }
}