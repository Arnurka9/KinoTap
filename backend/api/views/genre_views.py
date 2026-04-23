from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import Genre
from ..serializers import GenreSerializer


@api_view(['GET', 'POST'])
def genre_list(request):
    if request.method == 'GET':
        genres = Genre.objects.all()
        serializer = GenreSerializer(genres, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = GenreSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
