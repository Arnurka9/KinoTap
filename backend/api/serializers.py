from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Collection, Favorite, Movie, Review

User = get_user_model()

class MovieMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ['id', 'title', 'poster']
        read_only_fields = fields


class MovieFilterSerializer(serializers.Serializer):
    search = serializers.CharField(required=False, allow_blank=True)
    genre = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        return validated_data

    def update(self, instance, validated_data):
        return instance


class RegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, min_length=3)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate_username(self, value):
        username = value.strip()

        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError('Имя пользователя уже занято.')

        return username

    def validate_email(self, value):
        email = value.strip().lower()

        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('Пользователь с такой почтой уже существует.')

        return email

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Пароли не совпадают.'})

        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )


class FavoriteToggleResponseSerializer(serializers.Serializer):
    status = serializers.CharField(read_only=True)
    movie_id = serializers.IntegerField(read_only=True)
    favorite = serializers.SerializerMethodField()

    def get_favorite(self, obj):
        favorite = obj.get('favorite')
        if favorite is None:
            return None
        return FavoriteSerializer(favorite).data

    def create(self, validated_data):
        return validated_data

    def update(self, instance, validated_data):
        return instance


class MovieSerializer(serializers.ModelSerializer):
    genre = serializers.CharField(source='genre.name', read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)
    is_favorite = serializers.BooleanField(read_only=True)

    class Meta:
        model = Movie
        fields = [
            'id',
            'title',
            'description',
            'poster',
            'genre',
            'rating',
            'reviews_count',
            'is_favorite',
        ]


class CollectionSerializer(serializers.ModelSerializer):
    movies = MovieMiniSerializer(read_only=True, many=True)
    movie_ids = serializers.PrimaryKeyRelatedField(
        queryset=Movie.objects.all(),
        many=True,
        write_only=True,
        source='movies',
        required=False,
    )

    class Meta:
        model = Collection
        fields = ['id', 'title', 'description', 'accent', 'movies', 'movie_ids']
        read_only_fields = ['id', 'movies']

    def create(self, validated_data):
        movies = validated_data.pop('movies', [])
        collection = Collection.objects.create(**validated_data)
        if movies:
            collection.movies.set(movies)
        return collection

    def update(self, instance, validated_data):
        movies = validated_data.pop('movies', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if movies is not None:
            instance.movies.set(movies)

        return instance


class ReviewSerializer(serializers.ModelSerializer):
    movie = MovieMiniSerializer(read_only=True)
    user = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'movie', 'user', 'text', 'created_at']
        read_only_fields = ['id', 'movie', 'user', 'created_at']

    def create(self, validated_data):
        request = self.context['request']
        movie = self.context['movie']
        return Review.objects.create(
            movie=movie,
            user=request.user,
            **validated_data,
        )


class FavoriteSerializer(serializers.ModelSerializer):
    movie = MovieMiniSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'movie', 'added_at']
        read_only_fields = fields
