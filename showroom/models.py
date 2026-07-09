from django.db import models


class Lugar(models.Model):
    """
    Información general del proyecto / lugar turístico. Funciona como un
    singleton editable desde el admin: alimenta la pantalla de bienvenida
    (logo, nombre, imagen panorámica, introducción) y los metadatos
    generales que aparecen en la cabecera del recorrido.
    """

    nombre_proyecto = models.CharField(
        max_length=150, default="Turismo Inmersivo de las Ruinas de Malqui Machay"
    )
    subtitulo = models.CharField(max_length=200, default="La Maná, Cotopaxi · Recorrido Virtual Inmersivo")
    introduccion = models.TextField(
        default=(
            "Explora de forma inmersiva las Ruinas de Malqui Machay: su flora, su fauna, "
            "su historia y sus tradiciones, en un recorrido virtual compatible con Meta Quest."
        )
    )
    logo_proyecto = models.CharField(
        max_length=255, blank=True,
        help_text="Ruta relativa dentro de /static/ (ej. showroom/images/logo_proyecto.png)",
    )
    logo_utc = models.CharField(
        max_length=255, blank=True,
        help_text="Ruta relativa dentro de /static/ (ej. showroom/images/logo_utc.png)",
    )
    imagen_panoramica = models.CharField(
        max_length=255,
        default="showroom/images/panoramica_malqui.jpg",
        help_text="Imagen panorámica de fondo mostrada en la pantalla de bienvenida.",
    )
    audio_ambiental = models.CharField(
        max_length=255,
        default="audio/bosque.mp3",
        help_text="Ruta relativa dentro de /static/ al audio ambiental de bosque/aves/agua.",
    )
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Lugar (información general)"
        verbose_name_plural = "Lugar (información general)"

    def __str__(self):
        return self.nombre_proyecto

    def to_dict(self):
        return {
            "id": self.id,
            "nombre_proyecto": self.nombre_proyecto,
            "subtitulo": self.subtitulo,
            "introduccion": self.introduccion,
            "logo_proyecto": f"/static/{self.logo_proyecto}" if self.logo_proyecto else None,
            "logo_utc": f"/static/{self.logo_utc}" if self.logo_utc else None,
            "imagen_panoramica": f"/static/{self.imagen_panoramica}" if self.imagen_panoramica else None,
            "audio_ambiental": f"/static/{self.audio_ambiental}" if self.audio_ambiental else None,
        }


class Flora(models.Model):
    """Especie vegetal exhibida en la Zona Flora sobre un pedestal."""

    nombre = models.CharField(max_length=120)
    nombre_cientifico = models.CharField(max_length=150, blank=True)
    imagen = models.CharField(
        max_length=255,
        help_text="Nombre de archivo dentro de /static/images/flora/ (ej. orquidea.jpg)",
    )
    descripcion = models.TextField()
    importancia_ecologica = models.TextField(blank=True)
    curiosidades = models.TextField(blank=True)
    modelo_3d = models.CharField(
        max_length=255, blank=True,
        help_text="Opcional. Ruta relativa dentro de /static/ a un modelo .glb/.gltf.",
    )
    orden = models.PositiveIntegerField(default=0)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["orden", "id"]
        verbose_name = "Flora"
        verbose_name_plural = "Flora"

    def __str__(self):
        return self.nombre

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "nombre_cientifico": self.nombre_cientifico,
            "imagen": f"/static/images/flora/{self.imagen}" if self.imagen else None,
            "descripcion": self.descripcion,
            "importancia_ecologica": self.importancia_ecologica,
            "curiosidades": self.curiosidades,
            "modelo_3d": f"/static/{self.modelo_3d}" if self.modelo_3d else None,
            "orden": self.orden,
        }


class Fauna(models.Model):
    """Especie animal exhibida en la Zona Fauna."""

    nombre = models.CharField(max_length=120)
    imagen = models.CharField(
        max_length=255,
        help_text="Nombre de archivo dentro de /static/images/fauna/ (ej. oso_andino.jpg)",
    )
    descripcion = models.TextField()
    habitat = models.TextField(blank=True)
    alimentacion = models.TextField(blank=True)
    estado_conservacion = models.CharField(max_length=100, blank=True)
    curiosidades = models.TextField(blank=True)
    orden = models.PositiveIntegerField(default=0)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["orden", "id"]
        verbose_name = "Fauna"
        verbose_name_plural = "Fauna"

    def __str__(self):
        return self.nombre

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "imagen": f"/static/images/fauna/{self.imagen}" if self.imagen else None,
            "descripcion": self.descripcion,
            "habitat": self.habitat,
            "alimentacion": self.alimentacion,
            "estado_conservacion": self.estado_conservacion,
            "curiosidades": self.curiosidades,
            "orden": self.orden,
        }


