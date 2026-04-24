from __future__ import annotations

import os
import sys
from pathlib import Path
from urllib.parse import quote_plus

import django

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

from api.models import Collection, Favorite, Movie, Review

GENRE_COLORS = {
    'Комедии': 'f59e0b',
    'Боевики': 'dc2626',
    'Фантастика': '2563eb',
    'Триллеры': '7c3aed',
    'Приключения': '059669',
    'Драмы': '1d4ed8',
    'Мультфильмы': 'db2777',
    'Фэнтези': '0f766e',
    'Семейное': 'c2410c',
    'Мелодрамы': 'be185d',
    'Детективы': '334155',
    'Ужасы': '111827',
    'Историческое': '92400e',
    'Биографии': '4b5563',
    'Военное': '6b7280',
    'Артхаус': '4c1d95',
    'Спорт': '15803d',
    'Короткий метр': '0891b2',
}

MOVIES = [
    {
        'title': 'Ночной маршрут',
        'genre': 'Боевики',
        'rating': 8.4,
        'description': 'Сорванная операция в городе, где у каждого маршрута есть цена и тайна.',
    },
    {
        'title': 'Тихий дом',
        'genre': 'Драмы',
        'rating': 8.1,
        'description': 'История семьи, которая учится говорить друг с другом после долгой тишины.',
    },
    {
        'title': 'Сигнал из будущего',
        'genre': 'Фантастика',
        'rating': 8.6,
        'description': 'Инженер получает сообщение из времени, где его решения уже изменили мир.',
    },
    {
        'title': 'Погоня за тенью',
        'genre': 'Триллеры',
        'rating': 8.0,
        'description': 'Журналист находит следы исчезновения, которые ведут к нему самому.',
    },
    {
        'title': 'Письмо из бухты',
        'genre': 'Приключения',
        'rating': 7.9,
        'description': 'Двое друзей отправляются на край карты ради одной старой подсказки.',
    },
    {
        'title': 'Смешной этаж',
        'genre': 'Комедии',
        'rating': 7.8,
        'description': 'Жильцы дома превращают обычный переезд в непрерывный праздник абсурда.',
    },
    {
        'title': 'Небесный сад',
        'genre': 'Фэнтези',
        'rating': 8.3,
        'description': 'Подросток открывает скрытый сад, который растёт выше облаков.',
    },
    {
        'title': 'Маяк на окраине',
        'genre': 'Детективы',
        'rating': 7.7,
        'description': 'Смотритель маяка замечает повторяющиеся детали в исчезновениях рыбаков.',
    },
    {
        'title': 'Зимний коридор',
        'genre': 'Ужасы',
        'rating': 7.5,
        'description': 'Заброшенный корпус колледжа каждый вечер меняет планировку.',
    },
    {
        'title': 'Дом, где свет не гаснет',
        'genre': 'Семейное',
        'rating': 8.2,
        'description': 'Тёплая история о доме, который меняет судьбы тех, кто в него заходит.',
    },
    {
        'title': 'Сцена после дождя',
        'genre': 'Мелодрамы',
        'rating': 7.6,
        'description': 'Две судьбы снова пересекаются в городе, где дождь не прекращается неделями.',
    },
    {
        'title': 'Кадр на вырост',
        'genre': 'Мультфильмы',
        'rating': 8.7,
        'description': 'Юный изобретатель учится собирать мир заново из цветных деталей.',
    },
    {
        'title': 'Голоса хроники',
        'genre': 'Историческое',
        'rating': 7.9,
        'description': 'Летописец восстанавливает события, которые пытались стереть из памяти города.',
    },
    {
        'title': 'Живая биография',
        'genre': 'Биографии',
        'rating': 8.0,
        'description': 'Портрет человека, который сделал из сомнений собственную профессию.',
    },
    {
        'title': 'Сухой фронт',
        'genre': 'Военное',
        'rating': 7.8,
        'description': 'История отряда, который держит линию не только на карте, но и в себе.',
    },
    {
        'title': 'Белый шум двора',
        'genre': 'Артхаус',
        'rating': 7.4,
        'description': 'Наблюдение за городским двором, где каждый звук становится отдельной сценой.',
    },
    {
        'title': 'Финишная прямая',
        'genre': 'Спорт',
        'rating': 8.1,
        'description': 'Тренер и бегун готовятся к забегу, который должен изменить их обоих.',
    },
    {
        'title': 'Один кадр',
        'genre': 'Короткий метр',
        'rating': 7.3,
        'description': 'Десять минут, чтобы успеть признаться и не потерять важное решение.',
    },
    {
        'title': 'Неоновые каникулы',
        'genre': 'Комедии',
        'rating': 7.9,
        'description': 'Летняя поездка превращается в цепочку нелепых и очень тёплых событий.',
    },
]

