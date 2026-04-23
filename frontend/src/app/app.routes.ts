import { Routes } from '@angular/router';
import { AddMovieComponent } from './movies/add-movie/add-movie';
import { RegisterComponent } from './auth/register/register';
import { LoginComponent } from './auth/login/login';


export const routes: Routes = [
  { path: 'add-movie', component: AddMovieComponent },

  {
    path: 'edit-movie/:id',
    loadComponent: () =>
      import('./movies/edit-movie/edit-movie').then(m => m.EditMovieComponent)
  },
  { 
    path: '', redirectTo: 'add-movie', pathMatch: 'full' },

  { path: 'register', component: RegisterComponent },
  { path: 'add-movie', component: AddMovieComponent },
  { path: 'login', component: LoginComponent }, 
];
