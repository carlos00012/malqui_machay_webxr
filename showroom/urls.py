from django.urls import path

from . import views

app_name = "showroom"

urlpatterns = [
    path("", views.index, name="index"),

    # API JSON (spec sección 15)
    path("api/lugar/", views.api_lugar, name="api_lugar"),
    path("api/flora/", views.api_flora, name="api_flora"),
    path("api/fauna/", views.api_fauna, name="api_fauna"),
    path("api/historia/", views.api_historia, name="api_historia"),
    path("api/datos/", views.api_datos, name="api_datos"),
    path("api/videos/", views.api_videos, name="api_videos"),
    path("api/modelos/", views.api_modelos, name="api_modelos"),
    path("api/puntos/", views.api_puntos, name="api_puntos"),
]
