import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Collection, GENRE_ORDER, Movie, resolveCollectionAccent } from '../models';
import { ApiService } from '../services/api.service';

interface GenreCard {
  genre: string;
  count: number;
  preview: Movie[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly movies = signal<Movie[]>([]);
  readonly collections = signal<Collection[]>([]);
  readonly isLoading = signal(true);
  readonly collectionsLoading = signal(true);
  readonly errorMessage = signal('');
  readonly collectionsError = signal('');
  readonly fallbackPoster = 'https://placehold.co/600x900/11131c/f5f7fb?text=KinoTap';

  readonly heroMovie = computed(() => this.featuredMovies()[0] ?? null);

  readonly featuredMovies = computed(() =>
    [...this.movies()]
      .sort((left, right) => right.rating - left.rating || right.reviews_count - left.reviews_count)
      .slice(0, 5)
  );

  readonly genreCards = computed<GenreCard[]>(() =>
    GENRE_ORDER.map((genre) => {
      const matches = this.movies().filter((movie) => movie.genre === genre);

      return {
        genre,
        count: matches.length,
        preview: matches.slice(0, 3),
      };
    }).filter((card) => card.count > 0)
  );

  ngOnInit(): void {
    this.loadMovies();
    this.loadCollections();
  }

  private loadMovies(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.api.getMovies().subscribe({
      next: (movies) => {
        this.movies.set(movies);
        this.isLoading.set(false);
      },
      error: () => {
        this.movies.set([]);
        this.errorMessage.set('Не удалось загрузить главную страницу. Проверьте backend API.');
        this.isLoading.set(false);
      },
    });
  }

  private loadCollections(): void {
    this.collectionsLoading.set(true);
    this.collectionsError.set('');

    this.api.getCollections().subscribe({
      next: (collections) => {
        this.collections.set(collections.filter((collection) => collection.movies.length > 0));
        this.collectionsLoading.set(false);
      },
      error: () => {
        this.collections.set([]);
        this.collectionsError.set('Не удалось загрузить коллекции. Проверьте backend API.');
        this.collectionsLoading.set(false);
      },
    });
  }

  collectionAccent(accent: string): string {
    return resolveCollectionAccent(accent);
  }
}