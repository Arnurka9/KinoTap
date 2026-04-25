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
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
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