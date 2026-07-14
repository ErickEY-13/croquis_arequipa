const fs = require('fs');

async function getWikiImage(query) {
  try {
    // 1. Search for the page title
    const searchUrl = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + ' Arequipa')}&utf8=&format=json&srlimit=1`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    
    if (!searchData.query || !searchData.query.search || searchData.query.search.length === 0) {
      return null;
    }
    
    const title = searchData.query.search[0].title;
    
    // 2. Get the main image of that page
    const imgUrl = `https://es.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=1000`;
    const imgRes = await fetch(imgUrl);
    const imgData = await imgRes.json();
    
    const pages = imgData.query.pages;
    const pageId = Object.keys(pages)[0];
    
    if (pages[pageId].thumbnail && pages[pageId].thumbnail.source) {
      return pages[pageId].thumbnail.source;
    }
    return null;
  } catch (e) {
    console.error("Error fetching for", query, e.message);
    return null;
  }
}

async function run() {
  const file = 'lugares_arequipa.json';
  const lugares = JSON.parse(fs.readFileSync(file, 'utf8'));
  let updated = 0;
  
  for (let l of lugares) {
    if (!l.imagen && (!l.imagenes || l.imagenes.length === 0)) {
      console.log(`Buscando foto para: ${l.nombre}...`);
      const img = await getWikiImage(l.nombre);
      if (img) {
        console.log(`  -> Encontrada: ${img}`);
        l.imagen = img;
        updated++;
      } else {
        console.log(`  -> No se encontró foto en Wikipedia.`);
      }
      // Pequeña pausa para no saturar la API
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  if (updated > 0) {
    fs.writeFileSync(file, JSON.stringify(lugares, null, 2), 'utf8');
    console.log(`\n¡Listo! Se agregaron ${updated} fotos.`);
  } else {
    console.log('\nNo se encontraron fotos nuevas.');
  }
}

run();
