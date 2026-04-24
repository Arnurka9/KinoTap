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
  template: `
    <section class="catalog-page">
      <header class="page-head">
        <div class="page-copy">
          <p class="eyebrow">Каталог</p>
          <h1>Жанры и фильмы</h1>
          <p>
            Выбирай жанр по карточке или ищи фильм по названию. Карточки ведут к
            детальной странице и избранному.
          </p>
        </div>

        <div class="filters">
          <label class="field">
            <span>Поиск по каталогу</span>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="scheduleSearch()"
              placeholder="Название фильма или жанр"
            />
          </label>

          <button type="button" class="reset-button" (click)="clearFilters()">
            Сбросить
          </button>
        </div>
      </header>

      @if (overviewLoading()) {
        <section class="state-card">Загрузка жанров...</section>
      } @else if (overviewError()) {
        <section class="state-card error-card">{{ overviewError() }}</section>
      } @else {
        <section class="genre-section">
          <div class="section-head">
            <div>
              <p class="section-kicker">Жанры</p>
              <h2>Карточки с другим видом</h2>
            </div>
            <span>{{ genres().length }} категорий</span>
          </div>

          <div class="genre-grid">
            @for (genre of genreCards(); track genre.genre) {
              <a
                [routerLink]="['/catalog']"
                [queryParams]="genreQueryParams(genre.genre)"
                class="genre-card"
                [class.genre-card-active]="selectedGenre === genre.genre"
              >
                <div>
                  <strong>{{ genre.genre }}</strong>
                  <span>{{ genre.count }} фильмов</span>
                </div>

                <div class="genre-preview">
                  @for (movie of genre.preview; track movie.id) {
                    <img [src]="movie.poster || fallbackPoster" [alt]="movie.title" />
                  }
                </div>
              </a>
            }
          </div>
        </section>
      }

      @if (catalogLoading()) {
        <section class="state-card">Загрузка каталога...</section>
      } @else if (catalogError()) {
        <section class="state-card error-card">{{ catalogError() }}</section>
      } @else {
        <section class="movie-section">
          <div class="section-head">
            <div>
              <p class="section-kicker">Подборка</p>
              <h2>Фильмы каталога</h2>
            </div>
            <span>{{ movies().length }} результатов</span>
          </div>

          <div class="movie-grid">
            @for (movie of movies(); track movie.id) {
              <a [routerLink]="['/catalog', movie.id]" class="movie-card">
                <div class="movie-poster">
                  <img [src]="movie.poster || fallbackPoster" [alt]="movie.title" />
                </div>

                <div class="movie-meta">
                  <h3>{{ movie.title }}</h3>
                  <p>{{ movie.genre }}</p>
                  <div class="movie-stats">
                    <span>Рейтинг {{ movie.rating | number: '1.1-1' }}</span>
                    <span>{{ movie.reviews_count }} отзывов</span>
                  </div>
                </div>
              </a>
            } @empty {
              <section class="state-card">По вашему запросу фильмы не найдены.</section>
            }
          </div>
        </section>
      }
    </section>
  `,
  styles: [
    `
      .catalog-page {
        display: grid;
        gap: 1.25rem;
        padding-bottom: 1rem;
      }

      .page-head {
        display: grid;
        grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.85fr);
        gap: 1rem;
        align-items: end;
      }

      .page-copy h1 {
        margin: 0;
        font-size: clamp(2.25rem, 5vw, 3.9rem);
        line-height: 0.96;
      }

      .page-copy p,
      .field span,
      .genre-card span,
      .movie-meta p,
      .section-head span {
        color: var(--muted-text);
      }

      .page-copy p {
        max-width: 42rem;
        margin: 0.9rem 0 0;
        line-height: 1.65;
      }

      .eyebrow,
      .section-kicker {
        margin: 0 0 0.65rem;
        color: var(--accent);
        text-transform: uppercase;
        letter-spacing: 0.2em;
        font-size: 0.76rem;
      }

      .filters {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        align-items: end;
        flex-wrap: wrap;
      }

      .field {
        display: grid;
        gap: 0.55rem;
        flex: 1 1 260px;
      }

      .field input {
        min-height: 48px;
        padding: 0.95rem 1rem;
        border-radius: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-color);
        outline: none;
      }

      .field input:focus {
        border-color: rgba(157, 78, 221, 0.55);
        box-shadow: 0 0 0 4px rgba(157, 78, 221, 0.16);
      }

      .reset-button {
        min-height: 48px;
        padding: 0 1rem;
        border-radius: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-color);
        cursor: pointer;
      }

      .genre-section,
      .movie-section {
        display: grid;
        gap: 1rem;
      }

      .section-head {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: end;
      }

      .section-head h2 {
        margin: 0;
        font-size: clamp(1.45rem, 2.7vw, 2rem);
      }

      .genre-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 0.9rem;
      }

      .genre-card {
        min-height: 240px;
        padding: 1.15rem;
        border-radius: 1.6rem;
        border: 1px solid rgba(255, 255, 255, 0.07);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
        color: inherit;
        text-align: left;
        cursor: pointer;
        display: grid;
        align-content: space-between;
        gap: 1rem;
        transition: transform 0.18s ease, border-color 0.18s ease;
      }

      .genre-card:hover,
      .genre-card-active {
        transform: translateY(-2px);
        border-color: rgba(157, 78, 221, 0.45);
      }

      .genre-card strong {
        display: block;
        margin-bottom: 0.4rem;
        font-size: 1.35rem;
      }

      .genre-preview {
        display: flex;
        gap: 0.55rem;
        align-items: flex-end;
      }

      .genre-preview img {
        width: 34%;
        max-width: 90px;
        aspect-ratio: 2 / 3;
        object-fit: cover;
        border-radius: 0.82rem;
        box-shadow: 0 18px 28px rgba(0, 0, 0, 0.3);
        transform: rotate(-6deg);
      }

      .movie-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
        gap: 0.9rem;
      }

      .movie-card {
        text-decoration: none;
        border-radius: 1.2rem;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.06);
      }

      .movie-poster {
        aspect-ratio: 2 / 3;
      }

      .movie-poster img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .movie-meta {
        padding: 0.9rem;
        display: grid;
        gap: 0.35rem;
      }

      .movie-meta h3 {
        margin: 0;
        font-size: 1.05rem;
      }

      .movie-stats {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        color: rgba(255, 255, 255, 0.72);
        font-size: 0.86rem;
      }

      .state-card {
        padding: 1.2rem 1.3rem;
        border-radius: 1rem;
        background: rgba(255, 255, 255, 0.05);
      }

      .error-card {
        color: var(--danger);
      }

      @media (max-width: 980px) {
        .page-head {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 760px) {
        .genre-grid {
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        }
      }

      @media (max-width: 540px) {
        .filters {
          justify-content: stretch;
        }

        .reset-button,
        .field {
          width: 100%;
        }

        .movie-stats {
          flex-direction: column;
        }
      }
    `,
  ],
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
