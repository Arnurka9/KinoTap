export interface MovieMini {
  id: number;
  title: string;
  poster: string | null;
}

export interface Movie extends MovieMini {
  description: string;
  genre: string;
  rating: number;
  reviews_count: number;
  is_favorite: boolean;
}

export interface Review {
  id: number;
  movie: MovieMini;
  user: string;
  text: string;
  created_at: string;
}

export interface Favorite {
  id: number;
  movie: MovieMini;
  added_at: string;
}

export interface Collection {
  id: number;
  title: string;
  description: string;
  accent: string;
  movies: MovieMini[];
}

const COLLECTION_ACCENT_FALLBACKS: Record<string, string> = {
  amber: '#f59e0b',
  crimson: '#dc2626',
  teal: '#0f766e',
};

export function resolveCollectionAccent(accent: string): string {
  const normalized = accent.trim();

  if (!normalized) {
    return '#f59e0b';
  }

  if (/^#[0-9a-f]{3,8}$/i.test(normalized)) {
    return normalized;
  }

  if (/^[0-9a-f]{6}$/i.test(normalized)) {
    return `#${normalized}`;
  }

  return COLLECTION_ACCENT_FALLBACKS[normalized.toLowerCase()] ?? '#f59e0b';
}

export interface FavoriteToggleResponse {
  status: 'added' | 'removed';
  movie_id: number;
  favorite: Favorite | null;
}

export interface MovieQueryParams {
  search?: string;
  genre?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegistrationCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegistrationResponse {
  detail: string;
  username: string;
  email: string;
  email_sent: boolean;
}

export const GENRE_ORDER = [
  'Комедии',
  'Боевики',
  'Фантастика',
  'Триллеры',
  'Приключения',
  'Драмы',
  'Мультфильмы',
  'Фэнтези',
  'Семейное',
  'Мелодрамы',
  'Детективы',
  'Ужасы',
  'Историческое',
  'Биографии',
  'Военное',
  'Артхаус',
  'Спорт',
  'Короткий метр',
];
