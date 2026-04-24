from django.contrib import admin

from .models import Collection, Favorite, Movie, Review


admin.site.register(Movie)
admin.site.register(Review)
admin.site.register(Favorite)
admin.site.register(Collection)
