from django.http import JsonResponse
from django.shortcuts import render

from .models import (
    Lugar, Flora, Fauna, Historia, DatoCurioso, Video, Modelo3D, PuntoTuristico,
)


def index(request):
    """
    Vista principal: renderiza el lienzo WebXR (A-Frame) junto con la
    pantalla de bienvenida. Todo el contenido de las zonas temáticas
    (flora, fauna, historia, datos curiosos, video, modelo 3D) se carga
    dinámicamente desde el frontend mediante fetch() a las vistas
    /api/* definidas más abajo.
    """
    lugar = Lugar.objects.filter(activo=True).first()
    contexto = {"lugar": lugar}
    return render(request, "showroom/index.html", contexto)


def api_flora(request):
    """GET /api/flora/ -> lista de especies vegetales para la Zona Flora."""
    data = [f.to_dict() for f in Flora.objects.filter(activo=True)]
    return JsonResponse({"total": len(data), "flora": data})


def api_fauna(request):
    """GET /api/fauna/ -> lista de especies animales para la Zona Fauna."""
    data = [f.to_dict() for f in Fauna.objects.filter(activo=True)]
    return JsonResponse({"total": len(data), "fauna": data})


def api_historia(request):
    """GET /api/historia/ -> paneles de la galería histórica."""
    data = [h.to_dict() for h in Historia.objects.filter(activo=True)]
    return JsonResponse({"total": len(data), "historia": data})


def api_datos(request):
    """GET /api/datos/ -> cuadros de la galería de datos curiosos."""
    data = [d.to_dict() for d in DatoCurioso.objects.filter(activo=True)]
    return JsonResponse({"total": len(data), "datos": data})


def api_videos(request):
    """GET /api/videos/ -> video(s) reproducidos en el auditorio virtual."""
    data = [v.to_dict() for v in Video.objects.filter(activo=True)]
    return JsonResponse({"total": len(data), "videos": data})


def api_modelos(request):
    """GET /api/modelos/ -> modelo(s) 3D (.glb) exhibidos al final del recorrido."""
    data = [m.to_dict() for m in Modelo3D.objects.filter(activo=True)]
    return JsonResponse({"total": len(data), "modelos": data})


def api_puntos(request):
    """GET /api/puntos/ -> paneles informativos flotantes del sendero principal."""
    data = [p.to_dict() for p in PuntoTuristico.objects.filter(activo=True)]
    return JsonResponse({"total": len(data), "puntos": data})


def api_lugar(request):
    """GET /api/lugar/ -> información general del proyecto (bienvenida)."""
    lugar = Lugar.objects.filter(activo=True).first()
    return JsonResponse(lugar.to_dict() if lugar else {})