class Historia(models.Model):
    """Panel de la galería histórica."""

    titulo = models.CharField(max_length=150, blank=True)
    imagen = models.CharField(
        max_length=255,
        help_text="Nombre de archivo dentro de /static/images/historia/ (ej. fundacion.jpg)",
    )
    fecha = models.CharField(max_length=100, blank=True, help_text="Ej. '1534' o 'Época preincaica'")
    descripcion = models.TextField()
    dato_curioso = models.TextField(blank=True)
    codigo_qr = models.CharField(
        max_length=255, blank=True,
        help_text="Opcional. Ruta relativa dentro de /static/ a una imagen de código QR.",
    )
    orden = models.PositiveIntegerField(default=0)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["orden", "id"]
        verbose_name = "Historia"
        verbose_name_plural = "Historia"

    def __str__(self):
        return self.titulo or f"Panel histórico #{self.pk}"

    def to_dict(self):
        return {
            "id": self.id,
            "titulo": self.titulo,
            "imagen": f"/static/images/historia/{self.imagen}" if self.imagen else None,
            "fecha": self.fecha,
            "descripcion": self.descripcion,
            "dato_curioso": self.dato_curioso,
            "codigo_qr": f"/static/{self.codigo_qr}" if self.codigo_qr else None,
            "orden": self.orden,
        }


class DatoCurioso(models.Model):
    """Cuadro de la galería de datos curiosos."""

    titulo = models.CharField(max_length=150)
    imagen = models.CharField(
        max_length=255,
        help_text="Nombre de archivo dentro de /static/images/datos/ (ej. leyenda.jpg)",
    )
    texto = models.TextField()
    orden = models.PositiveIntegerField(default=0)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["orden", "id"]
        verbose_name = "Dato curioso"
        verbose_name_plural = "Datos curiosos"

    def __str__(self):
        return self.titulo

    def to_dict(self):
        return {
            "id": self.id,
            "titulo": self.titulo,
            "imagen": f"/static/images/datos/{self.imagen}" if self.imagen else None,
            "texto": self.texto,
            "orden": self.orden,
        }


class Video(models.Model):
    """Video documental reproducido en el auditorio virtual."""

    titulo = models.CharField(max_length=150, default="Ruinas de Malqui Machay")
    descripcion = models.TextField(blank=True)
    archivo = models.CharField(
        max_length=255,
        default="videos/malqui.mp4",
        help_text="Ruta relativa dentro de /static/ (ej. videos/malqui.mp4)",
    )
    miniatura = models.CharField(
        max_length=255, blank=True,
        help_text="Opcional. Imagen de previsualización (poster) del video.",
    )
    activo = models.BooleanField(default=True)
    orden = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["orden", "id"]
        verbose_name = "Video"
        verbose_name_plural = "Videos"

    def __str__(self):
        return self.titulo

    def to_dict(self):
        return {
            "id": self.id,
            "titulo": self.titulo,
            "descripcion": self.descripcion,
            "archivo": f"/static/{self.archivo}" if self.archivo else None,
            "miniatura": f"/static/{self.miniatura}" if self.miniatura else None,
            "orden": self.orden,
        }


class Modelo3D(models.Model):
    """Modelo GLB principal exhibido al final del recorrido."""

    nombre = models.CharField(max_length=150, default="Maqueta de Malqui Machay")
    descripcion = models.TextField(blank=True)
    archivo_glb = models.CharField(
        max_length=255,
        default="models/malqui.glb",
        help_text="Ruta relativa dentro de /static/ (ej. models/malqui.glb)",
    )
    escala = models.FloatField(default=1.0)
    velocidad_rotacion = models.FloatField(
        default=8.0, help_text="Segundos que tarda en dar una vuelta completa (rotación lenta)."
    )
    activo = models.BooleanField(default=True)
    orden = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["orden", "id"]
        verbose_name = "Modelo 3D"
        verbose_name_plural = "Modelos 3D"

    def __str__(self):
        return self.nombre

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "archivo_glb": f"/static/{self.archivo_glb}" if self.archivo_glb else None,
            "escala": self.escala,
            "velocidad_rotacion": self.velocidad_rotacion,
            "orden": self.orden,
        }


class PuntoTuristico(models.Model):
    """
    Punto turístico genérico usado para los paneles informativos flotantes
    que aparecen a lo largo del sendero principal (fuera de las zonas
    temáticas de flora/fauna/historia/datos/video/modelo).
    """

    titulo = models.CharField(max_length=150)
    descripcion = models.TextField()
    imagen = models.CharField(
        max_length=255, blank=True,
        help_text="Ruta relativa dentro de /static/ (ej. showroom/images/mirador.jpg)",
    )
    pos_x = models.FloatField(default=0.0)
    pos_y = models.FloatField(default=1.6)
    pos_z = models.FloatField(default=-5.0)
    orden = models.PositiveIntegerField(default=0)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["orden", "id"]
        verbose_name = "Punto turístico"
        verbose_name_plural = "Puntos turísticos"

    def __str__(self):
        return self.titulo

    def to_dict(self):
        return {
            "id": self.id,
            "titulo": self.titulo,
            "descripcion": self.descripcion,
            "imagen": f"/static/{self.imagen}" if self.imagen else None,
            "posicion": {"x": self.pos_x, "y": self.pos_y, "z": self.pos_z},
            "orden": self.orden,
        }
