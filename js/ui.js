/**
 * Funciones para manejar la interfaz y mostrar los datos
 * Todo lo visual va aquí para mantenerlo separado de la lógica
 */

/**
 * Muestra todas las fichas disponibles en el dropdown
 * Con contador de aprendices por ficha
 */

import { saveFicha, setSelectedFicha, saveSearchHistory } from "./storage.js";

// ===== REFERENCIAS A ELEMENTOS DOM =====
const userDisplay = document.getElementById("user-display");
const tableBody = document.getElementById("table-body");

// ===== FUNCIONES DE RENDERIZADO DE USUARIO =====

/**
 * Renderiza la información del usuario en la interfaz
 * @param {string|Object} usuario - Nombre de usuario o objeto con datos del usuario
 */
export function renderUser(usuario) {
  if (!userDisplay) {
    console.error('Elemento user-display no encontrado');
    return;
  }
  
  // Manejar tanto string como objeto de usuario
  const username = typeof usuario === 'string' ? usuario : usuario?.username;
  const loginTime = typeof usuario === 'object' ? usuario?.loginTime : null;
  
  if (loginTime) {
    const fecha = new Date(loginTime).toLocaleDateString();
    const hora = new Date(loginTime).toLocaleTimeString();
    userDisplay.innerHTML = `
      <div>
        <span class="font-semibold">${username}</span>
        <br>
        <small class="text-green-200">Sesión: ${fecha} ${hora}</small>
      </div>
    `;
  } else {
    userDisplay.textContent = username || 'Usuario';
  }
}

// ===== FUNCIONES DE RENDERIZADO DE FICHAS =====

/**
 * Renderiza las fichas en el selector dropdown
 * @param {Array} aprendices - Array de aprendices
 * @param {HTMLElement} selectElement - Elemento select del DOM
 */
export function renderFichas(aprendices, selectElement) {
  if (!selectElement) {
    console.error('Elemento select no proporcionado');
    return;
  }
  
  if (!Array.isArray(aprendices)) {
    console.error('Los datos de aprendices no son válidos');
    return;
  }
  
  console.log('🔍 Procesando aprendices para fichas...', aprendices.length);
  console.log('📋 Ejemplo de aprendiz:', aprendices[0]);
  
  // Obtener fichas únicas
  const fichasUnicas = obtenerFichasUnicas(aprendices);
  
  console.log('📊 Fichas únicas encontradas:', fichasUnicas.length);
  console.log('📝 Primera ficha:', fichasUnicas[0]);
  
  // Limpiar select y agregar opción por defecto
  selectElement.innerHTML = '<option value="">-- Seleccione una ficha --</option>';
  
  // Añadir cada ficha como opción
  fichasUnicas.forEach(ficha => {
    const option = document.createElement("option");
    option.value = ficha.codigo;
    
    // Mostrar código y programa si está disponible
    let textoOpcion = `Ficha ${ficha.codigo}`;
    if (ficha.programa && ficha.programa !== 'Sin programa') {
      textoOpcion += ` - ${ficha.programa}`;
    }
    textoOpcion += ` (${ficha.totalAprendices} aprendices)`;
    
    option.textContent = textoOpcion;
    option.dataset.programa = ficha.programa;
    option.dataset.nivel = ficha.nivel;
    selectElement.appendChild(option);
  });
  
  console.log(`✅ Renderizadas ${fichasUnicas.length} fichas en el selector`);
}

/**
 * Obtiene fichas únicas del array de aprendices
 * @param {Array} aprendices - Array de aprendices
 * @returns {Array} Array de fichas únicas
 */
function obtenerFichasUnicas(aprendices) {
  const fichasMap = new Map();
  
  aprendices.forEach(aprendiz => {
    // Buscar el código de ficha en ambos formatos
    const fichaId = aprendiz.codigo_ficha || aprendiz.FICHA;
    
    // Solo procesar si tiene código de ficha válido
    if (fichaId && fichaId !== 'undefined' && fichaId !== null) {
      if (!fichasMap.has(fichaId)) {
        fichasMap.set(fichaId, {
          codigo: fichaId,
          programa: aprendiz.programa || aprendiz.PROGRAMA || 'Sin programa',
          nivel: aprendiz.nivel_formacion || aprendiz.NIVEL_DE_FORMACION || 'Sin nivel',
          estado: aprendiz.estado_ficha || aprendiz.ESTADO_FICHA || 'Activo',
          totalAprendices: 0
        });
      }
      fichasMap.get(fichaId).totalAprendices++;
    }
  });
  
  return Array.from(fichasMap.values()).sort((a, b) => {
    // Convertir a string para comparar correctamente
    const codigoA = String(a.codigo);
    const codigoB = String(b.codigo);
    return codigoA.localeCompare(codigoB, undefined, { numeric: true });
  });
}

