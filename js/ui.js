import { saveFicha } from "./storage.js";

const userDisplay = document.getElementById("user-display");
const tableBody = document.getElementById("table-body");

export function renderUser(username) {
  userDisplay.textContent = username;
}

export function renderFichas(data, selectElement) {
  const fichas = [...new Set(data.map(a => a.codigo_ficha))];
  selectElement.innerHTML = '<option value="">-- Seleccione --</option>';
  fichas.forEach(f => {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    selectElement.appendChild(opt);
  });
}

export function renderTable(data, ficha) {
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
