from django.contrib.auth.models import User
from django.core import mail
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase


class RegistrationTests(APITestCase):
	@override_settings(
		EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
		DEFAULT_FROM_EMAIL='noreply@kinotap.local',
	)
	def test_registers_user_and_sends_email(self):
		response = self.client.post(
			'/api/register/',
			{
				'username': 'newuser',
				'email': 'newuser@example.com',
				'password': 'StrongPass123',
				'confirm_password': 'StrongPass123',
			},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertTrue(User.objects.filter(username='newuser').exists())
		self.assertEqual(len(mail.outbox), 1)
		self.assertIn('KinoTap', mail.outbox[0].subject)

	def test_registration_rejects_mismatched_passwords(self):
		response = self.client.post(
			'/api/register/',
			{
				'username': 'anotheruser',
				'email': 'another@example.com',
				'password': 'StrongPass123',
				'confirm_password': 'WrongPass123',
			},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertFalse(User.objects.filter(username='anotheruser').exists())
