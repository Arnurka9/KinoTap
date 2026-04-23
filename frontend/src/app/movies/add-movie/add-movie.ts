import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-add-movie',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-movie.html',
  styleUrls: ['./add-movie.css']
})
export class AddMovieComponent implements OnInit {

  movie: any = {
  title: '',
  description: '',
  rating: 0,
  genre: null 
};

  genres: any[] = [];

  constructor(private movieService: MovieService) {}

  

  ngOnInit() {
  console.log('COMPONENT LOADED'); 

  this.movieService.getGenres().subscribe({
    next: (data) => {
      console.log('GENRES:', data);
      this.genres = data;
    },
    error: (err) => {
      console.error('ERROR:', err);
    }
  });
}

  submit() {
    this.movieService.addMovie(this.movie).subscribe({
      next: (res) => {
        alert('Movie added successfully!');
        console.log(res);
      },
      error: (err) => {
        alert('Error adding movie');
        console.error(err);
      }
    });
  }
}
