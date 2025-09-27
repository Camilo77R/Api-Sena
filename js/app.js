// Importamos los módulos separados siguiendo el principio de responsabilidad única
import { login, logout, getUser, getFicha, setSelectedFicha, getSelectedFicha } from './storage.js';
import { fetchAprendices, buscarAprendices, getEstadisticasFicha } from './fetchData.js';
import { renderUser, renderFichas, renderTable, renderSearchResults, mostrarNotificacion } from './ui.js';

/**
 * APLICACIÓN PRINCIPAL
 * Esta clase se encarga de coordinar todos los módulos y manejar la lógica principal
 * Sigue el principio de responsabilidad única: solo se encarga de la coordinación
 */
class SenaApp {
  constructor() {
    console.log('🚀 Iniciando aplicación SENA...');
    this.aprendices = [];
    this.aprendicesFiltrados = [];
    this.elementos = this.obtenerElementosDOM();
    console.log('🎯 Elementos DOM obtenidos:', this.elementos);
    this.configurarEventos();
    console.log('⚡ Eventos configurados');
    this.verificarSesionInicial();
    console.log('🔍 Verificación de sesión completada');
  }

  // Obtiene todas las referencias de elementos DOM necesarias
  obtenerElementosDOM() {
    return {
      loginSection: document.getElementById("login-section"),
      appSection: document.getElementById("app-section"),
      loginForm: document.getElementById("login-form"),
      logoutBtn: document.getElementById("logout-btn"),
      fichaSelect: document.getElementById("ficha-select"),
      usernameInput: document.getElementById("username"),
      passwordInput: document.getElementById("password"),
      searchInput: this.crearCampoBusqueda()
    };
  }

  // Crea dinámicamente un campo de búsqueda
  crearCampoBusqueda() {
    const main = document.querySelector('main');
    if (!main) return null;

    const searchContainer = document.createElement('div');
    searchContainer.className = 'mb-4 flex gap-2';
    searchContainer.innerHTML = `
      <input 
        type="text" 
        id="search-input" 
        placeholder="Buscar por nombre, documento o estado..." 
        class="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-green-600"
      >
      <button 
        id="search-btn" 
        type="button" 
        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
      >
        🔍 Buscar
      </button>
      <button 
        id="clear-search-btn" 
        type="button" 
        class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
      >
        ✖️ Limpiar
      </button>
    `;

    // Insertar después del selector de fichas
    const fichaContainer = main.querySelector('.mb-6');
    if (fichaContainer) {
      fichaContainer.insertAdjacentElement('afterend', searchContainer);
    }

    return document.getElementById('search-input');
  }

