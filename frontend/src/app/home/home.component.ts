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
  template: `
    <section class="home-page">
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Онлайн-кинотеатр</p>
          <h1>Главная витрина фильмов, жанров и коллекций.</h1>
          <p>
            Страница собрана по design reference и требованиям проекта: навигация,
            каталог, избранное, авторизация и живые данные с Django API.
          </p>

          <div class="hero-actions">
            <a routerLink="/catalog" class="hero-button hero-button-primary">Открыть каталог</a>
            <a routerLink="/favorites" class="hero-button hero-button-secondary">Перейти в избранное</a>
          </div>
        </div>

        @if (heroMovie(); as movie) {
          <a [routerLink]="['/catalog', movie.id]" class="hero-preview">
            <img [src]="movie.poster || fallbackPoster" [alt]="movie.title" class="hero-poster" />

            <div class="hero-preview-meta">
              <span class="badge">{{ movie.genre }}</span>
              <strong>{{ movie.title }}</strong>
              <p>{{ movie.description }}</p>

              <div class="hero-preview-stats">
                <span>{{ movie.rating | number: '1.1-1' }} рейтинг</span>
                <span>{{ movie.reviews_count }} отзывов</span>
              </div>
            </div>
          </a>
        } @else {
          <div class="hero-preview empty-preview">Загрузка каталога...</div>
        }
      </section>

      @if (errorMessage()) {
        <section class="state-card error-card">{{ errorMessage() }}</section>
      }

      @if (isLoading()) {
        <section class="state-card">Загружаем фильмы...</section>
      } @else {
        <section class="section-block">
          <div class="section-head">
            <div>
              <p class="section-kicker">Сейчас в подборке</p>
              <h2>Новое и заметное</h2>
            </div>
            <span>{{ featuredMovies().length }} карточек</span>
          </div>

          <div class="featured-strip">
            @for (movie of featuredMovies(); track movie.id) {
              <a [routerLink]="['/catalog', movie.id]" class="featured-card">
                <img [src]="movie.poster || fallbackPoster" [alt]="movie.title" />

                <div class="feature-overlay">
                  <strong>{{ movie.title }}</strong>
                  <p>{{ movie.genre }}</p>
                </div>
              </a>
            }
          </div>
        </section>

        <section class="section-block">
          <div class="section-head">
            <div>
              <p class="section-kicker">Жанры</p>
              <h2>Подборка по настроению</h2>
            </div>
            <span>От главной до каталога</span>
          </div>

          <div class="genre-grid">
            @for (genre of genreCards(); track genre.genre) {
              <a
                [routerLink]="['/catalog']"
                [queryParams]="{ genre: genre.genre }"
                class="genre-card"
              >
                <div>
                  <strong>{{ genre.genre }}</strong>
                  <span>{{ genre.count }} фильмов</span>
                </div>

                <div class="genre-stack">
                  @for (movie of genre.preview; track movie.id) {
                    <img [src]="movie.poster || fallbackPoster" [alt]="movie.title" />
                  }
                </div>
              </a>
            }
          </div>
        </section>

        <section class="section-block">
          <div class="section-head">
            <div>
              <p class="section-kicker">Подборки</p>
              <h2>Ленты с разным настроением</h2>
            </div>
            <span>Быстрый старт для просмотра</span>
          </div>

          @if (collectionsLoading()) {
            <section class="state-card">Загружаем коллекции...</section>
          } @else if (collectionsError()) {
            <section class="state-card error-card">{{ collectionsError() }}</section>
          } @else if (!collections().length) {
            <section class="state-card">Коллекции пока не добавлены.</section>
          } @else {
            <div class="collection-grid">
              @for (collection of collections(); track collection.id) {
                <a
                    [routerLink]="['/collections', collection.id]"
                  class="collection-card"
                    [style.borderLeft]="'4px solid ' + collectionAccent(collection.accent)"
                >
                  <div class="collection-copy">
                    <span class="badge">Коллекция</span>
                    <strong>{{ collection.title }}</strong>
                    <p>{{ collection.description }}</p>
                  </div>

                  <div class="collection-media">
                    @for (movie of collection.movies; track movie.id) {
                      <img [src]="movie.poster || fallbackPoster" [alt]="movie.title" />
                    }
                  </div>
                </a>
              }
            </div>
          }
        </section>
      }
    </section>
  `,
  styles: [
    `
      .home-page {
        display: grid;
        gap: 1.5rem;
        padding-bottom: 1rem;
      }

      .hero,
      .state-card,
      .featured-card,
      .genre-card,
      .collection-card,
      .hero-preview {
        border: 1px solid rgba(255, 255, 255, 0.06);
        background: rgba(255, 255, 255, 0.04);
      }

      .hero {
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(300px, 0.9fr);
        gap: 1.2rem;
        align-items: stretch;
      }

      .hero-copy,
      .hero-preview,
      .state-card,
      .collection-card,
      .genre-card {
        border-radius: 1.9rem;
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.34);
      }

      .hero-copy {
        padding: 1.7rem;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02)),
          rgba(255, 255, 255, 0.03);
      }

      .eyebrow,
      .section-kicker {
        margin: 0 0 0.65rem;
        color: var(--accent);
        text-transform: uppercase;
        letter-spacing: 0.2em;
        font-size: 0.76rem;
      }

      .hero-copy h1 {
        margin: 0;
        max-width: 11ch;
        font-size: clamp(2.45rem, 5.6vw, 4.35rem);
        line-height: 0.95;
      }

      .hero-copy p,
      .hero-preview p,
      .collection-copy p,
      .genre-card span {
        color: var(--muted-text);
      }

      .hero-copy p {
        max-width: 38rem;
        margin: 1rem 0 0;
        line-height: 1.65;
        font-size: 1.02rem;
      }

      .hero-actions {
        display: flex;
        gap: 0.8rem;
        flex-wrap: wrap;
        margin-top: 1.5rem;
      }

      .hero-button {
        padding: 0.92rem 1.25rem;
        border-radius: 999px;
        text-decoration: none;
        font-weight: 700;
      }

      .hero-button-primary {
        color: #ffffff;
        background: linear-gradient(135deg, var(--accent), var(--accent-strong));
        box-shadow: 0 18px 40px rgba(109, 40, 217, 0.24);
      }

      .hero-button-secondary {
        color: var(--text-color);
        background: rgba(255, 255, 255, 0.07);
      }

      .hero-preview {
        display: grid;
        align-content: start;
        gap: 1rem;
        padding: 1rem;
        text-decoration: none;
        background: linear-gradient(180deg, rgba(124, 58, 237, 0.18), rgba(255, 255, 255, 0.03));
      }

      .hero-poster {
        width: 100%;
        aspect-ratio: 4 / 5;
        object-fit: cover;
        border-radius: 1.4rem;
      }

      .hero-preview-meta {
        display: grid;
        gap: 0.7rem;
      }

      .hero-preview-meta strong {
        font-size: 1.15rem;
      }

      .hero-preview-stats {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        color: rgba(255, 255, 255, 0.74);
        font-size: 0.9rem;
      }

      .badge {
        display: inline-flex;
        width: fit-content;
        padding: 0.45rem 0.7rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.04em;
      }

      .section-block {
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
        font-size: clamp(1.45rem, 2.6vw, 2rem);
      }

      .section-head span {
        color: var(--muted-text);
      }

      .featured-strip {
        display: flex;
        gap: 0.9rem;
        overflow-x: auto;
        padding-bottom: 0.45rem;
        scroll-snap-type: x proximity;
        scrollbar-color: rgba(157, 78, 221, 0.52) rgba(255, 255, 255, 0.05);
      }

      .featured-strip::-webkit-scrollbar {
        height: 10px;
      }

      .featured-strip::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 999px;
      }

      .featured-strip::-webkit-scrollbar-thumb {
        background: rgba(157, 78, 221, 0.52);
        border-radius: 999px;
      }

      .featured-card {
        position: relative;
        display: block;
        flex: 0 0 clamp(170px, 17vw, 230px);
        overflow: hidden;
        border-radius: 1.2rem;
        text-decoration: none;
        aspect-ratio: 5 / 7.35;
        scroll-snap-align: start;
        transition: transform 0.18s ease, border-color 0.18s ease;
      }

      .featured-card:hover {
        transform: translateY(-3px);
        border-color: rgba(157, 78, 221, 0.42);
      }

      .featured-card img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .feature-overlay {
        position: absolute;
        inset: auto 0 0;
        padding: 1rem;
        background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.86));
      }

      .feature-overlay strong,
      .collection-copy strong,
      .genre-card strong {
        display: block;
        margin-bottom: 0.35rem;
        font-size: 1.1rem;
      }

      .feature-overlay p {
        margin: 0;
      }

      .genre-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
        gap: 0.9rem;
      }

      .genre-card {
        display: grid;
        align-content: space-between;
        gap: 1rem;
        min-height: 230px;
        padding: 1.1rem;
        text-decoration: none;
        transition: transform 0.18s ease, border-color 0.18s ease;
      }

      .genre-card:hover {
        transform: translateY(-2px);
        border-color: rgba(157, 78, 221, 0.42);
      }

      .genre-stack {
        display: flex;
        gap: 0.55rem;
        align-items: flex-end;
      }

      .genre-stack img {
        width: 34%;
        max-width: 96px;
        aspect-ratio: 2 / 3;
        object-fit: cover;
        border-radius: 0.8rem;
        box-shadow: 0 18px 28px rgba(0, 0, 0, 0.3);
        transform: rotate(-6deg);
      }

      .collection-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.9rem;
      }

      .collection-card {
        display: grid;
        gap: 1rem;
        padding: 1.2rem;
        text-decoration: none;
        border-left: 4px solid transparent;
        overflow: hidden;
      }

      .collection-media {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.55rem;
        align-items: stretch;
      }

      .collection-media img {
        width: 100%;
        aspect-ratio: 3 / 4;
        object-fit: cover;
        border-radius: 0.9rem;
        display: block;
      }

      .state-card {
        padding: 1.2rem 1.3rem;
        background: rgba(255, 255, 255, 0.05);
      }

      .error-card {
        color: var(--danger);
      }

      @media (max-width: 1180px) {
        .featured-card {
          flex-basis: 30vw;
        }

        .collection-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 900px) {
        .hero {
          grid-template-columns: 1fr;
        }

        .featured-card {
          flex-basis: 42vw;
        }
      }

      @media (max-width: 720px) {
        .collection-grid {
          grid-template-columns: 1fr 1fr;
        }

        .hero-copy,
        .hero-preview {
          padding: 1.1rem;
        }
      }

      @media (max-width: 540px) {
        .collection-grid {
          grid-template-columns: 1fr;
        }

        .featured-card {
          flex-basis: 74vw;
        }

        .hero-copy h1 {
          max-width: none;
        }

        .hero-preview-stats {
          flex-direction: column;
        }
      }
    `,
  ],
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