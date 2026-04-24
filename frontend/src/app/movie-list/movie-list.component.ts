import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GENRE_ORDER, Movie } from '../models';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.css',
})
export class MovieListComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly allMovies = signal<Movie[]>([]);
  readonly movies = signal<Movie[]>([]);
  readonly overviewLoading = signal(true);
  readonly catalogLoading = signal(true);
  readonly overviewError = signal('');
  readonly catalogError = signal('');
  readonly fallbackPoster = 'https://placehold.co/600x900/11131c/f5f7fb?text=KinoTap';

  readonly genres = computed(() => {
    const availableGenres = new Set(this.allMovies().map((movie) => movie.genre));
    return GENRE_ORDER.filter((genre) => availableGenres.has(genre));
  });

  readonly genreCards = computed(() =>
    this.genres().map((genre) => {
      const matches = this.allMovies().filter((movie) => movie.genre === genre);

      return {
        genre,
        count: matches.length,
        preview: matches.slice(0, 3),
      };
    })
  );

  searchTerm = '';
  selectedGenre = '';
  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private catalogRequestId = 0;

  ngOnInit(): void {
    this.searchTerm = this.route.snapshot.queryParamMap.get('search')?.trim() ?? '';
    this.selectedGenre = this.route.snapshot.queryParamMap.get('genre')?.trim() ?? '';
    this.loadAllMovies();

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const search = params.get('search')?.trim() ?? '';
      const genre = params.get('genre')?.trim() ?? '';

      if (search === this.searchTerm && genre === this.selectedGenre) {
        return;
      }

      this.searchTerm = search;
      this.selectedGenre = genre;
      this.loadFilteredMovies(search, genre);
    });

    this.loadFilteredMovies(this.searchTerm, this.selectedGenre);
  }

  loadAllMovies(): void {
    this.overviewLoading.set(true);
    this.overviewError.set('');

    this.api.getMovies().subscribe({
      next: (movies) => {
        this.allMovies.set(movies);
        this.overviewLoading.set(false);
      },
      error: () => {
        this.allMovies.set([]);
        this.overviewError.set('Не удалось загрузить жанры. Проверьте backend API.');
        this.overviewLoading.set(false);
      },
    });
  }

  scheduleSearch(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    this.searchTimer = setTimeout(() => this.syncFiltersToUrl(), 250);
  }

  private loadFilteredMovies(search: string, genre: string): void {
    const requestId = ++this.catalogRequestId;
    this.catalogLoading.set(true);
    this.catalogError.set('');

    this.api.getMovies({ search, genre }).subscribe({
      next: (movies) => {
        if (requestId !== this.catalogRequestId) {
          return;
        }

        this.movies.set(movies);
        this.catalogLoading.set(false);
      },
      error: () => {
        if (requestId !== this.catalogRequestId) {
          return;
        }

        this.movies.set([]);
        this.catalogError.set('Не удалось загрузить каталог. Проверьте backend API.');
        this.catalogLoading.set(false);
      },
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedGenre = '';
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }

    this.syncFiltersToUrl(true);
  }

  genreQueryParams(genre: string): Record<string, string | null> {
    const trimmedSearch = this.searchTerm.trim();

    return {
      search: trimmedSearch || null,
      genre,
    };
  }

  private syncFiltersToUrl(forceReload = false): void {
    const search = this.searchTerm.trim();
    const genre = this.selectedGenre.trim();
    const currentSearch = this.route.snapshot.queryParamMap.get('search')?.trim() ?? '';
    const currentGenre = this.route.snapshot.queryParamMap.get('genre')?.trim() ?? '';

    if (search === currentSearch && genre === currentGenre) {
      if (forceReload) {
        this.loadFilteredMovies(search, genre);
      }

      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: search || null,
        genre: genre || null,
      },
      replaceUrl: true,
    });
  }
}
