import { CommonModule } from '@angular/common';
import { DestroyRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Collection, resolveCollectionAccent } from '../models';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-collection-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="collection-page">
      <a routerLink="/catalog" class="back-link">Назад к каталогу</a>

      @if (collection(); as currentCollection) {
        <section class="collection-hero" [style.borderLeft]="'5px solid ' + accentColor()">
          <div class="collection-copy">
            <p class="eyebrow">Коллекция</p>
            <h1>{{ currentCollection.title }}</h1>
            <p>{{ currentCollection.description }}</p>

            <div class="collection-stats">
              <span>{{ currentCollection.movies.length }} фильмов</span>
              <span [style.color]="accentColor()">Акцент подборки</span>
            </div>

            <div class="collection-actions">
              <a routerLink="/catalog" class="secondary-button">В каталог</a>
              <a routerLink="/" class="primary-button">На главную</a>
            </div>
          </div>

          <div class="poster-stack">
            @for (movie of previewMovies(); track movie.id) {
              <a [routerLink]="['/catalog', movie.id]" class="poster-card">
                <img [src]="movie.poster || fallbackPoster" [alt]="movie.title" />
                <strong>{{ movie.title }}</strong>
              </a>
            }
          </div>
        </section>

        <section class="movie-grid">
          @for (movie of currentCollection.movies; track movie.id) {
            <a [routerLink]="['/catalog', movie.id]" class="movie-card">
              <img [src]="movie.poster || fallbackPoster" [alt]="movie.title" />
              <div>
                <strong>{{ movie.title }}</strong>
                <p>Открыть карточку фильма</p>
              </div>
            </a>
          } @empty {
            <section class="state-card">В этой коллекции пока нет фильмов.</section>
          }
        </section>
      } @else if (isLoading()) {
        <section class="state-card">Загрузка коллекции...</section>
      } @else {
        <section class="state-card error-card">{{ errorMessage() }}</section>
      }
    </section>
  `,
  styles: [
    `
      .collection-page {
        display: grid;
        gap: 1.25rem;
        padding-bottom: 1rem;
      }

      .back-link {
        width: fit-content;
        color: var(--muted-text);
        text-decoration: none;
      }

      .collection-hero,
      .state-card,
      .movie-card,
      .poster-card {
        border: 1px solid rgba(255, 255, 255, 0.06);
        background: rgba(255, 255, 255, 0.04);
        border-radius: 1.6rem;
      }

      .collection-hero {
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(240px, 0.9fr);
        gap: 1rem;
        padding: 1.4rem;
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.34);
      }

      .collection-copy {
        display: grid;
        gap: 0.85rem;
        align-content: start;
      }

      .eyebrow {
        margin: 0;
        color: var(--accent);
        text-transform: uppercase;
        letter-spacing: 0.2em;
        font-size: 0.76rem;
      }

      h1,
      p {
        margin: 0;
      }

      h1 {
        font-size: clamp(2.2rem, 5vw, 3.8rem);
        line-height: 0.96;
      }

      .collection-copy p,
      .movie-card p,
      .back-link {
        color: var(--muted-text);
      }

      .collection-stats {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .collection-stats span {
        padding: 0.7rem 0.95rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
      }

      .collection-actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .primary-button,
      .secondary-button {
        padding: 0.9rem 1.1rem;
        border-radius: 999px;
        text-decoration: none;
        font-weight: 700;
      }

      .primary-button {
        color: #fff;
        background: linear-gradient(135deg, var(--accent), var(--accent-strong));
      }

      .secondary-button {
        color: var(--text-color);
        background: rgba(255, 255, 255, 0.07);
      }

      .poster-stack {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.75rem;
        align-items: start;
      }

      .poster-card {
        padding: 0.75rem;
        text-decoration: none;
        display: grid;
        gap: 0.6rem;
      }

      .poster-card img {
        width: 100%;
        aspect-ratio: 2 / 3;
        object-fit: cover;
        border-radius: 1rem;
      }

      .movie-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 0.9rem;
      }

      .movie-card {
        display: grid;
        gap: 0.8rem;
        padding: 0.9rem;
        text-decoration: none;
      }

      .movie-card img {
        width: 100%;
        aspect-ratio: 16 / 10;
        object-fit: cover;
        border-radius: 1rem;
      }

      .movie-card strong {
        display: block;
        margin-bottom: 0.25rem;
      }

      .state-card {
        padding: 1.2rem 1.3rem;
      }

      .error-card {
        color: var(--danger);
      }

      @media (max-width: 900px) {
        .collection-hero {
          grid-template-columns: 1fr;
        }

        .poster-stack {
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        }
      }
    `,
  ],
})
export class CollectionDetailComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly collection = signal<Collection | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly fallbackPoster = 'https://placehold.co/600x900/11131c/f5f7fb?text=KinoTap';

  readonly previewMovies = computed(() => this.collection()?.movies.slice(0, 3) ?? []);
  readonly accentColor = computed(() => resolveCollectionAccent(this.collection()?.accent ?? ''));

  private requestId = 0;

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const collectionId = Number(params.get('id'));

      if (!collectionId) {
        this.collection.set(null);
        this.errorMessage.set('Коллекция не найдена.');
        this.isLoading.set(false);
        return;
      }

      this.loadCollection(collectionId);
    });
  }

  private loadCollection(collectionId: number): void {
    const currentRequestId = ++this.requestId;
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.api.getCollection(collectionId).subscribe({
      next: (collection) => {
        if (currentRequestId !== this.requestId) {
          return;
        }

        this.collection.set(collection);
        this.isLoading.set(false);
      },
      error: (error) => {
        if (currentRequestId !== this.requestId) {
          return;
        }

        this.collection.set(null);
        this.errorMessage.set(
          error.status === 404 ? 'Коллекция не найдена.' : 'Не удалось загрузить коллекцию.'
        );
        this.isLoading.set(false);
      },
    });
  }
}