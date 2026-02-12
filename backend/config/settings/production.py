from .base import *

DEBUG = False
SECRET_KEY = 'django-insecure-development-key'
ALLOWED_HOSTS = ['*']

# Local sqlite fallback if needed for simple tests without docker
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }
