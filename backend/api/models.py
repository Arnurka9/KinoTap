from django.conf import settings
from django.db import models


class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Movie(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    poster = models.URLField(blank=True, null=True)
    poster_image = models.FileField(upload_to="movie_posters/", blank=True, null=True)
    genre = models.ForeignKey(Genre, on_delete=models.CASCADE, related_name="movies")
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="movies"
    )

    def __str__(self):
        return self.title


class Review(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews"
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.movie.title}"


class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favorites"
    )
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name="favorites")
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "movie")

    def __str__(self):
        return f"{self.user.username} - {self.movie.title}"


class Collection(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    accent = models.CharField(max_length=30, default="amber")
    movies = models.ManyToManyField(Movie, related_name="collections", blank=True)

    def __str__(self):
        return self.title


# something
