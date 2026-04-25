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
  templateUrl: './movie-detail.component.html',
  styleUrl: './movie-detail.component.css',
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
