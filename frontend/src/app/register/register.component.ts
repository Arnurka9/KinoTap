import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="register-page">
      <section class="register-intro">
        <p class="eyebrow">Регистрация</p>
        <h1>Создание аккаунта в KinoTap</h1>
        <p>
          Зарегистрируйся, и система отправит письмо на указанную почту через SMTP.
          После этого можно войти в каталог, собирать избранное и оставлять отзывы.
        </p>

        <div class="intro-links">
          <a routerLink="/login" class="back-link">Уже есть аккаунт? Войти</a>
          <a routerLink="/catalog" class="back-link">Вернуться в каталог</a>
        </div>
      </section>

      <form class="register-card" (ngSubmit)="submit()">
        <label class="field">
          <span>Логин</span>
          <input
            type="text"
            name="username"
            [(ngModel)]="username"
            autocomplete="username"
            placeholder="Придумай логин"
            required
          />
        </label>

        <label class="field">
          <span>Почта</span>
          <input
            type="email"
            name="email"
            [(ngModel)]="email"
            autocomplete="email"
            placeholder="name@example.com"
            required
          />
        </label>

        <label class="field">
          <span>Пароль</span>
          <input
            type="password"
            name="password"
            [(ngModel)]="password"
            autocomplete="new-password"
            placeholder="Минимум 8 символов"
            required
          />
        </label>

        <label class="field">
          <span>Повтор пароля</span>
          <input
            type="password"
            name="confirmPassword"
            [(ngModel)]="confirmPassword"
            autocomplete="new-password"
            placeholder="Повтори пароль"
            required
          />
        </label>

        <button type="submit" class="submit-button" [disabled]="isSubmitting()">
          {{ isSubmitting() ? 'Создаём аккаунт...' : 'Создать аккаунт' }}
        </button>

        @if (errorMessage()) {
          <p class="feedback error">{{ errorMessage() }}</p>
        }
      </form>
    </section>
  `,
  styles: [
    `
      .register-page {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(320px, 460px);
        gap: 1.25rem;
        align-items: stretch;
      }

      .register-intro,
      .register-card {
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

      .register-intro p {
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

      .register-card {
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

      @media (max-width: 900px) {
        .register-page {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');

  username = '';
  email = '';
  password = '';
  confirmPassword = '';

  submit(): void {
    if (!this.username.trim() || !this.email.trim() || !this.password.trim() || !this.confirmPassword.trim()) {
      this.errorMessage.set('Заполните все поля регистрации.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Пароли не совпадают.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.authService.register({
      username: this.username,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword,
    }).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.router.navigate(['/login'], {
          queryParams: {
            registered: '1',
            username: response.username,
            emailSent: response.email_sent ? '1' : '0',
          },
        });
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(this.extractErrorMessage(error));
      },
    });
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    const payload = error.error;
    const fallback = 'Не удалось создать аккаунт. Проверьте данные и попробуйте снова.';

    if (typeof payload === 'string' && payload.trim()) {
      return payload;
    }

    if (!payload || typeof payload !== 'object') {
      return fallback;
    }

    const messages: string[] = [];

    for (const value of Object.values(payload)) {
      if (Array.isArray(value)) {
        messages.push(...value.map((item) => String(item)));
      } else {
        messages.push(String(value));
      }
    }

    return messages.filter(Boolean).join(' ') || fallback;
  }
}