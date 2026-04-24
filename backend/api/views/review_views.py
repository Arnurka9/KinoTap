from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from api.models import Movie, Review
from api.serializers import ReviewSerializer


class MovieReviewAPIView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, movie_id):
        movie = get_object_or_404(Movie, pk=movie_id)
        reviews = Review.objects.filter(movie=movie).select_related('movie', 'user').order_by(
            '-created_at'
        )
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    def post(self, request, movie_id):
        movie = get_object_or_404(Movie, pk=movie_id)
        serializer = ReviewSerializer(
            data=request.data,
            context={'request': request, 'movie': movie},
        )
        serializer.is_valid(raise_exception=True)
        review = serializer.save()
        return Response(
            ReviewSerializer(review).data,
            status=status.HTTP_201_CREATED,
        )
