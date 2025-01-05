// generate.js
const axios = require('axios');
const fs = require('fs');

// Reemplaza con la URL válida
const FEEDS = {
  Chile: 'https://feeds.datafeedwatch.com/73476/e4deb463c52bd893f5b5211ade62b6a4b0030010.json',
};

// ---- NUEVO: Función para formatear en pesos chilenos.
function formatearPrecioChile(valor) {
  // Si no viene nada, devuelvo string vacío
  if (!valor) return '';

  // Convierto a número
  const numero = parseFloat(valor);
  if (isNaN(numero)) return '';

  // Formateo usando Intl.NumberFormat en locale 'es-CL', currency 'CLP'
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0, // Sin decimales
    maximumFractionDigits: 0, // Sin decimales
  }).format(numero);
}

async function obtenerProductosDeFeed(url, pais) {
  try {
    const response = await axios.get(url);
    const data = response.data;

    if (!data.products || !Array.isArray(data.products)) {
      console.log(`No se encontraron productos en el feed de ${pais}.`);
      return [];
    }

    const productosExtraidos = data.products.map((product) => {
      return {
        Nombre: product['Name'] || '',
        Descripción: product['Short Description'] || '',
        SKU: product['Part Number'] || '',
        Modelo: product['Model'] || '',
        'Precio Oferta': formatearPrecioChile(product['Offer Price']),
        'Precio Normal': formatearPrecioChile(product['Regular Price']),
        ImageURL:
          product['Main Image URL'] ||
          product['Image URL'] ||
          '',
        ProductURL: product['Product URL'] || '',
        Country: pais.toUpperCase(),
      };
    });

    return productosExtraidos;
  } catch (error) {
    console.error(`Error al obtener el feed desde ${url}: ${error.message}`);
    return [];
  }
}

async function main() {
  let todosLosProductos = [];

  for (const [pais, url] of Object.entries(FEEDS)) {
    console.log(`Procesando feed de ${pais}...`);
    const productos = await obtenerProductosDeFeed(url, pais);
    todosLosProductos = todosLosProductos.concat(productos);
  }

  fs.writeFileSync('datos.json', JSON.stringify(todosLosProductos, null, 2), 'utf-8');
  console.log('datos.json generado correctamente!');
}

main();
