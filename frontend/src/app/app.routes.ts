import { Routes } from '@angular/router';
import { MovieListComponent } from './movie-list/movie-list.component';
import { MovieDetailComponent } from './movie-detail/movie-detail.component';
import { CollectionDetailComponent } from './collection-detail/collection-detail.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'catalog', component: MovieListComponent },
  { path: 'catalog/:id', component: MovieDetailComponent },
  { path: 'collections/:id', component: CollectionDetailComponent },
  { path: 'movies', redirectTo: 'catalog', pathMatch: 'full' },
  { path: 'movies/:id', redirectTo: 'catalog/:id', pathMatch: 'full' },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: 'catalog' }
];
