import { login, logout, getUser } from "./storage.js";
import { renderUser, renderFichas, renderTable } from "./ui.js";
import { fetchAprendices } from "./fetchData.js";

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
