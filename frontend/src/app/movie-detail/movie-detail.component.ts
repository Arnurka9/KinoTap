import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Movie, Review } from '../models';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    @if (movie(); as currentMovie) {
      <section class="detail-shell">
        <a routerLink="/catalog" class="back-link">Назад к каталогу</a>

        <section class="detail-card">
          <img [src]="currentMovie.poster || fallbackPoster" [alt]="currentMovie.title" class="poster" />

          <div class="detail-content">
            <div class="detail-top">
              <div>
                <p class="eyebrow">{{ currentMovie.genre }}</p>
                <h1>{{ currentMovie.title }}</h1>
              </div>
              <div class="score-box">
                <span>{{ currentMovie.rating | number: '1.1-1' }}</span>
                <small>Рейтинг</small>
              </div>
            </div>

            <p class="description">{{ currentMovie.description }}</p>

            <div class="stats">
              <div>
                <strong>{{ currentMovie.reviews_count }}</strong>
                <span>отзывов</span>
              </div>
              <div>
                <strong>{{ currentMovie.is_favorite ? 'Да' : 'Нет' }}</strong>
                <span>в избранном</span>
              </div>
            </div>

            <div class="actions">
              <button type="button" class="primary-button" (click)="toggleFavorite()">
                {{ currentMovie.is_favorite ? 'Убрать из избранного' : 'Добавить в избранное' }}
              </button>
            </div>

            @if (favoriteMessage()) {
              <p class="feedback success">{{ favoriteMessage() }}</p>
            }

            @if (errorMessage()) {
              <p class="feedback error">{{ errorMessage() }}</p>
            }
          </div>
        </section>

        <section class="reviews-layout">
          <section class="reviews-panel">
            <div class="panel-header">
              <div>
                <h2>Отзывы</h2>
                <p>Оставить отзыв может только авторизованный пользователь.</p>
              </div>

              <label class="field compact-field">
                <span>Поиск по отзывам</span>
                <input
                  type="text"
                  [(ngModel)]="reviewsQuery"
                  placeholder="Фильтр по тексту или автору"
                />
              </label>
            </div>

            @if (reviewsLoading()) {
              <div class="review-state">Загрузка отзывов...</div>
            } @else {
              <div class="review-list">
                @for (review of filteredReviews(); track review.id) {
                  <article class="review-card">
                    <div class="review-head">
                      <strong>{{ review.user }}</strong>
                      <span>{{ review.created_at | date: 'medium' }}</span>
                    </div>
                    <p>{{ review.text }}</p>
                  </article>
                } @empty {
                  <div class="review-state">Пока нет отзывов. Будьте первым.</div>
                }
              </div>
            }
          </section>

          <section class="reviews-panel form-panel">
            <h2>Добавить отзыв</h2>
            <label class="field">
              <span>Ваш отзыв</span>
              <textarea
                [(ngModel)]="reviewText"
                placeholder="Поделитесь впечатлением о фильме"
              ></textarea>
            </label>

            <button type="button" class="primary-button" (click)="submitReview()" [disabled]="isSubmitting()">
              {{ isSubmitting() ? 'Отправка...' : 'Отправить отзыв' }}
            </button>

            @if (reviewMessage()) {
              <p class="feedback success">{{ reviewMessage() }}</p>
            }

            @if (reviewError()) {
              <p class="feedback error">{{ reviewError() }}</p>
            }
          </section>
        </section>
      </section>
    } @else if (isLoading()) {
      <section class="detail-shell">
        <section class="detail-card loading-card">Загрузка фильма...</section>
      </section>
    } @else {
      <section class="detail-shell">
        <section class="detail-card loading-card">Фильм не найден.</section>
      </section>
    }
  `,
  styles: [
    `
      .detail-shell {
        display: grid;
        gap: 1.5rem;
      }

      .back-link {
        width: fit-content;
        color: var(--muted-text);
        text-decoration: none;
      }

      .detail-card,
      .reviews-panel {
        padding: 1.5rem;
        border-radius: 1.75rem;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.06);
      }

      .detail-card {
        display: grid;
        grid-template-columns: minmax(260px, 320px) 1fr;
        gap: 1.5rem;
      }

      .poster {
        width: 100%;
        height: 100%;
        min-height: 28rem;
        object-fit: cover;
        border-radius: 1.3rem;
      }

      .detail-content {
        display: grid;
        gap: 1.1rem;
      }

      .detail-top {
        display: flex;
        justify-content: space-between;
        gap: 1.2rem;
        align-items: start;
      }

      .eyebrow {
        margin: 0 0 0.6rem;
        color: var(--accent);
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 0.78rem;
      }

      h1,
      h2 {
        margin: 0;
      }

      h1 {
        font-size: clamp(2.2rem, 5vw, 3.4rem);
      }

      .score-box {
        min-width: 6.5rem;
        padding: 1rem 1.15rem;
        border-radius: 1.25rem;
        background: linear-gradient(180deg, rgba(255, 120, 34, 0.28), rgba(255, 255, 255, 0.05));
        text-align: center;
      }

      .score-box span {
        display: block;
        font-size: 1.9rem;
        font-weight: 800;
      }

      .score-box small,
      .description,
      .stats span,
      .panel-header p {
        color: var(--muted-text);
      }

      .description {
        margin: 0;
        line-height: 1.7;
      }

      .stats {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .stats div {
        min-width: 10rem;
        padding: 1rem 1.1rem;
        border-radius: 1.25rem;
        background: rgba(0, 0, 0, 0.22);
      }

      .stats strong,
      .stats span {
        display: block;
      }

      .actions {
        display: flex;
        gap: 0.85rem;
        flex-wrap: wrap;
      }

      .primary-button {
        width: fit-content;
        padding: 0.95rem 1.3rem;
        border: 0;
        border-radius: 999px;
        background: linear-gradient(135deg, var(--accent), var(--accent-strong));
        color: #fff;
        cursor: pointer;
        font-weight: 700;
      }

      .primary-button:disabled {
        opacity: 0.7;
        cursor: wait;
      }

      .feedback {
        margin: 0;
      }

      .success {
        color: var(--success);
      }

      .error {
        color: var(--danger);
      }

      .reviews-layout {
        display: grid;
        grid-template-columns: 1.4fr 0.9fr;
        gap: 1.5rem;
      }

      .panel-header {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: start;
        margin-bottom: 1rem;
      }

      .panel-header p {
        margin: 0.4rem 0 0;
      }

      .field {
        display: grid;
        gap: 0.55rem;
      }

      .field span {
        color: var(--muted-text);
        font-size: 0.95rem;
      }

      .field input,
      .field textarea {
        width: 100%;
        padding: 0.95rem 1rem;
        border-radius: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(8, 8, 14, 0.85);
        color: var(--text-color);
        outline: none;
      }

      .field textarea {
        min-height: 10rem;
        resize: vertical;
      }

      .compact-field {
        min-width: min(100%, 17rem);
      }

      .review-list {
        display: grid;
        gap: 0.9rem;
      }

      .review-card,
      .review-state,
      .loading-card {
        padding: 1rem 1.1rem;
        border-radius: 1.25rem;
        background: rgba(0, 0, 0, 0.18);
      }

      .review-head {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        color: var(--muted-text);
        font-size: 0.95rem;
      }

      .review-card p {
        margin: 0.85rem 0 0;
        line-height: 1.65;
      }

      .form-panel {
        display: grid;
        gap: 1rem;
        align-content: start;
      }

      @media (max-width: 980px) {
        .detail-card,
        .reviews-layout {
          grid-template-columns: 1fr;
        }

        .poster {
          min-height: 22rem;
        }

        .panel-header,
        .detail-top {
          display: grid;
        }
      }
    `,
  ],
})
export class MovieDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);

  readonly movie = signal<Movie | null>(null);
  readonly reviews = signal<Review[]>([]);
  readonly isLoading = signal(true);
  readonly reviewsLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly reviewError = signal('');
  readonly reviewMessage = signal('');
  readonly favoriteMessage = signal('');

  reviewText = '';
  reviewsQuery = '';
  readonly fallbackPoster = 'https://placehold.co/720x1080/11131c/f5f7fb?text=KinoTap';

  ngOnInit(): void {
    const movieId = Number(this.route.snapshot.paramMap.get('id'));

    if (!movieId) {
      this.isLoading.set(false);
      this.reviewsLoading.set(false);
      return;
    }

    this.loadMovie(movieId);
    this.loadReviews(movieId);
  }

  loadMovie(movieId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.api.getMovie(movieId).subscribe({
      next: (movie) => {
        this.movie.set(movie);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Не удалось загрузить фильм.');
        this.movie.set(null);
        this.isLoading.set(false);
      },
    });
  }

  loadReviews(movieId: number): void {
    this.reviewsLoading.set(true);

    this.api.getReviews(movieId).subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        this.reviewsLoading.set(false);
      },
      error: () => {
        this.reviews.set([]);
        this.reviewsLoading.set(false);
      },
    });
  }

  filteredReviews(): Review[] {
    const query = this.reviewsQuery.trim().toLowerCase();

    if (!query) {
      return this.reviews();
    }

    return this.reviews().filter(
      (review) =>
        review.text.toLowerCase().includes(query) || review.user.toLowerCase().includes(query)
    );
  }

  toggleFavorite(): void {
    const currentMovie = this.movie();

    if (!currentMovie) {
      return;
    }

    this.errorMessage.set('');
    this.favoriteMessage.set('');

    this.api.toggleFavorite(currentMovie.id).subscribe({
      next: (response) => {
        this.movie.set({
          ...currentMovie,
          is_favorite: response.status === 'added',
        });
        this.favoriteMessage.set(
          response.status === 'added'
            ? 'Фильм добавлен в избранное.'
            : 'Фильм удален из избранного.'
        );
      },
      error: (error) => {
        this.errorMessage.set(
          error.status === 401
            ? 'Нужно войти в аккаунт, чтобы управлять избранным.'
            : 'Не удалось обновить избранное.'
        );
      },
    });
  }

  submitReview(): void {
    const currentMovie = this.movie();

    if (!currentMovie) {
      return;
    }

    if (!this.reviewText.trim()) {
      this.reviewError.set('Текст отзыва не должен быть пустым.');
      this.reviewMessage.set('');
      return;
    }

    this.isSubmitting.set(true);
    this.reviewError.set('');
    this.reviewMessage.set('');

    this.api.postReview(currentMovie.id, this.reviewText.trim()).subscribe({
      next: (review) => {
        this.reviews.update((reviews) => [review, ...reviews]);
        this.movie.set({
          ...currentMovie,
          reviews_count: currentMovie.reviews_count + 1,
        });
        this.reviewText = '';
        this.reviewMessage.set('Отзыв успешно опубликован.');
        this.isSubmitting.set(false);
      },
      error: (error) => {
        this.reviewError.set(
          error.status === 401
            ? 'Нужно войти в аккаунт, чтобы оставить отзыв.'
            : 'Не удалось отправить отзыв.'
        );
        this.isSubmitting.set(false);
      },
    });
  }
}
