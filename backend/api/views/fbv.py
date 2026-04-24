from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from api.models import Collection
from api.serializers import CollectionSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def collection_list_create(request):
    if request.method == 'GET':
        collections = Collection.objects.all().prefetch_related('movies').order_by('title')
        serializer = CollectionSerializer(collections, many=True)
        return Response(serializer.data)

    serializer = CollectionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticatedOrReadOnly])
def collection_detail(request, pk):
    collection = get_object_or_404(Collection.objects.prefetch_related('movies'), pk=pk)

    if request.method == 'GET':
        serializer = CollectionSerializer(collection)
        return Response(serializer.data)

    if request.method in ['PUT', 'PATCH']:
        serializer = CollectionSerializer(
            collection,
            data=request.data,
            partial=request.method == 'PATCH',
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    collection.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
