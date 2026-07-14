# Arequipa Para Ti ❤️🌋

**Arequipa Para Ti** es un croquis interactivo web diseñado para mostrar los lugares turísticos, históricos y más bonitos de la Ciudad Blanca de Arequipa, Perú. Creado con un diseño moderno, minimalista y romántico (estilo *Pink Apple*), este proyecto busca ofrecer una experiencia de usuario única y fluida.

## 🚀 Características Principales

*   **Mapa Interactivo**: Explora Arequipa a través de un mapa dinámico impulsado por [Leaflet](https://leafletjs.com/).
*   **Filtros Inteligentes**: Encuentra rápidamente lugares gratuitos o de pago, y filtra por categorías (plazas, iglesias, museos, miradores, etc.).
*   **Buscador Integrado**: Busca lugares específicos por nombre al instante.
*   **Tarjetas de Detalles**: Información completa de cada lugar, incluyendo:
    *   Horarios y precios.
    *   Distancia desde tu ubicación (con geolocalización).
    *   Botones para "Cómo llegar" y "Ruta en mapa".
    *   Sección *¿Sabías que...?* con historia y datos curiosos.
*   **Lugares Cercanos**: Descubre qué otros sitios de interés están cerca del lugar que estás viendo.
*   **Diseño Responsivo y *Premium***: Interfaz cuidadosamente diseñada con micro-interacciones, modo *glassmorphism* y animaciones suaves.

## 🛠️ Tecnologías Utilizadas

*   **HTML5** y **CSS3** (Vanilla, con variables CSS y flexbox/grid).
*   **JavaScript (ES6+)** para la lógica de la aplicación y la interactividad.
*   **Leaflet.js** para la renderización del mapa y marcadores personalizados.
*   **Lucide Icons** para una iconografía limpia y consistente.

## 📂 Estructura del Proyecto

```text
├── index.html                # Estructura principal de la aplicación
├── styles.css                # Hoja de estilos con variables y diseño responsivo
├── app.js                    # Lógica de la aplicación, mapas y eventos
├── lugares_arequipa.json     # Base de datos local con los lugares turísticos
└── images/                   # Carpeta de recursos e imágenes locales
    ├── 1.jpg
    └── 2.jpg
```

## 💻 Instalación y Uso Local

1.  **Clona el repositorio**:
    ```bash
    git clone https://github.com/ErickEY-13/croquis_arequipa.git
    cd croquis_arequipa
    ```
2.  **Inicia un servidor local**:
    Dado que el proyecto utiliza `fetch` para cargar el archivo `lugares_arequipa.json`, necesitas correrlo a través de un servidor HTTP local (abrir el `index.html` directamente en el navegador puede causar errores de CORS).
    *   Usando Python: `python -m http.server 8000`
    *   Usando Node (http-server): `npx http-server`
3.  **Abre en tu navegador**:
    Visita `http://localhost:8000` (o el puerto que te indique tu servidor local).

## 💖 Dedicatoria

Este proyecto fue estructurado y diseñado con mucho amor y cuidado en los detalles. Incluye "easter eggs" y detalles especiales pensados para ofrecer una experiencia única.
