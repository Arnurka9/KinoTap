import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'] 
})
export class LoginComponent {

  user = {
    username: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    console.log('LOGIN DATA:', this.user);

    this.authService.login(this.user).subscribe({
      next: (res) => {
        console.log('SUCCESS:', res);

        localStorage.setItem('token', res.access);

        alert('Login successful!');
        this.router.navigate(['/add-movie']);
      },
      error: (err) => {
        console.error('ERROR:', err);
        alert('Wrong username or password');
      }
    });
  }
}
