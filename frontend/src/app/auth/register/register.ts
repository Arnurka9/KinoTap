import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {

  user = {
  username: '',
  password: '',
  password2: ''
};

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  submit() {
    this.authService.register(this.user).subscribe({
      next: () => {
        alert('User created!');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        alert('Error!');
        console.error(err);
      }
    });
  }
}
