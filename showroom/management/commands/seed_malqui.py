from django.core.management.base import BaseCommand

from showroom.models import (
    Lugar, Flora, Fauna, Historia, DatoCurioso, Video, Modelo3D, PuntoTuristico,
)


class Command(BaseCommand):
    help = "Carga datos de demostración para el Museo Virtual Malqui Machay."

    def handle(self, *args, **options):
        lugar, _ = Lugar.objects.update_or_create(
            id=1,
            defaults=dict(
                nombre_proyecto="Turismo Inmersivo de las Ruinas de Malqui Machay",
                subtitulo="La Maná, Cotopaxi · Recorrido Virtual Inmersivo",
                introduccion=(
                    "Bienvenido al Museo Virtual Malqui Machay. Recorre un sendero inmersivo "
                    "a través de su flora, su fauna, su historia y sus tradiciones, disponible "
                    "en escritorio, móvil y Meta Quest."
                ),
                logo_proyecto="showroom/images/logo_proyecto.png",
                logo_utc="showroom/images/logo_utc.png",
                imagen_panoramica="showroom/images/panoramica_malqui.jpg",
                audio_ambiental="audio/bosque.mp3",
                activo=True,
            ),
        )

        flora_items = [
            dict(nombre="Orquídea de Montaña", nombre_cientifico="Masdevallia veitchiana",
                 imagen="orquidea.jpg",
                 descripcion="Orquídea epífita de flores intensamente rojas, típica de los bosques nublados de Cotopaxi.",
                 importancia_ecologica="Indicadora de la calidad del bosque nublado y polinizada por colibríes especializados.",
                 curiosidades="Puede tardar años en florecer por primera vez.", orden=1),
            dict(nombre="Helecho Arbóreo", nombre_cientifico="Cyathea caracasana",
                 imagen="helecho.jpg",
                 descripcion="Helecho de gran tamaño con un tronco fibroso que puede superar los 5 metros de altura.",
                 importancia_ecologica="Retiene humedad del suelo y sirve de refugio a pequeños insectos y anfibios.",
                 curiosidades="Es pariente de especies que existían desde la era de los dinosaurios.", orden=2),
            dict(nombre="Achira", nombre_cientifico="Canna indica",
                 imagen="achira.jpg",
                 descripcion="Planta de flores vistosas y raíces comestibles, cultivada tradicionalmente en la zona.",
                 importancia_ecologica="Atrae polinizadores nativos y se usa en la agricultura de subsistencia local.",
                 curiosidades="Sus rizomas se usaban para preparar harina antes de la llegada del maíz procesado.", orden=3),
        ]
        for item in flora_items:
            Flora.objects.update_or_create(nombre=item["nombre"], defaults=item)

        fauna_items = [
            dict(nombre="Oso de Anteojos", imagen="oso_andino.jpg",
                 descripcion="También llamado oso andino, es el único oso nativo de Sudamérica.",
                 habitat="Bosques nublados y páramos de la cordillera de los Andes.",
                 alimentacion="Principalmente frutos, bromelias y ocasionalmente pequeños mamíferos.",
                 estado_conservacion="Vulnerable", curiosidades="Debe su nombre a las manchas claras alrededor de sus ojos.",
                 orden=1),
            dict(nombre="Tucán Andino", imagen="tucan.jpg",
                 descripcion="Ave de pico grande y colorido, símbolo de los bosques tropicales de la región.",
                 habitat="Bordes de bosque húmedo tropical y subtropical.",
                 alimentacion="Frutas, insectos y pequeños vertebrados.",
                 estado_conservacion="Preocupación menor", curiosidades="Su pico ayuda a regular su temperatura corporal.",
                 orden=2),
            dict(nombre="Armadillo de Nueve Bandas", imagen="armadillo.jpg",
                 descripcion="Mamífero de cuerpo acorazado que habita en las zonas boscosas cercanas a las ruinas.",
                 habitat="Bosques húmedos y áreas de cultivo cercanas.",
                 alimentacion="Insectos, larvas y pequeños invertebrados del suelo.",
                 estado_conservacion="Preocupación menor", curiosidades="Siempre da a luz a cuatro crías genéticamente idénticas.",
                 orden=3),
        ]
        for item in fauna_items:
            Fauna.objects.update_or_create(nombre=item["nombre"], defaults=item)

        historia_items = [
            dict(titulo="Origen del Asentamiento", imagen="fundacion.jpg", fecha="Época preincaica",
                 descripcion="Los primeros vestigios de ocupación humana en Malqui Machay datan de comunidades preincaicas asentadas en la región.",
                 dato_curioso="El nombre 'Malqui Machay' proviene de voces quichuas relacionadas con 'árbol' y 'cueva/refugio'.",
                 orden=1),
            dict(titulo="Época Colonial", imagen="epoca_colonial.jpg", fecha="Siglo XVI - XVIII",
                 descripcion="Durante la colonia, la zona fue testigo de la mezcla de tradiciones indígenas y españolas.",
                 dato_curioso="Se conservan caminos empedrados atribuidos a esta época.", orden=2),
            dict(titulo="Declaratoria Patrimonial", imagen="declaratoria.jpg", fecha="Siglo XXI",
                 descripcion="Las ruinas fueron reconocidas como parte del patrimonio cultural de La Maná, impulsando su conservación.",
                 dato_curioso="El sitio es hoy un referente para el turismo comunitario de Cotopaxi.", orden=3),
        ]
        for item in historia_items:
            Historia.objects.update_or_create(titulo=item["titulo"], defaults=item)

        datos_items = [
            dict(titulo="La Leyenda del Guardián", imagen="leyenda.jpg",
                 texto="Cuenta la tradición oral que un guardián de piedra protege la entrada a Malqui Machay durante la noche.",
                 orden=1),
            dict(titulo="El Árbol Sagrado", imagen="arbol_sagrado.jpg",
                 texto="Un antiguo árbol cercano a las ruinas era usado como punto de encuentro y ofrendas por las comunidades locales.",
                 orden=2),
            dict(titulo="El Eco de la Cascada", imagen="cascada.jpg",
                 texto="La cascada cercana produce un eco particular que, según los pobladores, anuncia cambios de clima.",
                 orden=3),
        ]
        for item in datos_items:
            DatoCurioso.objects.update_or_create(titulo=item["titulo"], defaults=item)

        Video.objects.update_or_create(
            id=1,
            defaults=dict(
                titulo="Documental: Ruinas de Malqui Machay",
                descripcion="Un recorrido audiovisual por la historia, flora y fauna de Malqui Machay.",
                archivo="videos/malqui.mp4",
                miniatura="showroom/images/video_miniatura.jpg",
                activo=True, orden=1,
            ),
        )

        Modelo3D.objects.update_or_create(
            id=1,
            defaults=dict(
                nombre="Maqueta de Malqui Machay",
                descripcion="Reconstrucción 3D de referencia del complejo arqueológico de Malqui Machay.",
                archivo_glb="models/malqui.glb",
                escala=1.0, velocidad_rotacion=10.0, activo=True, orden=1,
            ),
        )

        puntos_items = [
            dict(titulo="Mirador Panorámico", descripcion="Punto elevado con vista al valle de La Maná.",
                 imagen="showroom/images/mirador.jpg", pos_x=-4, pos_y=1.6, pos_z=-8, orden=1),
            dict(titulo="Fuente de Agua Sagrada", descripcion="Antiguo canal de agua asociado a rituales de la comunidad.",
                 imagen="showroom/images/fuente.jpg", pos_x=4, pos_y=1.6, pos_z=-14, orden=2),
        ]
        for item in puntos_items:
            PuntoTuristico.objects.update_or_create(titulo=item["titulo"], defaults=item)

        self.stdout.write(self.style.SUCCESS(
            "✔ Datos de demostración cargados: Lugar, Flora, Fauna, Historia, "
            "DatoCurioso, Video, Modelo3D y PuntoTuristico."
        ))
