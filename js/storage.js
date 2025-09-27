/**
 * Funciones para manejar localStorage y sessionStorage
 * Separé esto para mantener organizado
 */

// Funciones para login/logout

export function login(username) {
  if (!username || username.trim() === '') {
    throw new Error('El nombre de usuario no puede estar vacío');
  }
  
  const userData = {
    username: username.trim(),
    loginTime: new Date().toISOString()
  };
  
  localStorage.setItem("user", JSON.stringify(userData));
}

export function logout() {
  // Limpiar localStorage
  localStorage.removeItem("user");
  localStorage.removeItem("ficha");
  
  // Limpiar sessionStorage también
  sessionStorage.removeItem("selectedFicha");
  sessionStorage.removeItem("searchHistory");
}

export function getUser() {
  try {
    const userData = localStorage.getItem("user");
    if (!userData) return null;
    
    const parsed = JSON.parse(userData);
    // Compatible con versiones anteriores
    if (typeof parsed === 'string') {
      return { username: parsed, loginTime: null };
    }
    
    return parsed;
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return null;
  }
}

// ===== FUNCIONES PARA MANEJO DE FICHAS =====

/**
 * Guarda información de la ficha seleccionada en localStorage (persistente)
 * @param {Object} info - Información de la ficha
 */
export function saveFicha(info) {
  if (!info || typeof info !== 'object') {
    throw new Error('La información de la ficha debe ser un objeto válido');
  }
  
  const fichaData = {
    ...info,
    savedAt: new Date().toISOString()
  };
  
  localStorage.setItem("ficha", JSON.stringify(fichaData));
}

/**
 * Obtiene la información de la ficha guardada
 * @returns {Object|null} Datos de la ficha o null si no existe
 */
export function getFicha() {
  try {
    const fichaData = localStorage.getItem("ficha");
    return fichaData ? JSON.parse(fichaData) : null;
  } catch (error) {
    console.error('Error al obtener datos de la ficha:', error);
    return null;
  }
}

// ===== FUNCIONES CON SESSIONSTORAGE (para datos temporales) =====

/**
 * Guarda la ficha seleccionada actualmente en sessionStorage
 * Esto se pierde al cerrar la pestaña, útil para estado temporal
 * @param {string} fichaId - ID de la ficha seleccionada
 */
export function setSelectedFicha(fichaId) {
  if (!fichaId) {
    sessionStorage.removeItem("selectedFicha");
    return;
  }
  
  const selectionData = {
    fichaId,
    selectedAt: new Date().toISOString()
  };
  
  sessionStorage.setItem("selectedFicha", JSON.stringify(selectionData));
}

/**
 * Obtiene la ficha actualmente seleccionada desde sessionStorage
 * @returns {Object|null} Datos de selección o null
 */
export function getSelectedFicha() {
  try {
    const data = sessionStorage.getItem("selectedFicha");
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error al obtener ficha seleccionada:', error);
    return null;
  }
}

/**
 * Guarda el historial de búsquedas en sessionStorage
 * @param {string} searchTerm - Término buscado
 */
export function saveSearchHistory(searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') return;
  
  try {
    let history = getSearchHistory();
    
    // Evitar duplicados
    history = history.filter(item => item.term !== searchTerm.trim());
    
    // Añadir al principio
    history.unshift({
      term: searchTerm.trim(),
      timestamp: new Date().toISOString()
    });
    
    // Limitar a 10 búsquedas
    history = history.slice(0, 10);
    
    sessionStorage.setItem("searchHistory", JSON.stringify(history));
  } catch (error) {
    console.error('Error al guardar historial de búsqueda:', error);
  }
}

/**
 * Obtiene el historial de búsquedas
 * @returns {Array} Array de búsquedas anteriores
 */
export function getSearchHistory() {
  try {
    const history = sessionStorage.getItem("searchHistory");
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error al obtener historial de búsqueda:', error);
    return [];
  }
}

// ===== FUNCIONES DE UTILIDAD =====

/**
 * Limpia todos los datos de almacenamiento (útil para desarrollo/debug)
 */
export function clearAllStorage() {
  localStorage.clear();
  sessionStorage.clear();
}

/**
 * Obtiene información sobre el uso de almacenamiento
 * @returns {Object} Estadísticas de almacenamiento
 */
export function getStorageInfo() {
  return {
    localStorage: {
      used: JSON.stringify(localStorage).length,
      items: Object.keys(localStorage).length
    },
    sessionStorage: {
      used: JSON.stringify(sessionStorage).length,
      items: Object.keys(sessionStorage).length
    }
  };
}
