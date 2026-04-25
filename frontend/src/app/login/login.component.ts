import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
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