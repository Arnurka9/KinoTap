import logging

from django.conf import settings
from django.core.mail import send_mail
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from ..serializers import RegistrationSerializer


logger = logging.getLogger(__name__)


class RegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        email_sent = False

        try:
            send_mail(
                subject='Добро пожаловать в KinoTap',
                message=(
                    f'Здравствуйте, {user.username}!\n\n'
                    'Регистрация в KinoTap прошла успешно. '\
                    'Теперь можно войти в каталог, добавить фильмы в избранное и оставить отзыв.\n\n'
                    f'Логин: {user.username}\n'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            email_sent = True
        except Exception as exc:
            logger.warning('Registration email could not be sent for %s: %s', user.username, exc)

        detail = (
            'Аккаунт создан. Проверьте почту.'
            if email_sent
            else 'Аккаунт создан, но письмо не отправлено. Проверьте SMTP-настройки.'
        )

        return Response(
            {
                'detail': detail,
                'username': user.username,
                'email': user.email,
                'email_sent': email_sent,
            },
            status=status.HTTP_201_CREATED,
        )

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"detail": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"detail": "Logout successful."},
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception:
            raise ValidationError({"detail": "Invalid or expired refresh token."})