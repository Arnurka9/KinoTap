import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-edit-movie',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-movie.html',
  styleUrls: ['./edit-movie.css']
})
export class EditMovieComponent implements OnInit {

  movie: any = {
    title: '',
    description: '',
    rating: 0,
    genre: null
  };

  genres: any[] = [];
  movieId!: number;

  errors: any = {};   

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService
  ) {}

  ngOnInit() {
    this.movieId = Number(this.route.snapshot.paramMap.get('id'));

    this.movieService.getGenres().subscribe(data => {
      this.genres = data;
    });

    this.movieService.getMovie(this.movieId).subscribe({
      next: (data) => {
        console.log('MOVIE LOADED:', data);
        this.movie = data;
      },
      error: (err) => {
        console.error('LOAD ERROR:', err);
      }
    });
  }

  submit() {
    const data = {
      ...this.movie,
      genre: typeof this.movie.genre === 'object'
        ? this.movie.genre.id
        : this.movie.genre
    };

    console.log('PUT SENDING:', data);

    this.movieService.updateMovie(this.movieId, data).subscribe({
      next: (res) => {
        console.log('PUT SUCCESS:', res);
        this.errors = {};   
        alert('Movie updated!');
      },
      error: (err) => {
        console.error('PUT ERROR:', err);
        this.errors = err.error;   
      }
    });
  }

  testPatch() {
    this.movieService.patchMovie(this.movieId, {
      title: 'PATCH TEST 🎯'
    }).subscribe({
      next: (res) => {
        console.log('PATCH SUCCESS:', res);
        alert('Patched!');
      },
      error: (err) => {
        console.error('PATCH ERROR:', err);
        alert('Patch failed');
      }
    });
  }
}
