from rest_framework import generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from api.models import Collection
from api.serializers import CollectionSerializer


class CollectionGenericListCreateView(generics.ListCreateAPIView):
    serializer_class = CollectionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Collection.objects.all().prefetch_related('movies').order_by('title')


class CollectionGenericDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CollectionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Collection.objects.all().prefetch_related('movies')