// ===== FUNCIONES DE RENDERIZADO DE TABLA =====

/**
 * Muestra los aprendices en la tabla
 * Con colores según el estado del aprendiz
 */
export function renderTable(aprendices, fichaId) {
  if (!tableBody) {
    console.error('Elemento table-body no encontrado');
    return;
  }
  
  // Limpiar tabla
  tableBody.innerHTML = "";
  
  if (!fichaId) {
    mostrarMensajeEnTabla("Seleccione una ficha para ver los aprendices");
    return;
  }
  
  if (!Array.isArray(aprendices)) {
    mostrarMensajeEnTabla("Error: Datos de aprendices no válidos");
    return;
  }
  
  // Filtrar aprendices por ficha - buscar en ambos formatos
  const aprendicesFicha = aprendices.filter(aprendiz => 
    String(aprendiz.codigo_ficha).trim() === String(fichaId).trim() ||
    String(aprendiz.FICHA).trim() === String(fichaId).trim()
  );
  
  if (aprendicesFicha.length === 0) {
    mostrarMensajeEnTabla("No se encontraron aprendices para esta ficha");
    return;
  }
  
  // Guardar información de la ficha en localStorage
  guardarInformacionFicha(aprendicesFicha[0]);
  
  // Guardar ficha seleccionada en sessionStorage
  setSelectedFicha(fichaId);
  
  // Renderizar cada aprendiz
  aprendicesFicha.forEach(aprendiz => {
    const fila = crearFilaAprendiz(aprendiz);
    tableBody.appendChild(fila);
  });
  
  // Mostrar estadísticas en consola
  mostrarEstadisticas(aprendicesFicha);
  
  console.log(`✅ Renderizados ${aprendicesFicha.length} aprendices de la ficha ${fichaId}`);
}

/**
 * Crea una fila de la tabla para un aprendiz
 * @param {Object} aprendiz - Datos del aprendiz
 * @returns {HTMLElement} Elemento tr con los datos del aprendiz
 */
function crearFilaAprendiz(aprendiz) {
  const tr = document.createElement("tr");
  tr.className = "border hover:bg-green-50 transition-colors";
  
  // Limpiar datos y manejar valores undefined/null - buscar en ambos formatos
  const documento = aprendiz.documento || aprendiz.DOCUMENTO || 'Sin documento';
  const nombre = aprendiz.nombre || aprendiz.NOMBRE || 'Sin nombre';
  const estado = aprendiz.estado_aprendiz || aprendiz.ESTADO_APRENDIZ || 'Sin estado';
  
  // Aplicar estilos especiales según el estado
  if (estado.includes("Retiro") || estado.includes("RETIRO")) {
    tr.classList.add("bg-red-100", "font-bold", "text-red-700");
  } else if (estado.includes("Cancelado") || estado.includes("CANCELADO")) {
    tr.classList.add("bg-orange-100", "text-orange-700");
  } else if (estado.includes("Formacion") || estado.includes("FORMACION") || estado.includes("formación")) {
    tr.classList.add("bg-green-100", "text-green-700");
  }
  
  tr.innerHTML = `
    <td class="px-4 py-2 border font-mono">${documento}</td>
    <td class="px-4 py-2 border">${nombre}</td>
    <td class="px-4 py-2 border">
      <span class="px-2 py-1 rounded text-sm ${getEstadoClasses(estado)}">
        ${estado}
      </span>
    </td>
  `;
  
  // Añadir tooltip con información adicional
  const programa = aprendiz.programa || aprendiz.PROGRAMA || 'Sin programa';
  tr.title = `Documento: ${documento}\nPrograma: ${programa}\nEstado: ${estado}`;
  
  return tr;
}

/**
 * Obtiene las clases CSS para el estado del aprendiz
 * @param {string} estado - Estado del aprendiz
 * @returns {string} Clases CSS
 */
function getEstadoClasses(estado) {
  const clases = {
    'Formacion': 'bg-green-200 text-green-800',
    'Retiro Voluntario': 'bg-red-200 text-red-800',
    'Cancelado': 'bg-orange-200 text-orange-800',
    'Aplazado': 'bg-yellow-200 text-yellow-800',
    'Trasladado': 'bg-blue-200 text-blue-800'
  };
  
  return clases[estado] || 'bg-gray-200 text-gray-800';
}

/**
 * Muestra un mensaje en la tabla cuando no hay datos
 * @param {string} mensaje - Mensaje a mostrar
 */
function mostrarMensajeEnTabla(mensaje) {
  tableBody.innerHTML = `
    <tr>
      <td colspan="3" class="px-4 py-8 text-center text-gray-500">
        <i class="fas fa-info-circle mr-2"></i>
        ${mensaje}
      </td>
    </tr>
  `;
}

