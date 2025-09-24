// // ===== Storage =====
function login(username) {
  localStorage.setItem("user", username);
}
function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("ficha");
}
function getUser() {
  return localStorage.getItem("user");
}
function saveFicha(info) {
  localStorage.setItem("ficha", JSON.stringify(info));
}
function getFicha() {
  return JSON.parse(localStorage.getItem("ficha"));
}

// ===== Fetch =====
async function fetchAprendices() {
  const url = "https://raw.githubusercontent.com/CesarMCuellarCha/apis/refs/heads/main/SENA-CTPI.matriculados.json";
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error en la API");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error al obtener datos:", err);
    return [];
  }
}

// ===== UI =====
const userDisplay = document.getElementById("user-display");
const tableBody = document.getElementById("table-body");

function renderUser(username) {
  userDisplay.textContent = username;
}

function renderFichas(data, selectElement) {
  const fichas = [...new Set(data.map(a => a.codigo_ficha))];
  selectElement.innerHTML = '<option value="">-- Seleccione --</option>';
  fichas.forEach(f => {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    selectElement.appendChild(opt);
  });
}

function renderTable(data, ficha) {
  tableBody.innerHTML = "";
  if (!ficha) return;

  const seleccionados = data.filter(a => a.codigo_ficha == ficha);
  if (seleccionados.length > 0) {
    const fichaInfo = seleccionados[0];
    saveFicha({
      codigo: fichaInfo.codigo_ficha,
      programa: fichaInfo.programa,
      nivel: fichaInfo.nivel_formacion,
      estado: fichaInfo.estado_ficha
    });
  }

  seleccionados.forEach(aprendiz => {
    const tr = document.createElement("tr");
    tr.className = "border";

    if (aprendiz.estado_aprendiz === "Retiro Voluntario") {
      tr.classList.add("bg-red-100", "font-bold", "text-red-700");
    }

    tr.innerHTML = `
      <td class="px-4 py-2 border">${aprendiz.documento}</td>
      <td class="px-4 py-2 border">${aprendiz.nombre}</td>
      <td class="px-4 py-2 border">${aprendiz.estado_aprendiz}</td>
    `;
    tableBody.appendChild(tr);
  });
}

// ===== App =====
const loginSection = document.getElementById("login-section");
const appSection = document.getElementById("app-section");
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logout-btn");
const fichaSelect = document.getElementById("ficha-select");

let aprendices = [];

// Verificar sesión
window.addEventListener("DOMContentLoaded", async () => {
  const user = getUser();
  if (user) {
    showApp(user);
    aprendices = await fetchAprendices();
    renderFichas(aprendices, fichaSelect);
  }
});

// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (password === "adso3064975") {
    login(username);
    showApp(username);
    aprendices = await fetchAprendices();
    renderFichas(aprendices, fichaSelect);
  } else {
    alert("Credenciales incorrectas");
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  logout();
  appSection.classList.add("hidden");
  loginSection.classList.remove("hidden");
});

// Selección de ficha
fichaSelect.addEventListener("change", () => {
  const ficha = fichaSelect.value;
  renderTable(aprendices, ficha);
});

function showApp(username) {
  loginSection.classList.add("hidden");
  appSection.classList.remove("hidden");
  renderUser(username);
}
