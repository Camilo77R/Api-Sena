/**
 * MÓDULO DE OBTENCIÓN DE DATOS
 * Se encarga de todas las operaciones relacionadas con APIs externas
 * Principio de responsabilidad única: solo maneja fetching de datos
 */

/**
 * Obtiene la lista de aprendices desde la API del SENA
 * Versión simplificada para debugging
 */
export async function fetchAprendices() {
  const url = "https://raw.githubusercontent.com/CesarMCuellarCha/apis/refs/heads/main/SENA-CTPI.matriculados.json";
  
  console.log('🌐 Intentando conectar a:', url);
  
  try {
    console.log('📡 Haciendo petición fetch...');
    
    const response = await fetch(url);
    
    console.log('📋 Respuesta recibida:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('📦 Parseando JSON...');
    const data = await response.json();
    
    console.log('✅ Datos parseados exitosamente');
    console.log('📊 Tipo de datos:', typeof data);
    console.log('📏 Es array:', Array.isArray(data));
    console.log('🔢 Cantidad de elementos:', data.length);
    console.log('🔍 Primer elemento (campos reales):', data[0]);
    
    // Normalizo los datos que llegan para que funcionen con este código
    const datosNormalizados = data.map(aprendiz => ({
      // Usar los nombres de campos reales de la API
      documento: aprendiz.DOCUMENTO,
      nombre: aprendiz.NOMBRE,
      codigo_ficha: aprendiz.FICHA,
      programa: aprendiz.PROGRAMA,
      estado_aprendiz: aprendiz.ESTADO_APRENDIZ,
      nivel_formacion: aprendiz.NIVEL_DE_FORMACION,
      estado_ficha: aprendiz.ESTADO_FICHA,
      jornada_formacion: aprendiz.JORNADA_FORMACION,
      fecha_inicio_lectiva: aprendiz.FECHA_INICIO_LECTIVA,
      fecha_fin_lectiva: aprendiz.FECHA_FIN_LECTIVA,
      // Mantener también los originales por si acaso
      ...aprendiz
    }));
    
    console.log('🔄 Datos normalizados:', datosNormalizados.length, 'elementos');
    console.log('📝 Primer dato normalizado:', datosNormalizados[0]);
    
    return datosNormalizados;
    
  } catch (error) {
    console.error('💥 ERROR COMPLETO:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    console.error('🔄 Devolviendo array vacío');
    return [];
  }
}

/**
 * Obtiene estadísticas específicas de una ficha
 * @param {Array} aprendices - Array de todos los aprendices
 * @param {string} fichaId - ID de la ficha
 * @returns {Object} Estadísticas de la ficha
 */
export function getEstadisticasFicha(aprendices, fichaId) {
  if (!Array.isArray(aprendices) || !fichaId) {
    return null;
  }
  
  const aprendicesFicha = aprendices.filter(a => 
    String(a.codigo_ficha).trim() === String(fichaId).trim() ||
    String(a.FICHA).trim() === String(fichaId).trim()
  );
  
  if (aprendicesFicha.length === 0) {
    return null;
  }
  
  const estadisticas = {
    totalAprendices: aprendicesFicha.length,
    porEstado: {},
    fichaInfo: {}
  };
  
  // Contar por estado
  aprendicesFicha.forEach(aprendiz => {
    const estado = aprendiz.estado_aprendiz || aprendiz.ESTADO_APRENDIZ || 'Sin estado';
    estadisticas.porEstado[estado] = (estadisticas.porEstado[estado] || 0) + 1;
  });
  
  // Información de la ficha (tomamos del primer aprendiz)
  const primerAprendiz = aprendicesFicha[0];
  estadisticas.fichaInfo = {
    codigo: primerAprendiz.codigo_ficha || primerAprendiz.FICHA,
    programa: primerAprendiz.programa || primerAprendiz.PROGRAMA,
    nivel: primerAprendiz.nivel_formacion || primerAprendiz.NIVEL_DE_FORMACION,
    estado: primerAprendiz.estado_ficha || primerAprendiz.ESTADO_FICHA,
    jornadaFormacion: primerAprendiz.jornada_formacion || primerAprendiz.JORNADA_FORMACION,
    fechaInicio: primerAprendiz.fecha_inicio_lectiva || primerAprendiz.FECHA_INICIO_LECTIVA,
    fechaFin: primerAprendiz.fecha_fin_lectiva || primerAprendiz.FECHA_FIN_LECTIVA
  };
  
  return estadisticas;
}

/**
 * Busca aprendices por término de búsqueda
 * @param {Array} aprendices - Array de todos los aprendices
 * @param {string} termino - Término de búsqueda
 * @returns {Array} Aprendices que coinciden con la búsqueda
 */
export function buscarAprendices(aprendices, termino) {
  if (!Array.isArray(aprendices) || !termino || termino.trim() === '') {
    return aprendices;
  }
  
  const terminoLower = termino.toLowerCase().trim();
  
  return aprendices.filter(aprendiz => {
    return (
      aprendiz.nombre?.toLowerCase().includes(terminoLower) ||
      aprendiz.NOMBRE?.toLowerCase().includes(terminoLower) ||
      aprendiz.documento?.toString().includes(terminoLower) ||
      aprendiz.DOCUMENTO?.toString().includes(terminoLower) ||
      aprendiz.estado_aprendiz?.toLowerCase().includes(terminoLower) ||
      aprendiz.ESTADO_APRENDIZ?.toLowerCase().includes(terminoLower) ||
      aprendiz.programa?.toLowerCase().includes(terminoLower) ||
      aprendiz.PROGRAMA?.toLowerCase().includes(terminoLower) ||
      aprendiz.codigo_ficha?.toString().includes(terminoLower) ||
      aprendiz.FICHA?.toString().includes(terminoLower)
    );
  });
}

/**
 * Obtiene todas las fichas únicas del array de aprendices
 * @param {Array} aprendices - Array de aprendices
 * @returns {Array} Array de fichas únicas con información adicional
 */
export function obtenerFichasUnicas(aprendices) {
  if (!Array.isArray(aprendices)) {
    return [];
  }
  
  const fichasMap = new Map();
  
  aprendices.forEach(aprendiz => {
    const fichaId = aprendiz.codigo_ficha;
    if (!fichasMap.has(fichaId)) {
      fichasMap.set(fichaId, {
        codigo: fichaId,
        programa: aprendiz.programa,
        nivel: aprendiz.nivel_formacion,
        estado: aprendiz.estado_ficha,
        totalAprendices: 0
      });
    }
    fichasMap.get(fichaId).totalAprendices++;
  });
  
  // Convertir Map a Array y ordenar por código
  return Array.from(fichasMap.values()).sort((a, b) => 
    a.codigo.toString().localeCompare(b.codigo.toString())
  );
}

/**
 * Valida la estructura de datos de un aprendiz
 * @param {Object} aprendiz - Objeto aprendiz a validar
 * @returns {boolean} true si la estructura es válida
 */
export function validarEstructuraAprendiz(aprendiz) {
  const camposRequeridos = [
    'documento',
    'nombre',
    'codigo_ficha',
    'programa',
    'estado_aprendiz'
  ];
  
  return camposRequeridos.every(campo => 
    aprendiz.hasOwnProperty(campo) && 
    aprendiz[campo] !== null && 
    aprendiz[campo] !== undefined
  );
}
