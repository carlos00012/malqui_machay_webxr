# Turismo Inmersivo de las Ruinas de Malqui Machay (La Maná)

Museo virtual / WebXR desarrollado con **Django 6 + PostgreSQL + Bootstrap 5 +
JavaScript + A-Frame (WebXR)**, compatible con navegador de escritorio,
móvil y **Meta Quest**.

El usuario ingresa por una pantalla de bienvenida, atraviesa un arco de
piedra, y recorre un sendero principal que lo lleva por seis zonas
temáticas: **Flora → Fauna → Historia → Datos Curiosos → Sala Audiovisual →
Modelo 3D**. Todo el contenido de cada zona se carga dinámicamente desde
PostgreSQL a través de vistas `JsonResponse` consumidas con `fetch()`.

---

## 1. Arquitectura

```
Navegador / Meta Quest (A-Frame WebXR)
        │  fetch()
        ▼
Django (vistas basadas en función) ──► JsonResponse  (/api/flora/, /api/fauna/, ...)
        │
        ▼
PostgreSQL (Lugar, Flora, Fauna, Historia, DatoCurioso, Video, Modelo3D, PuntoTuristico)
```

| Capa | Tecnología | Responsabilidad |
|---|---|---|
| Backend | Django (FBV) | 8 endpoints `JsonResponse` (uno por modelo) + vista `index` |
| Base de datos | PostgreSQL | Persiste todo el contenido editable desde el admin |
| Frontend | JavaScript + A-Frame 1.5 | `fetch()` consume el JSON y construye proceduralmente el sendero, pedestales, paneles, galería, auditorio y modelo 3D |
| Estilos | CSS3 (variables, Cormorant Garamond + Jost) | Pantalla de bienvenida, overlay UI, panel de información, controles de video |

---

## 2. Estructura del proyecto

```
malqui_machay_webxr/
├── config/                       # Proyecto Django (settings, urls raíz)
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py / wsgi.py
├── showroom/                      # App principal
│   ├── models.py                  # Lugar, Flora, Fauna, Historia, DatoCurioso, Video, Modelo3D, PuntoTuristico
│   ├── admin.py                   # CRUD de los 8 modelos
│   ├── views.py                   # index + 8 vistas JsonResponse
│   ├── urls.py                    # /api/flora/, /api/fauna/, /api/historia/, /api/datos/, /api/videos/, /api/modelos/, /api/puntos/, /api/lugar/
│   ├── migrations/
│   └── management/commands/seed_malqui.py   # Carga datos de demostración
├── templates/showroom/index.html  # Bienvenida + overlay UI + <a-scene>
├── static/
│   ├── showroom/css/showroom.css  # Estilos (paleta piedra/bosque/Cotopaxi)
│   ├── showroom/js/app.js         # Construcción procedural de la escena WebXR
│   ├── showroom/images/           # Logos, panorámica de bienvenida, miniaturas de UI
│   ├── images/flora/              # Fotografías de flora (orquidea.jpg, ...)
│   ├── images/fauna/              # Fotografías de fauna (oso_andino.jpg, ...)
│   ├── images/historia/           # Fotografías históricas
│   ├── images/datos/              # Imágenes de la galería de datos curiosos
│   ├── videos/                    # malqui.mp4
│   ├── models/                    # malqui.glb
│   └── audio/                     # bosque.mp3
├── manage.py
└── requirements.txt
```

Cada carpeta de assets (`static/images/...`, `static/videos/`, `static/models/`,
`static/audio/`) incluye un archivo `LEEME.txt` que indica qué nombre de
archivo espera el seed de demostración. **El proyecto funciona sin estos
archivos**: el frontend detecta si la imagen/video/modelo no existe y
muestra automáticamente un reemplazo elegante (figura geométrica, color de
respaldo o texto), para que la demo nunca se vea rota.

---

## 3. Modelos (backend)

| Modelo | Uso |
|---|---|
| `Lugar` | Información general: nombre del proyecto, logos, imagen panorámica de bienvenida, audio ambiental |
| `Flora` | Especies vegetales de la Zona Flora (imagen, nombre científico, importancia ecológica, curiosidades, modelo 3D opcional) |
| `Fauna` | Especies animales de la Zona Fauna (hábitat, alimentación, estado de conservación) |
| `Historia` | Paneles de la galería histórica (fecha, dato curioso, QR opcional) |
| `DatoCurioso` | Cuadros de la galería de datos curiosos |
| `Video` | Video reproducido en el auditorio virtual (`<a-video>`) |
| `Modelo3D` | Modelo `.glb` principal, con velocidad de rotación configurable |
| `PuntoTuristico` | Paneles flotantes adicionales ubicados con coordenadas X/Y/Z libres sobre el sendero |

