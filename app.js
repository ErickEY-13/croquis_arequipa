/* ═══════════════════════════════════════════════════════
   AREQUIPA PARA TI — MINIMALIST APPLE-STYLE APP
   ═══════════════════════════════════════════════════════ */

// ── State ──
let lugares = [];
let map;
let markers = [];
let userLatLng = null;
let userMarker = null;
let activeFilters = {
  tipo: 'Todos',
  categoria: 'Todas'
};
let selectedPlace = null;
let currentRouteLine = null;

// ── Category → Lucide icon name mapping ──
const catIcon = {
  'Plaza':            'landmark',
  'Iglesia':          'church',
  'Museo':            'building-2',
  'Mirador':          'mountain',
  'Parque':           'trees',
  'Barrio Histórico': 'home',
  'Puente':           'arrow-left-right',
  'Calle':            'route',
  'Mercado':          'store',
  'Monasterio':       'building',
  'Centro Comercial': 'shopping-bag'
};

// Category → dot color (matching marker pins)
const catColor = {
  'Plaza':            '#ec4899',
  'Iglesia':          '#8b5cf6',
  'Museo':            '#f59e0b',
  'Mirador':          '#3b82f6',
  'Parque':           '#10b981',
  'Barrio Histórico': '#f97316',
  'Puente':           '#0ea5e9',
  'Calle':            '#eab308',
  'Mercado':          '#ef4444',
  'Monasterio':       '#a855f7',
  'Centro Comercial': '#f472b6'
};

// Category → Unsplash Image URL
const categoryImages = {
  'Plaza': 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=600&h=300&fit=crop',
  'Iglesia': 'https://images.unsplash.com/photo-1548625361-ec880b9afcd6?w=600&h=300&fit=crop',
  'Centro Comercial': 'https://images.unsplash.com/photo-1519567281799-7323861c8b36?w=600&h=300&fit=crop',
  'Mirador': 'https://images.unsplash.com/photo-1569429593458-18e388f615ee?w=600&h=300&fit=crop',
  'Parque': 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=600&h=300&fit=crop',
  'Museo': 'https://images.unsplash.com/photo-1518998053401-878c735c084e?w=600&h=300&fit=crop',
  'Barrio Histórico': 'https://images.unsplash.com/photo-1588614532662-720448fdb4e6?w=600&h=300&fit=crop',
  'Monasterio': 'https://images.unsplash.com/photo-1585544314038-a0d376981024?w=600&h=300&fit=crop',
  'Mercado': 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=600&h=300&fit=crop',
  'Puente': 'https://images.unsplash.com/photo-1513682121497-80211f36a790?w=600&h=300&fit=crop',
  'Calle': 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&h=300&fit=crop',
  'default': 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=600&h=300&fit=crop'
};

const catClass = {
  'Plaza':            'cat-plaza',
  'Iglesia':          'cat-iglesia',
  'Museo':            'cat-museo',
  'Mirador':          'cat-mirador',
  'Parque':           'cat-parque',
  'Barrio Histórico': 'cat-barrio',
  'Puente':           'cat-puente',
  'Calle':            'cat-calle',
  'Mercado':          'cat-mercado',
  'Monasterio':       'cat-monasterio',
  'Centro Comercial': 'cat-mall'
};

// ═══════════════════════════════════════════════
// SPLASH
// ═══════════════════════════════════════════════
function closeSplash() {
  const splash = document.getElementById('splash');
  splash.classList.add('hidden');
  setTimeout(() => splash.style.display = 'none', 700);
}

// ═══════════════════════════════════════════════
// MAP INIT
// ═══════════════════════════════════════════════
function initMap() {
  map = L.map('map', {
    center: [-16.398, -71.537],
    zoom: 14,
    zoomControl: true
  });

  // Light clean tile style (Apple Maps vibe)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);
}

// ═══════════════════════════════════════════════
// LOAD DATA
// ═══════════════════════════════════════════════
async function loadData() {
  try {
    const res = await fetch('lugares_arequipa.json');
    lugares = await res.json();
    initCategories();
    updateStats();
    renderMarkers();
    renderPlacesList();
    fetchWeather();
  } catch (err) {
    console.error('Error cargando datos:', err);
  }
}

// ═══════════════════════════════════════════════
// WEATHER
// ═══════════════════════════════════════════════
async function fetchWeather() {
  try {
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-16.3989&longitude=-71.5369&current=temperature_2m,weather_code');
    const data = await res.json();
    const temp = Math.round(data.current.temperature_2m);
    document.getElementById('weather-widget').textContent = `${temp}°C Arequipa`;
  } catch (err) {
    console.error('Error weather:', err);
  }
}