  // Configura todos los event listeners de la aplicación
  configurarEventos() {
    console.log('🔧 Configurando eventos...');
    
    if (this.elementos.loginForm) {
      this.elementos.loginForm.addEventListener("submit", (e) => this.manejarLogin(e));
      console.log('✅ Evento de login configurado');
    } else {
      console.error('❌ No se encontró el formulario de login');
    }
    
    if (this.elementos.logoutBtn) {
      this.elementos.logoutBtn.addEventListener("click", () => this.manejarLogout());
      console.log('✅ Evento de logout configurado');
    }
    
    if (this.elementos.fichaSelect) {
      this.elementos.fichaSelect.addEventListener("change", () => this.manejarCambioFicha());
      console.log('✅ Evento de selección de ficha configurado');
    }
    
    // Configurar eventos de búsqueda si existen los elementos
    if (this.elementos.searchInput) {
      const searchBtn = document.getElementById('search-btn');
      const clearBtn = document.getElementById('clear-search-btn');
      
      if (searchBtn) {
        searchBtn.addEventListener('click', () => this.manejarBusqueda());
        console.log('✅ Evento de búsqueda configurado');
      }
      
      if (clearBtn) {
        clearBtn.addEventListener('click', () => this.limpiarBusqueda());
        console.log('✅ Evento de limpiar búsqueda configurado');
      }
      
      // Buscar mientras se escribe (con debounce)
      this.elementos.searchInput.addEventListener('input', 
        this.debounce((e) => this.manejarBusquedaTiempoReal(e), 500)
      );
      
      // Buscar al presionar Enter
      this.elementos.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.manejarBusqueda();
        }
      });
    }
  }

  // Función debounce para evitar búsquedas excesivas
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Verifica si hay una sesión activa al cargar la página
  async verificarSesionInicial() {
    const usuarioActual = getUser();
    if (usuarioActual) {
      await this.mostrarAplicacion(usuarioActual);
      
      // Restaurar ficha seleccionada si existe
      const fichaSeleccionada = getSelectedFicha();
      if (fichaSeleccionada && this.aprendices.length > 0) {
        this.elementos.fichaSelect.value = fichaSeleccionada.fichaId;
        renderTable(this.aprendices, fichaSeleccionada.fichaId);
      }
    }
  }

  // Maneja el proceso de login
  async manejarLogin(evento) {
    console.log('🔄 Iniciando proceso de login...');
    evento.preventDefault();
    
    const username = this.elementos.usernameInput.value.trim();
    const password = this.elementos.passwordInput.value.trim();
    
    console.log('📝 Datos ingresados:', { username, password });

    if (this.validarCredenciales(username, password)) {
      console.log('✅ Credenciales válidas');
      try {
        login(username);
        console.log('💾 Usuario guardado en localStorage');
        await this.mostrarAplicacion(username);
        this.limpiarFormulario();
        alert(`¡Bienvenido, ${username}!`); // Cambio temporal para debug
      } catch (error) {
        console.error('❌ Error durante el login:', error);
        alert('Error al iniciar sesión');
      }
    } else {
      console.log('❌ Credenciales incorrectas');
      alert("Credenciales incorrectas. La contraseña debe ser: adso3064975");
    }
  }

  // Valida las credenciales ingresadas
  validarCredenciales(username, password) {
    return username.length > 0 && password === "adso3064975";
  }

  // Muestra la aplicación después del login exitoso
  async mostrarAplicacion(username) {
    try {
      // Cambiar vistas
      this.elementos.loginSection.classList.add("hidden");
      this.elementos.appSection.classList.remove("hidden");
      
      // Renderizar usuario (pasamos el objeto completo)
      renderUser(username);
      
      // Cargar datos de la API
      console.log('🔄 Cargando datos de aprendices...');
      this.aprendices = await fetchAprendices();
      this.aprendicesFiltrados = [...this.aprendices];
      
      if (this.aprendices.length > 0) {
        renderFichas(this.aprendices, this.elementos.fichaSelect);
        console.log(`✅ Aplicación iniciada correctamente con ${this.aprendices.length} aprendices`);
      } else {
        mostrarNotificacion("No se pudieron cargar los datos de aprendices. Verifique su conexión a internet.", 'warning');
      }
    } catch (error) {
      console.error("Error al mostrar la aplicación:", error);
      mostrarNotificacion("Error al cargar la aplicación", 'error');
    }
  }

  // Maneja el proceso de logout
  manejarLogout() {
    logout();
    this.elementos.appSection.classList.add("hidden");
    this.elementos.loginSection.classList.remove("hidden");
    this.limpiarDatos();
    mostrarNotificacion("Sesión cerrada correctamente", 'info');
  }

  // Maneja el cambio de ficha en el selector
  manejarCambioFicha() {
    const fichaSeleccionada = this.elementos.fichaSelect.value;
    if (fichaSeleccionada) {
      renderTable(this.aprendices, fichaSeleccionada);
      
      // Mostrar estadísticas de la ficha
      const stats = getEstadisticasFicha(this.aprendices, fichaSeleccionada);
      if (stats) {
        console.log(`📋 Ficha ${fichaSeleccionada}:`, stats);
      }
      
      // Limpiar búsqueda si está activa
      if (this.elementos.searchInput) {
        this.elementos.searchInput.value = '';
      }
    }
  }

  // Maneja la búsqueda de aprendices
  manejarBusqueda() {
    if (!this.elementos.searchInput) return;
    
    const termino = this.elementos.searchInput.value.trim();
    if (!termino) {
      mostrarNotificacion("Ingrese un término de búsqueda", 'warning');
      return;
    }
    
    const resultados = buscarAprendices(this.aprendices, termino);
    renderSearchResults(resultados, termino);
    
    // Limpiar selección de ficha
    this.elementos.fichaSelect.value = '';
  }

  // Maneja búsqueda en tiempo real
  manejarBusquedaTiempoReal(evento) {
    const termino = evento.target.value.trim();
    
    if (termino.length >= 2) {
      const resultados = buscarAprendices(this.aprendices, termino);
      renderSearchResults(resultados, termino);
      this.elementos.fichaSelect.value = '';
    } else if (termino.length === 0) {
      this.limpiarBusqueda();
    }
  }

  // Limpia la búsqueda y restaura vista normal
  limpiarBusqueda() {
    if (this.elementos.searchInput) {
      this.elementos.searchInput.value = '';
    }
    
    // Limpiar tabla
    const tableBody = document.getElementById("table-body");
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="3" class="px-4 py-8 text-center text-gray-500">
            <i class="fas fa-info-circle mr-2"></i>
            Seleccione una ficha para ver los aprendices
          </td>
        </tr>
      `;
    }
  }

  // Limpia el formulario de login
  limpiarFormulario() {
    this.elementos.usernameInput.value = "";
    this.elementos.passwordInput.value = "";
  }

  // Limpia los datos de la aplicación
  limpiarDatos() {
    this.aprendices = [];
    this.aprendicesFiltrados = [];
    this.elementos.fichaSelect.innerHTML = '<option value="">-- Seleccione una ficha --</option>';
    
    if (this.elementos.searchInput) {
      this.elementos.searchInput.value = '';
    }
  }

  // Muestra mensajes de error al usuario (deprecated - usar mostrarNotificacion)
  mostrarError(mensaje) {
    mostrarNotificacion(mensaje, 'error');
  }
}

/**
 * Inicialización de la aplicación
 * Se ejecuta cuando el DOM está completamente cargado
 */
document.addEventListener("DOMContentLoaded", () => {
  new SenaApp();
});
