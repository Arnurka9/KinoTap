from django.db.models import BooleanField, Count, Exists, OuterRef, Q, Value
from rest_framework import generics
from api.models import Movie, Favorite
from api.serializers import MovieSerializer, MovieFilterSerializer


class MovieListAPIView(generics.ListAPIView):
    serializer_class = MovieSerializer

    def get_queryset(self):
        filters = MovieFilterSerializer(data=self.request.query_params)
        filters.is_valid(raise_exception=True)

        queryset = Movie.objects.all().annotate(
            reviews_count=Count('reviews', distinct=True)
        )

        search = filters.validated_data.get('search', '').strip()
        genre = filters.validated_data.get('genre', '').strip()

        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(genre__icontains=search))

        if genre:
            queryset = queryset.filter(genre__icontains=genre)

        if self.request.user.is_authenticated:
            queryset = queryset.annotate(
                is_favorite=Exists(
                    Favorite.objects.filter(
                        user=self.request.user,
                        movie_id=OuterRef('pk'),
                    )
                )
            )
        else:
            queryset = queryset.annotate(
                is_favorite=Value(False, output_field=BooleanField())
            )

        return queryset.order_by('title')


class MovieDetailAPIView(generics.RetrieveAPIView):
    serializer_class = MovieSerializer

    def get_queryset(self):
        queryset = Movie.objects.all().annotate(
            reviews_count=Count('reviews', distinct=True)
        )

        if self.request.user.is_authenticated:
            return queryset.annotate(
                is_favorite=Exists(
                    Favorite.objects.filter(
                        user=self.request.user,
                        movie_id=OuterRef('pk'),
                    )
                )
            )

        return queryset.annotate(
            is_favorite=Value(False, output_field=BooleanField())
        )
