from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views.auth_views import LogoutView, RegistrationView 
from .views.collection_views import CollectionDetailAPIView, CollectionListCreateAPIView
from .views.movie_views import MovieListAPIView, MovieDetailAPIView
from .views.review_views import MovieReviewAPIView
from .views.favorite_views import get_favorites, toggle_favorite

urlpatterns = [
    path('register/', RegistrationView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    path('movies/', MovieListAPIView.as_view(), name='movie-list'),
    path('movies/<int:pk>/', MovieDetailAPIView.as_view(), name='movie-detail'),
    path('movies/<int:movie_id>/reviews/', MovieReviewAPIView.as_view(), name='movie-reviews'),

    path('collections/', CollectionListCreateAPIView.as_view(), name='collection-list'),
    path('collections/<int:pk>/', CollectionDetailAPIView.as_view(), name='collection-detail'),
    
    path('favorites/', get_favorites, name='get-favorites'),
    path('favorites/toggle/<int:movie_id>/', toggle_favorite, name='toggle-favorite'),
]