/**
 * Guarda la información de la ficha en localStorage
 * @param {Object} aprendiz - Primer aprendiz de la ficha (para obtener datos de la ficha)
 */
function guardarInformacionFicha(aprendiz) {
  try {
    const fichaInfo = {
      codigo: aprendiz.codigo_ficha || aprendiz.FICHA,
      programa: aprendiz.programa || aprendiz.PROGRAMA || 'Sin programa',
      nivel: aprendiz.nivel_formacion || aprendiz.NIVEL_DE_FORMACION || 'Sin nivel',
      estado: aprendiz.estado_ficha || aprendiz.ESTADO_FICHA || 'Activo',
      jornadaFormacion: aprendiz.jornada_formacion || aprendiz.JORNADA_FORMACION || 'Sin jornada',
      fechaInicio: aprendiz.fecha_inicio_lectiva || aprendiz.FECHA_INICIO_LECTIVA || 'Sin fecha',
      fechaFin: aprendiz.fecha_fin_lectiva || aprendiz.FECHA_FIN_LECTIVA || 'Sin fecha'
    };
    
    console.log('💾 Guardando información de ficha:', fichaInfo);
    saveFicha(fichaInfo);
  } catch (error) {
    console.error('Error al guardar información de la ficha:', error);
  }
}

/**
 * Muestra estadísticas de la ficha en consola
 * @param {Array} aprendices - Aprendices de la ficha
 */
function mostrarEstadisticas(aprendices) {
  const estadisticas = {};
  
  aprendices.forEach(aprendiz => {
    const estado = aprendiz.estado_aprendiz || aprendiz.ESTADO_APRENDIZ || 'Sin estado';
    estadisticas[estado] = (estadisticas[estado] || 0) + 1;
  });
  
  console.log('📊 Estadísticas de la ficha:');
  console.table(estadisticas);
}

// ===== FUNCIONES DE BÚSQUEDA =====

/**
 * Renderiza los resultados de búsqueda
 * @param {Array} resultados - Aprendices que coinciden con la búsqueda
 * @param {string} termino - Término de búsqueda utilizado
 */
export function renderSearchResults(resultados, termino) {
  if (!tableBody) return;
  
  tableBody.innerHTML = "";
  
  if (!Array.isArray(resultados) || resultados.length === 0) {
    mostrarMensajeEnTabla(`No se encontraron resultados para "${termino}"`);
    return;
  }
  
  // Guardar búsqueda en historial
  saveSearchHistory(termino);
  
  // Renderizar resultados agrupados por ficha
  const resultadosPorFicha = agruparPorFicha(resultados);
  
  Object.keys(resultadosPorFicha).forEach(ficha => {
    // Añadir separador por ficha
    const separador = document.createElement("tr");
    separador.innerHTML = `
      <td colspan="3" class="px-4 py-2 bg-green-600 text-white font-bold">
        Ficha: ${ficha} (${resultadosPorFicha[ficha].length} resultado${resultadosPorFicha[ficha].length !== 1 ? 's' : ''})
      </td>
    `;
    tableBody.appendChild(separador);
    
    // Añadir aprendices de esta ficha
    resultadosPorFicha[ficha].forEach(aprendiz => {
      const fila = crearFilaAprendiz(aprendiz);
      tableBody.appendChild(fila);
    });
  });
  
  console.log(`🔍 Mostrados ${resultados.length} resultados para "${termino}"`);
}

/**
 * Agrupa aprendices por ficha
 * @param {Array} aprendices - Array de aprendices
 * @returns {Object} Objeto con aprendices agrupados por ficha
 */
function agruparPorFicha(aprendices) {
  const grupos = {};
  
  aprendices.forEach(aprendiz => {
    const ficha = aprendiz.codigo_ficha || aprendiz.FICHA;
    if (!grupos[ficha]) {
      grupos[ficha] = [];
    }
    grupos[ficha].push(aprendiz);
  });
  
  return grupos;
}

// ===== FUNCIONES DE UTILIDAD =====

/**
 * Muestra una notificación toast al usuario
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de notificación (success, error, warning, info)
 */
export function mostrarNotificacion(mensaje, tipo = 'info') {
  // En una aplicación real, implementaríamos un sistema de toast más sofisticado
  // Por ahora, usamos alert con diferentes íconos según el tipo
  const iconos = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  alert(`${iconos[tipo] || iconos.info} ${mensaje}`);
}

/**
 * Formatea un número con separadores de miles
 * @param {number} numero - Número a formatear
 * @returns {string} Número formateado
 */
export function formatearNumero(numero) {
  return new Intl.NumberFormat('es-CO').format(numero);
}
