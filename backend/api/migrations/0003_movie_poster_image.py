from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_collection'),
    ]

    operations = [
        migrations.AddField(
            model_name='movie',
            name='poster_image',
            field=models.FileField(blank=True, null=True, upload_to='movie_posters/'),
        ),
    ]
