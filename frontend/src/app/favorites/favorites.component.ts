import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Favorite } from '../models';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css',
})
export class FavoritesComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly favorites = signal<Favorite[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  searchTerm = '';
  readonly fallbackPoster = 'https://placehold.co/640x400/11131c/f5f7fb?text=KinoTap';

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.api.getFavorites().subscribe({
      next: (favorites) => {
        this.favorites.set(favorites);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          error.status === 401
            ? 'Нужно войти в аккаунт, чтобы увидеть избранное.'
            : 'Не удалось загрузить избранное.'
        );
        this.favorites.set([]);
        this.isLoading.set(false);
      },
    });
  }

  filteredFavorites(): Favorite[] {
    const query = this.searchTerm.trim().toLowerCase();

    if (!query) {
      return this.favorites();
    }

    return this.favorites().filter((favorite) =>
      favorite.movie.title.toLowerCase().includes(query)
    );
  }

  removeFavorite(movieId: number): void {
    this.api.toggleFavorite(movieId).subscribe({
      next: () => {
        this.favorites.update((favorites) =>
          favorites.filter((favorite) => favorite.movie.id !== movieId)
        );
      },
      error: () => {
        this.errorMessage.set('Не удалось удалить фильм из избранного.');
      },
    });
  }
}
