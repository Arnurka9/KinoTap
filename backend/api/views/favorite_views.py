from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from api.models import Movie, Favorite
from api.serializers import FavoriteSerializer, FavoriteToggleResponseSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_favorites(request):
    favorites = Favorite.objects.filter(user=request.user).select_related('movie').order_by(
        '-added_at'
    )
    serializer = FavoriteSerializer(favorites, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorite(request, movie_id):
    movie = get_object_or_404(Movie, pk=movie_id)
    favorite = Favorite.objects.filter(user=request.user, movie=movie).select_related('movie').first()

    if favorite:
        favorite.delete()
        payload = {'status': 'removed', 'movie_id': movie.id, 'favorite': None}
        serializer = FavoriteToggleResponseSerializer(payload)
        return Response(serializer.data, status=status.HTTP_200_OK)

    favorite = Favorite.objects.create(user=request.user, movie=movie)
    payload = {'status': 'added', 'movie_id': movie.id, 'favorite': favorite}
    serializer = FavoriteToggleResponseSerializer(payload)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
