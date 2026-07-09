/* =====================================================================
   Museo Virtual Malqui Machay — Frontend WebXR (A-Frame)
   Todo el contenido (flora, fauna, historia, datos curiosos, video,
   modelo 3D) se obtiene dinámicamente vía fetch() desde las vistas
   JsonResponse de Django y se construye proceduralmente a lo largo de
   un sendero principal.
   ===================================================================== */

(function () {
  "use strict";

  const API = {
    flora: "/api/flora/",
    fauna: "/api/fauna/",
    historia: "/api/historia/",
    datos: "/api/datos/",
    videos: "/api/videos/",
    modelos: "/api/modelos/",
    puntos: "/api/puntos/",
  };

  const PALETA = {
    flora: "#3C7A4E",
    fauna: "#8C6A3F",
    historia: "#6E6259",
    datos: "#7A4B2E",
    video: "#2B2320",
    modelo: "#4A5D45",
    punto: "#C9A227",
  };

  const escena = document.querySelector("a-scene");
  const rig = document.getElementById("rig-camara");

  /* ---------------------------------------------------------------- */
  /* Utilidades                                                        */
  /* ---------------------------------------------------------------- */

  function crearEntidad(attrs) {
    const el = document.createElement("a-entity");
    Object.entries(attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  function probarImagen(url) {
    return new Promise((resolve) => {
      if (!url) return resolve(false);
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  async function obtenerJSON(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      return await res.json();
    } catch (err) {
      console.warn("No se pudo cargar", url, err);
      return null;
    }
  }

  function marcarInteractivo(el, datos) {
    el.classList.add("interactivo");
    el.dataset.info = JSON.stringify(datos);
    el.addEventListener("click", () => mostrarPanel(datos));
    // Feedback visual sutil al mirar/apuntar (VR y mouse)
    el.addEventListener("mouseenter", () => el.setAttribute("animation__hover", "property: scale; to: 1.08 1.08 1.08; dur: 180"));
    el.addEventListener("mouseleave", () => el.setAttribute("animation__hover", "property: scale; to: 1 1 1; dur: 180"));
  }

  /* ---------------------------------------------------------------- */
  /* Panel de información flotante                                     */
  /* ---------------------------------------------------------------- */

  const panelInfo = document.getElementById("panel-info");
  const infoCategoria = document.getElementById("info-categoria");
  const infoImagen = document.getElementById("info-imagen");
  const infoNombre = document.getElementById("info-nombre");
  const infoSubnombre = document.getElementById("info-subnombre");
  const infoDescripcion = document.getElementById("info-descripcion");
  const infoExtra = document.getElementById("info-extra");

  function campoExtra(etiqueta, valor) {
    if (!valor) return "";
    return `<div class="info-extra"><strong>${etiqueta}</strong><p>${valor}</p></div>`;
  }

  function mostrarPanel(datos) {
    infoCategoria.textContent = datos.categoria || "";
    infoNombre.textContent = datos.nombre || datos.titulo || "";
    infoSubnombre.textContent = datos.subnombre || "";
    infoSubnombre.style.display = datos.subnombre ? "block" : "none";
    infoDescripcion.textContent = datos.descripcion || datos.texto || "";

    if (datos.imagen) {
      infoImagen.src = datos.imagen;
      infoImagen.classList.remove("oculto");
      infoImagen.onerror = () => infoImagen.classList.add("oculto");
    } else {
      infoImagen.classList.add("oculto");
    }

    let extraHtml = "";
    extraHtml += campoExtra("Importancia ecológica", datos.importancia_ecologica);
    extraHtml += campoExtra("Hábitat", datos.habitat);
    extraHtml += campoExtra("Alimentación", datos.alimentacion);
    extraHtml += campoExtra("Estado de conservación", datos.estado_conservacion);
    extraHtml += campoExtra("Fecha", datos.fecha);
    extraHtml += campoExtra("Dato curioso", datos.dato_curioso || datos.curiosidades);
    infoExtra.innerHTML = extraHtml;

    panelInfo.classList.remove("oculto");
    requestAnimationFrame(() => panelInfo.classList.add("visible"));
  }

  function ocultarPanel() {
    panelInfo.classList.remove("visible");
    setTimeout(() => panelInfo.classList.add("oculto"), 300);
  }
  document.getElementById("cerrar-panel").addEventListener("click", ocultarPanel);

  /* ---------------------------------------------------------------- */
  /* Layout: control del avance a lo largo del sendero (eje Z-)         */
  /* ---------------------------------------------------------------- */

  let zCursor = -18; // justo después del arco
  const limitesZona = {}; // guarda inicio/fin de cada zona para el indicador

  function reservarZona(nombre, longitud) {
    const inicio = zCursor;
    zCursor -= longitud;
    limitesZona[nombre] = { inicio, fin: zCursor };
    return inicio;
  }

  /* ---------------------------------------------------------------- */
  /* 3. Sendero principal + decoración                                  */
  /* ---------------------------------------------------------------- */

  function construirSendero(largoTotal) {
    const contenedor = document.getElementById("zona-sendero");

    const franja = crearEntidad({
      geometry: `primitive: plane; width: 5; height: ${largoTotal + 30}`,
      rotation: "-90 0 0",
      position: `0 0.01 ${-(largoTotal - 8) / 2}`,
      material: "color: #7A6A52; shader: flat; repeat: 2 40",
      shadow: "receive: true",
    });
    contenedor.appendChild(franja);

    // Bordes de piedra + vegetación decorativa cada ~7 unidades
    for (let z = 4; z > -largoTotal; z -= 7) {
      [-1, 1].forEach((lado) => {
        const piedra = crearEntidad({
          geometry: "primitive: dodecahedron; radius: 0.22",
          position: `${lado * 2.9} 0.15 ${z + (Math.random() - 0.5) * 2}`,
          material: "color: #756A5E; shader: standard; roughness: 1",
          rotation: `${Math.random() * 360} ${Math.random() * 360} 0`,
        });
        contenedor.appendChild(piedra);

        if (Math.random() > 0.35) {
          const arbusto = crearEntidad({ position: `${lado * 3.6} 0 ${z}` });
          const tronco = crearEntidad({
            geometry: "primitive: cylinder; radius: 0.08; height: 1.1",
            position: "0 0.55 0",
            material: "color: #5B4530; shader: standard",
          });
          const copa = crearEntidad({
            geometry: `primitive: cone; radiusBottom: ${0.5 + Math.random() * 0.4}; radiusTop: 0.05; height: ${1.2 + Math.random()}`,
            position: `0 ${1.5 + Math.random() * 0.4} 0`,
            material: "color: #2E5B3A; shader: standard",
          });
          arbusto.appendChild(tronco);
          arbusto.appendChild(copa);
          contenedor.appendChild(arbusto);
        }
      });
    }

    // Señalética simple en el arranque del sendero
    const senal = crearEntidad({
      geometry: "primitive: plane; width: 1.6; height: 0.5",
      position: "0 1.7 2",
      material: "color: #1F5F3F; shader: flat",
    });
    const senalTexto = crearEntidad({
      text: "value: SENDERO PRINCIPAL; align: center; color: #F5F1E8; width: 2.6",
      position: "0 0 0.01",
    });
    senal.appendChild(senalTexto);
    contenedor.appendChild(senal);
  }

  /* ---------------------------------------------------------------- */
  /* 2. Arco de entrada                                                 */
  /* ---------------------------------------------------------------- */

  function construirArco() {
    const contenedor = document.getElementById("zona-arco");
    const z = -8;

    ["Pilar izquierdo", "Pilar derecho"].forEach((_, i) => {
      const lado = i === 0 ? -1 : 1;
      const pilar = crearEntidad({
        geometry: "primitive: box; width: 0.9; height: 4.4; depth: 0.9",
        position: `${lado * 2.2} 2.2 ${z}`,
        material: "color: #766A5C; shader: standard; roughness: 1",
        shadow: "cast: true",
      });
      contenedor.appendChild(pilar);

      // Antorcha
      const antorcha = crearEntidad({ position: `${lado * 2.2} 4.1 ${z + 0.6}` });
      const palo = crearEntidad({
        geometry: "primitive: cylinder; radius: 0.05; height: 0.5",
        material: "color: #3D2B1B; shader: standard",
      });
      const llama = crearEntidad({
        geometry: "primitive: cone; radiusBottom: 0.12; radiusTop: 0.01; height: 0.3",
        position: "0 0.35 0",
        material: "color: #F2A93B; shader: flat; emissive: #F2A93B; emissiveIntensity: 0.9",
        animation__flama: "property: scale; dir: alternate; loop: true; dur: 500; to: 0.85 1.15 0.85",
      });
      const luzAntorcha = crearEntidad({
        light: "type: point; color: #F2A93B; intensity: 0.7; distance: 6",
        position: "0 0.4 0",
      });
      antorcha.appendChild(palo);
      antorcha.appendChild(llama);
      antorcha.appendChild(luzAntorcha);
      contenedor.appendChild(antorcha);
    });

    const dintel = crearEntidad({
      geometry: "primitive: box; width: 5.2; height: 0.7; depth: 0.9",
      position: `0 4.55 ${z}`,
      material: "color: #6E6259; shader: standard; roughness: 1",
      shadow: "cast: true",
    });
    contenedor.appendChild(dintel);

    const titulo = crearEntidad({
      text: "value: Museo Virtual Malqui Machay; align: center; color: #F5F1E8; width: 6; wrapCount: 20",
      position: `0 5.35 ${z}`,
    });
    contenedor.appendChild(titulo);

    // Vegetación en la base del arco
    [-3.1, 3.1].forEach((x) => {
      const copa = crearEntidad({
        geometry: "primitive: sphere; radius: 0.6",
        position: `${x} 0.6 ${z}`,
        material: "color: #2E5B3A; shader: standard",
      });
      contenedor.appendChild(copa);
    });
  }

  /* ---------------------------------------------------------------- */
  /* Pedestal genérico (flora / fauna)                                  */
  /* ---------------------------------------------------------------- */

  async function crearPedestal({ x, z, color, item, tipo, figuraFallback }) {
    const grupo = crearEntidad({ position: `${x} 0 ${z}` });

    const base = crearEntidad({
      geometry: "primitive: cylinder; radius: 0.5; height: 1",
      position: "0 0.5 0",
      material: `color: ${color}; shader: standard; roughness: 0.8`,
      shadow: "cast: true; receive: true",
    });
    grupo.appendChild(base);

    const hayImagen = await probarImagen(item.imagen);
    if (hayImagen) {
      const marco = crearEntidad({
        geometry: "primitive: plane; width: 1.5; height: 1.5",
        position: "0 1.85 0",
        material: `color: ${PALETA.datos}; shader: flat`,
      });
      const imagen = crearEntidad({
        geometry: "primitive: plane; width: 1.3; height: 1.3",
        position: "0 0 0.02",
        material: `src: ${item.imagen}; shader: flat`,
      });
      marco.appendChild(imagen);
      grupo.appendChild(marco);
    } else {
      const figura = crearEntidad({
        geometry: `primitive: ${figuraFallback}; radius: 0.45`,
        position: "0 1.65 0",
        material: `color: ${color}; shader: standard; roughness: 0.4; metalness: 0.1`,
        animation__flotar: "property: position; dir: alternate; loop: true; dur: 2200; to: 0 1.85 0",
      });
      grupo.appendChild(figura);
    }

    const etiqueta = crearEntidad({
      geometry: "primitive: plane; width: 1.7; height: 0.4",
      position: "0 1.02 0.52",
      material: "color: #14201A; shader: flat; opacity: 0.85",
    });
    const texto = crearEntidad({
      text: `value: ${item.nombre}; align: center; color: #F5F1E8; width: 2.2; wrapCount: 22`,
      position: "0 0 0.01",
    });
    etiqueta.appendChild(texto);
    grupo.appendChild(etiqueta);

    marcarInteractivo(grupo, Object.assign({ categoria: tipo === "flora" ? "Flora" : "Fauna" }, item));
    return grupo;
  }

  /* ---------------------------------------------------------------- */
  /* 4. Zona Flora                                                     */
  /* ---------------------------------------------------------------- */

  async function construirFlora(items) {
    if (!items || !items.length) return;
    const contenedor = document.getElementById("zona-flora");
    reservarZona("flora", items.length * 8 + 6);

    const rotulo = crearRotuloZona("ZONA FLORA", zCursor + items.length * 8 + 4);
    contenedor.appendChild(rotulo);

    for (let i = 0; i < items.length; i++) {
      const lado = i % 2 === 0 ? -1 : 1;
      const pedestal = await crearPedestal({
        x: lado * 2.6,
        z: -20 - i * 8,
        color: PALETA.flora,
        item: items[i],
        tipo: "flora",
        figuraFallback: "icosahedron",
      });
      contenedor.appendChild(pedestal);
    }
  }

  /* ---------------------------------------------------------------- */
  /* 5. Zona Fauna                                                      */
  /* ---------------------------------------------------------------- */

  async function construirFauna(items, zInicio) {
    if (!items || !items.length) return;
    const contenedor = document.getElementById("zona-fauna");
    reservarZona("fauna", items.length * 8 + 6);

    const rotulo = crearRotuloZona("ZONA FAUNA", zInicio + 4);
    contenedor.appendChild(rotulo);

    for (let i = 0; i < items.length; i++) {
      const lado = i % 2 === 0 ? 1 : -1;
      const pedestal = await crearPedestal({
        x: lado * 2.6,
        z: zInicio - i * 8,
        color: PALETA.fauna,
        item: items[i],
        tipo: "fauna",
        figuraFallback: "sphere",
      });
      contenedor.appendChild(pedestal);
    }
  }

  function crearRotuloZona(texto, z) {
    const rotulo = crearEntidad({
      geometry: "primitive: plane; width: 3.4; height: 0.7",
      position: `0 3 ${z}`,
      rotation: "0 0 0",
      material: "color: #14201A; shader: flat; opacity: 0.8",
    });
    const label = crearEntidad({
      text: `value: ${texto}; align: center; color: #C9A227; width: 5; letterSpacing: 2`,
      position: "0 0 0.01",
    });
    rotulo.appendChild(label);
    return rotulo;
  }

  /* ---------------------------------------------------------------- */
  /* 6. Zona Historia (galería)                                         */
  /* ---------------------------------------------------------------- */

  async function construirHistoria(items, zInicio) {
    if (!items || !items.length) return;
    const contenedor = document.getElementById("zona-historia");
    reservarZona("historia", items.length * 7 + 6);

    contenedor.appendChild(crearRotuloZona("ZONA HISTORIA", zInicio + 3.5));

    for (let i = 0; i < items.length; i++) {
      const lado = i % 2 === 0 ? -1 : 1;
      const z = zInicio - i * 7;
      const panel = crearEntidad({ position: `${lado * 3.4} 1.7 ${z}`, rotation: `0 ${lado * -35} 0` });

      const marco = crearEntidad({
        geometry: "primitive: plane; width: 1.9; height: 1.5",
        material: `color: ${PALETA.historia}; shader: flat`,
        shadow: "cast: true",
      });
      panel.appendChild(marco);

      const hayImagen = await probarImagen(items[i].imagen);
      if (hayImagen) {
        const imagen = crearEntidad({
          geometry: "primitive: plane; width: 1.6; height: 1.1",
          position: "0 0.12 0.01",
          material: `src: ${items[i].imagen}; shader: flat`,
        });
        panel.appendChild(imagen);
      }

      const titulo = crearEntidad({
        text: `value: ${items[i].titulo || ""}\\n${items[i].fecha || ""}; align: center; color: #F5F1E8; width: 2.6; wrapCount: 26`,
        position: "0 -0.55 0.01",
      });
      panel.appendChild(titulo);

      marcarInteractivo(panel, Object.assign({ categoria: "Historia" }, items[i]));
      contenedor.appendChild(panel);
    }
  }

  /* ---------------------------------------------------------------- */
  /* 7. Zona Datos Curiosos (cuadros de museo)                          */
  /* ---------------------------------------------------------------- */

  async function construirDatos(items, zInicio) {
    if (!items || !items.length) return;
    const contenedor = document.getElementById("zona-datos");
    reservarZona("datos", items.length * 6 + 6);

    contenedor.appendChild(crearRotuloZona("DATOS CURIOSOS", zInicio + 3));

    for (let i = 0; i < items.length; i++) {
      const lado = i % 2 === 0 ? -1 : 1;
      const z = zInicio - i * 6;
      const cuadro = crearEntidad({ position: `${lado * 3.2} 1.75 ${z}`, rotation: `0 ${lado * -32} 0` });

      const marcoExterior = crearEntidad({
        geometry: "primitive: box; width: 1.7; height: 1.3; depth: 0.06",
        material: "color: #C9A227; shader: standard; metalness: 0.4; roughness: 0.5",
      });
      cuadro.appendChild(marcoExterior);

      const hayImagen = await probarImagen(items[i].imagen);
      const lienzo = crearEntidad({
        geometry: "primitive: plane; width: 1.5; height: 1.1",
        position: "0 0 0.04",
        material: hayImagen
          ? `src: ${items[i].imagen}; shader: flat`
          : `color: ${PALETA.datos}; shader: flat`,
      });
      cuadro.appendChild(lienzo);

      const foco = crearEntidad({
        light: "type: spot; color: #FFF3D6; intensity: 0.6; angle: 35; penumbra: 0.4",
        position: "0 1.1 0.6",
        rotation: "-55 0 0",
      });
      cuadro.appendChild(foco);

      const titulo = crearEntidad({
        text: `value: ${items[i].titulo}; align: center; color: #F5F1E8; width: 2.4; wrapCount: 24`,
        position: "0 -0.78 0.04",
      });
      cuadro.appendChild(titulo);

      marcarInteractivo(cuadro, Object.assign({ categoria: "Dato curioso" }, items[i]));
      contenedor.appendChild(cuadro);
    }
  }

  /* ---------------------------------------------------------------- */
  /* 8. Zona Video (auditorio)                                          */
  /* ---------------------------------------------------------------- */

  let videoEl = null;

  async function construirVideo(videos, zInicio) {
    const contenedor = document.getElementById("zona-video");
    const largo = 24;
    reservarZona("video", largo);
    contenedor.appendChild(crearRotuloZona("SALA AUDIOVISUAL", zInicio + 3));

    const zFondo = zInicio - largo + 4;
    const zEntrada = zInicio + 4;

    // Paredes simples del auditorio
    const paredFondo = crearEntidad({
      geometry: "primitive: plane; width: 12; height: 6",
      position: `0 3 ${zFondo - 0.4}`,
      material: "color: #1B1712; shader: flat",
    });
    contenedor.appendChild(paredFondo);

    [-6, 6].forEach((x) => {
      const pared = crearEntidad({
        geometry: `primitive: plane; width: ${largo}; height: 6`,
        position: `${x} 3 ${(zFondo + zEntrada) / 2}`,
        rotation: `0 ${x < 0 ? 90 : -90} 0`,
        material: "color: #211C16; shader: flat",
      });
      contenedor.appendChild(pared);
    });

    // Bancas
    for (let z = zEntrada - 3; z > zFondo + 5; z -= 2.2) {
      const banca = crearEntidad({
        geometry: "primitive: box; width: 6; height: 0.5; depth: 0.6",
        position: `0 0.25 ${z}`,
        material: "color: #4B3A28; shader: standard",
        shadow: "cast: true; receive: true",
      });
      contenedor.appendChild(banca);
    }

    // Iluminación tenue
    const luzTenue = crearEntidad({
      light: "type: point; color: #8C6A3F; intensity: 0.35; distance: 20",
      position: `0 4 ${(zFondo + zEntrada) / 2}`,
    });
    contenedor.appendChild(luzTenue);

    const videoData = videos && videos.length ? videos[0] : null;
    const marcoPantalla = crearEntidad({
      geometry: "primitive: plane; width: 7.2; height: 4.2",
      position: `0 3 ${zFondo + 0.05}`,
      material: "color: #0A0A0A; shader: flat",
    });
    contenedor.appendChild(marcoPantalla);

    if (videoData && videoData.archivo) {
      videoEl = document.createElement("video");
      videoEl.id = "video-malqui";
      videoEl.src = videoData.archivo;
      videoEl.setAttribute("crossorigin", "anonymous");
      videoEl.setAttribute("playsinline", "");
      videoEl.loop = true;
      videoEl.muted = false;
      document.querySelector("a-assets").appendChild(videoEl);

      const pantalla = crearEntidad({
        geometry: "primitive: plane; width: 6.8; height: 3.8",
        position: `0 0 0.05`,
      });
      pantalla.setAttribute("material", `shader: flat; src: #video-malqui`);
      marcoPantalla.appendChild(pantalla);

      videoEl.addEventListener("error", () => {
        pantalla.setAttribute("material", `color: ${PALETA.video}; shader: flat`);
        const aviso = crearEntidad({
          text: `value: Video no disponible\\n(${videoData.titulo}); align: center; color: #F5F1E8; width: 4; wrapCount: 26`,
          position: "0 0 0.06",
        });
        pantalla.appendChild(aviso);
      });

      videoEl.addEventListener("canplay", () => {
        videoEl.play().catch(() => {});
      });

      document.getElementById("btn-video-play").addEventListener("click", () => videoEl.play());
      document.getElementById("btn-video-pause").addEventListener("click", () => videoEl.pause());
    } else {
      const aviso = crearEntidad({
        text: "value: Video no configurado; align: center; color: #F5F1E8; width: 4",
        position: "0 0 0.06",
      });
      marcoPantalla.appendChild(aviso);
    }
  }

  /* ---------------------------------------------------------------- */
  /* 9. Zona Modelo 3D                                                  */
  /* ---------------------------------------------------------------- */

  async function construirModelo(modelos, zInicio) {
    const contenedor = document.getElementById("zona-modelo");
    reservarZona("modelo", 14);
    contenedor.appendChild(crearRotuloZona("MODELO 3D", zInicio + 3));

    const modelo = modelos && modelos.length ? modelos[0] : null;
    const z = zInicio - 6;

    const plataforma = crearEntidad({
      geometry: "primitive: cylinder; radius: 2; height: 0.4",
      position: `0 0.2 ${z}`,
      material: "color: #4A5D45; shader: standard; roughness: 0.6",
      shadow: "cast: true; receive: true",
    });
    contenedor.appendChild(plataforma);

    const luz = crearEntidad({
      light: "type: point; color: #FFF3D6; intensity: 0.9; distance: 10",
      position: `0 3.5 ${z}`,
    });
    contenedor.appendChild(luz);

    const giroSeg = modelo && modelo.velocidad_rotacion ? modelo.velocidad_rotacion : 10;
    const grupoGiro = crearEntidad({
      position: `0 0.5 ${z}`,
      animation__rotar: `property: rotation; to: 0 360 0; loop: true; dur: ${giroSeg * 1000}; easing: linear`,
    });
    contenedor.appendChild(grupoGiro);

    if (modelo && modelo.archivo_glb) {
      const hayModelo = await probarArchivo(modelo.archivo_glb);
      if (hayModelo) {
        const gltf = crearEntidad({
          "gltf-model": modelo.archivo_glb,
          scale: `${modelo.escala} ${modelo.escala} ${modelo.escala}`,
          shadow: "cast: true",
        });
        grupoGiro.appendChild(gltf);
        marcarInteractivo(grupoGiro, Object.assign({ categoria: "Modelo 3D" }, modelo));
        return;
      }
    }

    // Fallback: figura geométrica de respaldo
    const figura = crearEntidad({
      geometry: "primitive: octahedron; radius: 1",
      material: "color: #C9A227; shader: standard; metalness: 0.3; roughness: 0.4",
      shadow: "cast: true",
    });
    grupoGiro.appendChild(figura);
    marcarInteractivo(grupoGiro, Object.assign({ categoria: "Modelo 3D" }, modelo || { nombre: "Modelo 3D" }));
  }

  function probarArchivo(url) {
    return fetch(url, { method: "HEAD" }).then((r) => r.ok).catch(() => false);
  }

  /* ---------------------------------------------------------------- */
  /* 10. Puntos turísticos (paneles flotantes a lo largo del sendero)   */
  /* ---------------------------------------------------------------- */

  async function construirPuntos(items) {
    if (!items || !items.length) return;
    const contenedor = document.getElementById("zona-puntos");
    for (const item of items) {
      const panel = crearEntidad({
        position: `${item.posicion.x} ${item.posicion.y} ${item.posicion.z}`,
        animation__fade: "property: material.opacity; from: 0; to: 0.92; dur: 900",
      });
      const fondo = crearEntidad({
        geometry: "primitive: plane; width: 2.1; height: 0.9",
        material: `color: ${PALETA.punto}; shader: flat; opacity: 0.92; transparent: true`,
      });
      const texto = crearEntidad({
        text: `value: ${item.titulo}; align: center; color: #14201A; width: 3; wrapCount: 24`,
        position: "0 0 0.01",
      });
      fondo.appendChild(texto);
      panel.appendChild(fondo);
      marcarInteractivo(panel, Object.assign({ categoria: "Punto turístico" }, item));
      contenedor.appendChild(panel);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Indicador de zona (según posición de la cámara)                    */
  /* ---------------------------------------------------------------- */

  function iniciarIndicadorZona() {
    const indicador = document.getElementById("indicador-zona");
    let zonaActual = null;
    setInterval(() => {
      const camara = document.getElementById("camara");
      if (!camara || !camara.object3D) return;
      const zMundo = camara.object3D.getWorldPosition(new THREE.Vector3()).z;
      let encontrada = null;
      for (const [nombre, rango] of Object.entries(limitesZona)) {
        if (zMundo <= rango.inicio && zMundo >= rango.fin) {
          encontrada = nombre;
          break;
        }
      }
      if (encontrada !== zonaActual) {
        zonaActual = encontrada;
        if (encontrada) {
          indicador.textContent = encontrada.toUpperCase();
          indicador.classList.add("visible");
        } else {
          indicador.classList.remove("visible");
        }
      }
    }, 500);
  }

  /* ---------------------------------------------------------------- */
  /* Arranque general                                                   */
  /* ---------------------------------------------------------------- */

  async function iniciarRecorrido() {
    const panelCarga = document.getElementById("panel-carga");

    construirArco();
    construirSendero(200);

    const [flora, fauna, historia, datos, videos, modelos, puntos] = await Promise.all([
      obtenerJSON(API.flora),
      obtenerJSON(API.fauna),
      obtenerJSON(API.historia),
      obtenerJSON(API.datos),
      obtenerJSON(API.videos),
      obtenerJSON(API.modelos),
      obtenerJSON(API.puntos),
    ]);

    await construirFlora(flora ? flora.flora : []);
    const zFauna = zCursor - 6;
    await construirFauna(fauna ? fauna.fauna : [], zFauna);
    const zHistoria = zCursor - 6;
    await construirHistoria(historia ? historia.historia : [], zHistoria);
    const zDatos = zCursor - 6;
    await construirDatos(datos ? datos.datos : [], zDatos);
    const zVideo = zCursor - 8;
    await construirVideo(videos ? videos.videos : [], zVideo);
    const zModelo = zCursor - 6;
    await construirModelo(modelos ? modelos.modelos : [], zModelo);
    await construirPuntos(puntos ? puntos.puntos : []);

    panelCarga.classList.add("oculto");
    iniciarIndicadorZona();
  }

  /* ---------------------------------------------------------------- */
  /* Pantalla de bienvenida                                             */
  /* ---------------------------------------------------------------- */

  function iniciarBienvenida() {
    const pantalla = document.getElementById("pantalla-bienvenida");
    const velo = document.getElementById("velo-transicion");
    const btn = document.getElementById("btn-ingresar");
    const audio = document.getElementById("audio-ambiental");

    btn.addEventListener("click", () => {
      velo.classList.add("activo");
      setTimeout(() => {
        pantalla.classList.add("oculto");
        if (audio) {
          audio.volume = 0.35;
          audio.play().catch(() => {});
        }
        if (escena.hasLoaded) {
          escena.components["vr-mode-ui"] && null;
        }
        setTimeout(() => velo.classList.remove("activo"), 200);
      }, 600);
    });
  }

  /* ---------------------------------------------------------------- */

  document.addEventListener("DOMContentLoaded", () => {
    iniciarBienvenida();
    if (escena.hasLoaded) {
      iniciarRecorrido();
    } else {
      escena.addEventListener("loaded", iniciarRecorrido);
    }
  });
})();
