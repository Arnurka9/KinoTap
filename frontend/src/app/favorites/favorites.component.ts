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
  template: `
    <section class="favorites-shell">
      <section class="favorites-hero">
        <div>
          <p class="eyebrow">Collections</p>
          <h1>Мое избранное</h1>
          <p>Список фильмов текущего пользователя с быстрым удалением прямо со страницы.</p>
        </div>
        <label class="search-field">
          <span>Поиск в избранном</span>
          <input type="text" [(ngModel)]="searchTerm" placeholder="Введите название фильма" />
        </label>
      </section>

      @if (errorMessage()) {
        <section class="state-card error-card">{{ errorMessage() }}</section>
      }

      @if (isLoading()) {
        <section class="state-card">Загрузка избранного...</section>
      } @else {
        <section class="favorites-grid">
          @for (favorite of filteredFavorites(); track favorite.id) {
            <article class="favorite-card">
              <a [routerLink]="['/catalog', favorite.movie.id]" class="poster-link">
                <img [src]="favorite.movie.poster || fallbackPoster" [alt]="favorite.movie.title" />
              </a>
              <div class="card-content">
                <div>
                  <h2>{{ favorite.movie.title }}</h2>
                  <p>Добавлено {{ favorite.added_at | date: 'mediumDate' }}</p>
                </div>
                <div class="card-actions">
                  <a [routerLink]="['/catalog', favorite.movie.id]" class="secondary-link">Открыть</a>
                  <button type="button" class="remove-button" (click)="removeFavorite(favorite.movie.id)">
                    Удалить
                  </button>
                </div>
              </div>
            </article>
          } @empty {
            <section class="state-card">В избранном пока пусто.</section>
          }
        </section>
      }
    </section>
  `,
  styles: [
    `
      .favorites-shell {
        display: grid;
        gap: 1.5rem;
      }

      .favorites-hero,
      .favorite-card,
      .state-card {
        padding: 1.5rem;
        border-radius: 1.6rem;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.06);
      }

      .favorites-hero {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: end;
      }

      .eyebrow {
        margin: 0 0 0.7rem;
        color: var(--accent);
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 0.78rem;
      }

      h1,
      h2,
      p {
        margin: 0;
      }

      h1 {
        font-size: clamp(2rem, 5vw, 3rem);
      }

      .favorites-hero p,
      .search-field span,
      .card-content p {
        color: var(--muted-text);
      }

      .search-field {
        display: grid;
        gap: 0.55rem;
        min-width: min(100%, 18rem);
      }

      .search-field input {
        padding: 0.95rem 1rem;
        border-radius: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(8, 8, 14, 0.85);
        color: var(--text-color);
        outline: none;
      }

      .favorites-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
        gap: 1rem;
      }

      .favorite-card {
        display: grid;
        gap: 1rem;
      }

      .poster-link {
        display: block;
        overflow: hidden;
        border-radius: 1.25rem;
      }

      .poster-link img {
        width: 100%;
        aspect-ratio: 16 / 10;
        object-fit: cover;
        display: block;
      }

      .card-content {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: end;
      }

      .card-actions {
        display: flex;
        gap: 0.7rem;
        align-items: center;
      }

      .secondary-link,
      .remove-button {
        padding: 0.8rem 1rem;
        border-radius: 999px;
        text-decoration: none;
        border: 0;
      }

      .secondary-link {
        background: rgba(255, 255, 255, 0.07);
        color: var(--text-color);
      }

      .remove-button {
        background: rgba(255, 92, 92, 0.18);
        color: #ffb1b1;
        cursor: pointer;
      }

      .error-card {
        color: var(--danger);
      }

      @media (max-width: 860px) {
        .favorites-hero,
        .card-content {
          display: grid;
        }
      }
    `,
  ],
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
