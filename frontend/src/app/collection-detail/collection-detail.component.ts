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
  templateUrl: './collection-detail.html',
  styleUrl: './collection-detail.css',
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
