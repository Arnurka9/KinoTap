import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Collection,
  Favorite,
  FavoriteToggleResponse,
  Movie,
  MovieQueryParams,
  Review,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000/api';

  getMovies(query: MovieQueryParams = {}): Observable<Movie[]> {
    let params = new HttpParams();

    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }

    if (query.genre?.trim()) {
      params = params.set('genre', query.genre.trim());
    }

    return this.http.get<Movie[]>(`${this.baseUrl}/movies/`, { params });
  }

  getMovie(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.baseUrl}/movies/${id}/`);
  }

  getReviews(movieId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/movies/${movieId}/reviews/`);
  }

  postReview(movieId: number, text: string): Observable<Review> {
    return this.http.post<Review>(`${this.baseUrl}/movies/${movieId}/reviews/`, { text });
  }

  getCollections(): Observable<Collection[]> {
    return this.http.get<Collection[]>(`${this.baseUrl}/collections/`);
  }

  getCollection(id: number): Observable<Collection> {
    return this.http.get<Collection>(`${this.baseUrl}/collections/${id}/`);
  }

  getFavorites(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${this.baseUrl}/favorites/`);
  }

  toggleFavorite(movieId: number): Observable<FavoriteToggleResponse> {
    return this.http.post<FavoriteToggleResponse>(`${this.baseUrl}/favorites/toggle/${movieId}/`, {});
  }
}