// ═══════════════════════════════════════════════
// MARKERS
// ═══════════════════════════════════════════════
function createCustomIcon(lugar) {
  const cat = lugar.categoria;
  const iconName = catIcon[cat] || 'map-pin';
  const cls = catClass[cat] || 'cat-default';

  // Generate SVG icon inline from Lucide
  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><use href="#lucide-placeholder"/></svg>`;

  return L.divIcon({
    className: '',
    html: `<div class="custom-marker ${cls}"><span class="marker-inner"><i data-lucide="${iconName}" style="width:14px;height:14px;color:#fff;"></i></span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34]
  });
}

function renderMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  const filtered = getFilteredPlaces();

  filtered.forEach(lugar => {
    const icon = createCustomIcon(lugar);
    const marker = L.marker([lugar.latitud, lugar.longitud], { icon }).addTo(map);

    const precio = lugar.precio === 0 ? 'Gratis' : `S/ ${lugar.precio}`;
    const mapsUrl = getMapsUrl(lugar);
    const popupHTML = `
      <div class="popup-inner">
        <h4>${lugar.nombre}</h4>
        <div class="popup-cat">${lugar.categoria} · ${precio}</div>
        <div class="popup-desc">${lugar.descripcion}</div>
        <a class="popup-link" href="${mapsUrl}" target="_blank" rel="noopener">Ver en Maps</a>
      </div>
    `;
    marker.bindPopup(popupHTML, { maxWidth: 260 });
    marker.on('click', () => showDetail(lugar));

    marker._lugarId = lugar.id;
    markers.push(marker);
  });

  // Re-render Lucide icons inside markers
  requestAnimationFrame(() => {
    if (window.lucide) lucide.createIcons();
  });

  document.getElementById('stat-visible').textContent = filtered.length;
}

// ═══════════════════════════════════════════════
// FILTERS
// ═══════════════════════════════════════════════
function getFilteredPlaces() {
  return lugares.filter(l => {
    const tipoOk = activeFilters.tipo === 'Todos' || activeFilters.tipo === 'todos' || l.tipo === activeFilters.tipo;
    const catOk = activeFilters.categoria === 'Todas' || activeFilters.categoria === 'todos' || l.categoria === activeFilters.categoria;
    return tipoOk && catOk;
  });
}

// ═══════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════
function initCategories() {
  const container = document.getElementById('categories-container');
  if (!container) return;
  const cats = new Set(lugares.map(l => l.categoria));
  const catArray = ['Todas', ...Array.from(cats)];
  
  container.innerHTML = catArray.map(c => `
    <button class="filter-pill ${c === 'Todas' ? 'active' : ''}" data-cat="${c}">
      ${c}
    </button>
  `).join('');

  container.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      container.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      e.currentTarget.classList.add('active');
      activeFilters.categoria = e.currentTarget.dataset.cat;
      
      // sync sidebar
      const sidebarPill = document.querySelector(`#filter-categoria .chip[data-filter="${e.currentTarget.dataset.cat}"]`);
      if (sidebarPill) {
        document.querySelectorAll('#filter-categoria .chip').forEach(c => c.classList.remove('active'));
        sidebarPill.classList.add('active');
      }

      renderMarkers();
      renderPlacesList();
    });
  });

  // Sidebar filters logic
  const sidebarCatContainer = document.getElementById('filter-categoria');
  if (sidebarCatContainer) {
    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'chip';
      btn.dataset.filter = cat;
      btn.textContent = cat;
      sidebarCatContainer.appendChild(btn);
    });

    sidebarCatContainer.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      sidebarCatContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilters.categoria = chip.dataset.filter;
      
      // sync top pills
      const topPill = document.querySelector(`.filter-pill[data-cat="${chip.dataset.filter === 'todos' ? 'Todas' : chip.dataset.filter}"]`);
      if (topPill) {
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        topPill.classList.add('active');
      }

      renderMarkers();
      renderPlacesList();
    });
  }

  const sidebarTipoContainer = document.getElementById('filter-tipo');
  if (sidebarTipoContainer) {
    sidebarTipoContainer.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      sidebarTipoContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilters.tipo = chip.dataset.filter;
      renderMarkers();
      renderPlacesList();
    });
  }
}

