export async function fetchAprendices() {
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
