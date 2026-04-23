import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  private api = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getGenres() {
    return this.http.get<any[]>(`${this.api}/genres/`);
  }

  addMovie(movie: any) {
    return this.http.post(`${this.api}/movies/`, movie);
  }

  getMovie(id: number) {
    return this.http.get<any>(`${this.api}/movies/${id}/`);
  }

  updateMovie(id: number, data: any) {
    return this.http.put(`${this.api}/movies/${id}/`, data);
  }

  patchMovie(id: number, data: any) {
  return this.http.patch(`http://127.0.0.1:8000/api/movies/${id}/`, data);
}
}