COLLECTIONS = [
    {
        'title': 'Для вечернего просмотра',
        'description': 'Спокойные истории для вечера без спешки.',
        'accent': 'amber',
        'movies': ['Смешной этаж', 'Тихий дом', 'Сцена после дождя'],
    },
    {
        'title': 'Экшен и драйв',
        'description': 'Сильные эмоции, движение и напряжение до последней минуты.',
        'accent': 'crimson',
        'movies': ['Ночной маршрут', 'Погоня за тенью', 'Письмо из бухты'],
    },
    {
        'title': 'Семейный выбор',
        'description': 'Лёгкая подборка для совместного просмотра.',
        'accent': 'teal',
        'movies': ['Дом, где свет не гаснет', 'Кадр на вырост', 'Небесный сад'],
    },
]

FAVORITES = [
    'Ночной маршрут',
    'Сигнал из будущего',
    'Дом, где свет не гаснет',
    'Кадр на вырост',
]

REVIEWS = [
    {
        'movie': 'Ночной маршрут',
        'text': 'Динамично и без лишнего шума. Хороший фильм для главной витрины.',
    },
    {
        'movie': 'Сигнал из будущего',
        'text': 'Сильная фантастическая идея, которая отлично работает как карточка в каталоге.',
    },
    {
        'movie': 'Дом, где свет не гаснет',
        'text': 'Тёплая семейная история, которая хорошо смотрится в подборках.',
    },
]


def build_poster(title: str, accent: str) -> str:
    return f"https://placehold.co/600x900/{accent}/ffffff?text={quote_plus(title)}"


def seed_movies() -> dict[str, Movie]:
    movie_lookup: dict[str, Movie] = {}

    for item in MOVIES:
        color = GENRE_COLORS.get(item['genre'], '111827')
        movie, _ = Movie.objects.update_or_create(
            title=item['title'],
            defaults={
                'description': item['description'],
                'poster': build_poster(item['title'], color),
                'genre': item['genre'],
                'rating': item['rating'],
            },
        )
        movie_lookup[movie.title] = movie

    return movie_lookup


def seed_collections(movie_lookup: dict[str, Movie]) -> None:
    for item in COLLECTIONS:
        collection, _ = Collection.objects.update_or_create(
            title=item['title'],
            defaults={
                'description': item['description'],
                'accent': item['accent'],
            },
        )
        collection.movies.set([movie_lookup[title] for title in item['movies'] if title in movie_lookup])


def seed_demo_user(movie_lookup: dict[str, Movie]) -> None:
    user_model = get_user_model()
    demo_user, _ = user_model.objects.get_or_create(username='demo')
    demo_user.email = 'demo@kinotap.local'
    demo_user.set_password('demo1234')
    demo_user.save(update_fields=['email', 'password'])

    Favorite.objects.filter(user=demo_user).delete()
    Review.objects.filter(user=demo_user).delete()

    for title in FAVORITES:
        Favorite.objects.create(user=demo_user, movie=movie_lookup[title])

    for review in REVIEWS:
        Review.objects.create(user=demo_user, movie=movie_lookup[review['movie']], text=review['text'])


def main() -> None:
    movie_lookup = seed_movies()
    seed_collections(movie_lookup)
    seed_demo_user(movie_lookup)

    print(
        'Seed complete: '
        f"{Movie.objects.count()} movies, "
        f"{Collection.objects.count()} collections, "
        f"{Favorite.objects.count()} favorites, "
        f"{Review.objects.count()} reviews"
    )


if __name__ == '__main__':
    main()