function updateStats() {
  document.getElementById('stat-total').textContent = lugares.length;
  document.getElementById('stat-gratis').textContent = lugares.filter(l => l.tipo === 'Gratis').length;
  document.getElementById('stat-paga').textContent = lugares.filter(l => l.tipo === 'Paga').length;
  document.getElementById('stat-visible').textContent = lugares.length;
}

// ═══════════════════════════════════════════════
// PLACES LIST
// ═══════════════════════════════════════════════
function renderPlacesList() {
  const list = document.getElementById('places-list');
  const filtered = getFilteredPlaces();
  document.getElementById('list-count').textContent = `(${filtered.length})`;

  list.innerHTML = filtered.map(l => `
    <div class="place-item" data-id="${l.id}">
      <span class="place-dot" style="background:${catColor[l.categoria] || '#a3a3a3'}"></span>
      <div class="place-info">
        <div class="place-name">${l.nombre}</div>
        <div class="place-cat">${l.categoria}</div>
      </div>
      <span class="place-tipo ${l.tipo === 'Gratis' ? 'gratis' : 'paga'}">
        ${l.tipo === 'Gratis' ? 'Gratis' : 'S/' + l.precio}
      </span>
    </div>
  `).join('');

  list.querySelectorAll('.place-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = parseInt(item.dataset.id);
      const lugar = lugares.find(l => l.id === id);
      if (lugar) {
        flyToPlace(lugar);
        showDetail(lugar);
        closeSidebar();
      }
    });
  });
}

// ═══════════════════════════════════════════════
// DETAIL CARD
// ═══════════════════════════════════════════════
function showDetail(lugar) {
  selectedPlace = lugar;
  const card = document.getElementById('detail-card');

  // Set image
  const imgEl = document.getElementById('detail-image');
  if (imgEl) {
    imgEl.src = categoryImages[lugar.categoria] || categoryImages['default'];
    imgEl.style.display = 'block';
  }

  const badge = document.getElementById('detail-badge');
  badge.textContent = lugar.categoria;
  badge.className = `detail-badge ${lugar.tipo === 'Gratis' ? 'gratis' : 'paga'}`;

  document.getElementById('detail-name').textContent = lugar.nombre;
  document.getElementById('detail-desc').textContent = lugar.descripcion;
  const status = getPlaceStatus(lugar.horario);
  let horarioHtml = lugar.horario;
  if (status.text) {
    horarioHtml = `<span class="${status.class}">${status.text}</span> <span style="opacity:0.6; font-size: 0.72rem; margin-left: 4px;">(${lugar.horario})</span>`;
  }
  document.getElementById('detail-horario').innerHTML = horarioHtml;
  document.getElementById('detail-precio').textContent =
    lugar.precio === 0 ? 'Entrada gratuita' : `S/ ${lugar.precio}`;

  const distBadge = document.getElementById('detail-dist-badge');
  if (userLatLng) {
    const dist = haversine(userLatLng.lat, userLatLng.lng, lugar.latitud, lugar.longitud);
    distBadge.innerHTML = `<i data-lucide="map-pin" style="width:14px;height:14px;color:var(--text-tertiary);"></i> ${formatDistance(dist)}`;
  } else {
    distBadge.innerHTML = '';
  }

  document.getElementById('detail-maps').href = getMapsUrl(lugar);
  document.getElementById('detail-directions').href = getDirectionsUrl(lugar);

  card.classList.add('active');

  // Re-init icons in card
  requestAnimationFrame(() => {
    if (window.lucide) lucide.createIcons({ nodes: [card] });
  });
}

function closeDetail() {
  document.getElementById('detail-card').classList.remove('active');
  selectedPlace = null;
  if (currentRouteLine) {
    map.removeLayer(currentRouteLine);
    currentRouteLine = null;
  }
}

