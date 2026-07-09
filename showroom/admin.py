from django.contrib import admin

from .models import (
    Lugar, Flora, Fauna, Historia, DatoCurioso, Video, Modelo3D, PuntoTuristico,
)


@admin.register(Lugar)
class LugarAdmin(admin.ModelAdmin):
    list_display = ("nombre_proyecto", "subtitulo", "activo")


@admin.register(Flora)
class FloraAdmin(admin.ModelAdmin):
    list_display = ("nombre", "nombre_cientifico", "orden", "activo")
    list_filter = ("activo",)
    search_fields = ("nombre", "nombre_cientifico", "descripcion")
    list_editable = ("orden", "activo")


@admin.register(Fauna)
class FaunaAdmin(admin.ModelAdmin):
    list_display = ("nombre", "estado_conservacion", "orden", "activo")
    list_filter = ("activo", "estado_conservacion")
    search_fields = ("nombre", "descripcion", "habitat")
    list_editable = ("orden", "activo")


@admin.register(Historia)
class HistoriaAdmin(admin.ModelAdmin):
    list_display = ("titulo", "fecha", "orden", "activo")
    list_filter = ("activo",)
    search_fields = ("titulo", "descripcion", "fecha")
    list_editable = ("orden", "activo")


@admin.register(DatoCurioso)
class DatoCuriosoAdmin(admin.ModelAdmin):
    list_display = ("titulo", "orden", "activo")
    list_filter = ("activo",)
    search_fields = ("titulo", "texto")
    list_editable = ("orden", "activo")


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ("titulo", "archivo", "orden", "activo")
    list_editable = ("orden", "activo")


@admin.register(Modelo3D)
class Modelo3DAdmin(admin.ModelAdmin):
    list_display = ("nombre", "archivo_glb", "escala", "velocidad_rotacion", "orden", "activo")
    list_editable = ("orden", "activo")


@admin.register(PuntoTuristico)
class PuntoTuristicoAdmin(admin.ModelAdmin):
    list_display = ("titulo", "pos_x", "pos_y", "pos_z", "orden", "activo")
    list_filter = ("activo",)
    search_fields = ("titulo", "descripcion")
    list_editable = ("orden", "activo")