Todos los modelos tienen CRUD completo en `/admin/`.

---

## 4. API JSON

| Endpoint | Devuelve |
|---|---|
| `GET /api/lugar/` | Información general del proyecto |
| `GET /api/flora/` | Lista de especies vegetales |
| `GET /api/fauna/` | Lista de especies animales |
| `GET /api/historia/` | Paneles históricos |
| `GET /api/datos/` | Cuadros de datos curiosos |
| `GET /api/videos/` | Video(s) del auditorio |
| `GET /api/modelos/` | Modelo(s) 3D |
| `GET /api/puntos/` | Puntos turísticos flotantes |

---

## 5. Instalación

### 5.1. Requisitos
- Python 3.11+
- PostgreSQL 14+

### 5.2. Pasos

```bash
python -m venv .venv
source .venv/bin/activate        # En Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 5.3. Configurar PostgreSQL

```sql
CREATE DATABASE malqui_machay_db;
CREATE USER malqui_user WITH PASSWORD 'malqui2026';
GRANT ALL PRIVILEGES ON DATABASE malqui_machay_db TO malqui_user;
```

Puedes sobreescribir estos valores con variables de entorno
(`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`) sin tocar
`config/settings.py`.

### 5.4. Migraciones y datos de demostración

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_malqui        # Carga contenido de ejemplo (flora, fauna, historia, ...)
```

### 5.5. Ejecutar

```bash
python manage.py runserver 0.0.0.0:8000
```

Abre `http://localhost:8000/` en el navegador. Para probar en Meta Quest,
ambos dispositivos deben estar en la misma red local (usa la IP del equipo,
ej. `http://192.168.1.X:8000/`) o expón el servidor por HTTPS con
`runsslserver` (incluido vía `django-sslserver`) o `ngrok`, ya que WebXR
en Meta Quest requiere un origen seguro.

```bash
python manage.py runsslserver 0.0.0.0:8000
```

---

## 6. Agregar contenido real

1. Coloca las imágenes en `static/images/flora/`, `fauna/`, `historia/`,
   `datos/` con el nombre que registres en el admin (campo `imagen`).
2. Coloca `malqui.mp4` en `static/videos/` y regístralo en el modelo `Video`.
3. Coloca `malqui.glb` en `static/models/` y regístralo en `Modelo3D`.
4. Coloca `bosque.mp3` en `static/audio/` (o cambia la ruta en `Lugar`).
5. Sube los logos (`logo_proyecto.png`, `logo_utc.png`) y la imagen
   panorámica de bienvenida a `static/showroom/images/`.
6. Ejecuta `python manage.py collectstatic` si despliegas en producción.

---

## 7. Recorrido / experiencia (frontend)

1. **Bienvenida** — logo, nombre del proyecto, imagen panorámica, botón
   "Ingresar al Museo Virtual".
2. **Arco de entrada** — estructura de piedra con antorchas, luces y
   vegetación.
3. **Sendero principal** — camino con piedras, señalética y vegetación
   decorativa que conecta todas las zonas.
4. **Zona Flora** — pedestales con imagen/figura de respaldo, nombre
   científico, importancia ecológica y curiosidades.
5. **Zona Fauna** — igual que flora, con hábitat, alimentación y estado de
   conservación.
6. **Zona Historia** — galería de paneles con fecha y dato curioso.
7. **Datos Curiosos** — cuadros tipo museo con marco, foco y texto.
8. **Sala Audiovisual** — auditorio con bancas y pantalla `<a-video>`
   controlada por botones flotantes (▶ / ⏸).
9. **Modelo 3D** — plataforma giratoria con el modelo `.glb` principal
   (o una figura de respaldo si aún no se ha subido el archivo).

La navegación funciona con **mouse + teclado (WASD)** en escritorio y con
**controles láser + raycaster** en Meta Quest. Un indicador superior
muestra la zona actual a medida que el usuario avanza por el sendero.

---

## 8. Notas técnicas

- Todo el contenido de las zonas temáticas se pinta en tiempo de ejecución
  desde JavaScript (`static/showroom/js/app.js`); no hay datos fijos en el
  HTML.
- El frontend prueba cada imagen/modelo/video con una petición previa y,
  si no existe, sustituye el elemento por una figura geométrica o color de
  respaldo — así la demo nunca muestra un ícono de "imagen rota".
- El proyecto usa Django 6 con vistas basadas en función, tal como pide la
  guía académica del curso.