// ═══════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════
function initSearch() {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();

    // ── Easter Egg ──
    if (q === 'yamileth') {
      document.getElementById('love-modal').classList.add('active');
      input.value = '';
      results.classList.remove('active');
      requestAnimationFrame(() => {
        if (window.lucide) lucide.createIcons();
      });
      return;
    }

    if (q.length < 2) {
      results.classList.remove('active');
      return;
    }

    const matches = lugares.filter(l =>
      l.nombre.toLowerCase().includes(q) ||
      l.categoria.toLowerCase().includes(q) ||
      l.descripcion.toLowerCase().includes(q)
    ).slice(0, 8);

    if (matches.length === 0) {
      results.classList.remove('active');
      return;
    }

    results.innerHTML = matches.map(l => `
      <div class="search-result-item" data-id="${l.id}">
        <span class="sr-dot" style="background:${catColor[l.categoria] || '#a3a3a3'}"></span>
        <div class="sr-info">
          <div class="sr-name">${l.nombre}</div>
          <div class="sr-cat">${l.categoria} · ${l.tipo}</div>
        </div>
      </div>
    `).join('');

    results.classList.add('active');

    results.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = parseInt(item.dataset.id);
        const lugar = lugares.find(l => l.id === id);
        if (lugar) {
          flyToPlace(lugar);
          showDetail(lugar);
          input.value = '';
          results.classList.remove('active');
        }
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !results.contains(e.target)) {
      results.classList.remove('active');
    }
  });

  document.getElementById('btn-close-love')?.addEventListener('click', () => {
    document.getElementById('love-modal').classList.remove('active');
  });
}

// ═══════════════════════════════════════════════
// GEOLOCATION
// ═══════════════════════════════════════════════
function initGeolocation() {
  document.getElementById('btn-locate').addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        userLatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        if (userMarker) map.removeLayer(userMarker);
        const userIcon = L.divIcon({
          className: '',
          html: '<div class="user-marker"></div>',
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        });
        userMarker = L.marker([userLatLng.lat, userLatLng.lng], { icon: userIcon, zIndexOffset: 1000 })
          .addTo(map)
          .bindPopup('<div class="popup-inner"><h4>Tu ubicación</h4></div>');

        map.setView([userLatLng.lat, userLatLng.lng], 15, { animate: true });
        showNearestPlaces();
      },
      () => {
        alert('No pudimos obtener tu ubicación. Revisa los permisos del navegador.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

function showNearestPlaces() {
  if (!userLatLng) return;

  const filtered = getFilteredPlaces();
  const withDist = filtered.map(l => ({
    ...l,
    distancia: haversine(userLatLng.lat, userLatLng.lng, l.latitud, l.longitud)
  })).sort((a, b) => a.distancia - b.distancia);

  const top10 = withDist.slice(0, 10);

  const panel = document.getElementById('nearest-panel');
  const list = document.getElementById('nearest-list');

  const closest = top10[0];
  const others = top10.slice(1);

  const closestHtml = `
    <div class="nearest-item nearest-highlight" data-id="${closest.id}">
      <div class="nh-badge">¡Tu mejor opción!</div>
      <img src="${categoryImages[closest.categoria] || categoryImages['default']}" class="nh-img" alt="Lugar sugerido" />
      <div class="nh-info">
        <h4 class="nh-name">${closest.nombre}</h4>
        <p class="nh-dist">Está a solo <strong>${formatDistance(closest.distancia)}</strong> de ti</p>
      </div>
      <button class="btn-nh-go">Ver detalle <i data-lucide="arrow-right" style="width:14px;height:14px;"></i></button>
    </div>
  `;

  const othersHtml = others.map((l, i) => {
    let rankClass = 'rank-other';
    if (i === 0) rankClass = 'rank-2';
    else if (i === 1) rankClass = 'rank-3';

    return `
      <div class="nearest-item" data-id="${l.id}">
        <div class="nearest-rank ${rankClass}">${i + 2}</div>
        <span class="nearest-dot" style="background:${catColor[l.categoria] || '#a3a3a3'}"></span>
        <div class="nearest-info">
          <div class="nearest-name">${l.nombre}</div>
          <div class="nearest-dist">${formatDistance(l.distancia)} · ${l.categoria}</div>
        </div>
      </div>
    `;
  }).join('');

  list.innerHTML = closestHtml + '<div class="nearest-others-title">Otras opciones cercanas</div>' + othersHtml;

  panel.classList.add('active');

  // Re-init icons
  requestAnimationFrame(() => {
    if (window.lucide) lucide.createIcons({ nodes: [panel] });
  });

  list.querySelectorAll('.nearest-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = parseInt(item.dataset.id);
      const lugar = lugares.find(l => l.id === id);
      if (lugar) {
        flyToPlace(lugar);
        showDetail(lugar);
      }
    });
  });
}

function closeNearest() {
  document.getElementById('nearest-panel').classList.remove('active');
}

// ═══════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════
function initSidebar() {
  document.getElementById('btn-sidebar').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebar-overlay').classList.add('active');
  });

  document.getElementById('btn-close-sidebar').addEventListener('click', closeSidebar);
  document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('active');
}

// ═══════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) { return deg * (Math.PI / 180); }

