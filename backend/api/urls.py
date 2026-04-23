from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework.routers import DefaultRouter

from .views import register, genre_list, LogoutView
from .views.movie_views import MovieViewSet, movie_list, movie_detail


router = DefaultRouter()
router.register('movies', MovieViewSet)


urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', register),
    path('genres/', genre_list),
    path('movies-old/', movie_list),
    path('movies-old/<int:pk>/', movie_detail),
    path('', include(router.urls)),
]