function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function getMapsUrl(lugar) {
  return `https://www.google.com/maps/search/?api=1&query=${lugar.latitud},${lugar.longitud}`;
}

function getDirectionsUrl(lugar) {
  if (userLatLng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${userLatLng.lat},${userLatLng.lng}&destination=${lugar.latitud},${lugar.longitud}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${lugar.latitud},${lugar.longitud}`;
}

function flyToPlace(lugar) {
  map.flyTo([lugar.latitud, lugar.longitud], 16, {
    animate: true,
    duration: 1
  });

  const marker = markers.find(m => m._lugarId === lugar.id);
  if (marker) {
    marker.openPopup();
    const el = marker.getElement();
    if (el) {
      const markerDiv = el.querySelector('.custom-marker');
      if (markerDiv) {
        markerDiv.classList.add('highlighted');
        setTimeout(() => markerDiv.classList.remove('highlighted'), 600);
      }
    }
  }
}

function getPlaceStatus(horario) {
  if (horario.toLowerCase().includes('24 horas')) {
    return { text: 'Abierto 24h', class: 'status-open' };
  }

  const parts = horario.split(' - ');
  if (parts.length !== 2) return { text: '', class: '' };

  const now = new Date();
  const currentTotalMins = now.getHours() * 60 + now.getMinutes();

  function timeToMins(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  const startMins = timeToMins(parts[0]);
  const endMins = timeToMins(parts[1]);

  if (currentTotalMins >= startMins && currentTotalMins < endMins) {
    if (endMins - currentTotalMins <= 60) {
      return { text: 'Cierra pronto', class: 'status-closing' };
    }
    return { text: 'Abierto', class: 'status-open' };
  }

  return { text: 'Cerrado', class: 'status-closed' };
}

// ═══════════════════════════════════════════════
// ROUTING (OSRM)
// ═══════════════════════════════════════════════
async function drawRouteOnMap() {
  if (!userLatLng) {
    alert("Por favor activa tu ubicación con el botón de la esquina superior derecha.");
    return;
  }
  if (!selectedPlace) return;

  if (currentRouteLine) {
    map.removeLayer(currentRouteLine);
    currentRouteLine = null;
  }

  const btn = document.getElementById('btn-draw-route');
  const originalHtml = btn.innerHTML;
  btn.innerHTML = `<i data-lucide="loader" class="btn-dir-icon spin"></i><span>Calculando...</span>`;
  if (window.lucide) lucide.createIcons({ nodes: [btn] });

  try {
    const start = `${userLatLng.lng},${userLatLng.lat}`;
    const end = `${selectedPlace.longitud},${selectedPlace.latitud}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?geometries=geojson&overview=full`;
    
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.routes && data.routes.length > 0) {
      const geojson = data.routes[0].geometry;
      currentRouteLine = L.geoJSON(geojson, {
        style: {
          color: '#ec4899',
          weight: 5,
          opacity: 0.9,
          dashArray: '10, 10',
          className: 'route-line-anim'
        }
      }).addTo(map);
      
      map.fitBounds(currentRouteLine.getBounds(), { padding: [50, 50] });
    }
  } catch (err) {
    console.error("Error drawing route", err);
  } finally {
    btn.innerHTML = originalHtml;
    if (window.lucide) lucide.createIcons({ nodes: [btn] });
  }
}

// ═══════════════════════════════════════════════
// CLOSE BUTTONS & ROUTE BUTTON
// ═══════════════════════════════════════════════
function initCloseButtons() {
  document.getElementById('btn-close-detail').addEventListener('click', closeDetail);
  document.getElementById('btn-close-nearest').addEventListener('click', closeNearest);
  document.getElementById('btn-draw-route').addEventListener('click', drawRouteOnMap);
}

// ═══════════════════════════════════════════════
// WEATHER
// ═══════════════════════════════════════════════
async function fetchWeather() {
  try {
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-16.4090&longitude=-71.5375&current_weather=true');
    const data = await res.json();
    if (data.current_weather) {
      const temp = Math.round(data.current_weather.temperature);
      document.getElementById('weather-temp').textContent = `${temp}°C`;
      document.getElementById('weather-widget').classList.remove('hidden');
    }
  } catch(e) {
    console.error('Clima error:', e);
  }
}

// ═══════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) lucide.createIcons();

  initMap();
  loadData().then(() => {
    initCategories();
  });
  initSearch();
  initGeolocation();
  initSidebar();
  initCloseButtons();
  fetchWeather();
});
