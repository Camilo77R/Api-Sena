export function login(username) {
  localStorage.setItem("user", username);
}

export function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("ficha");
}

export function getUser() {
  return localStorage.getItem("user");
}

export function saveFicha(info) {
  localStorage.setItem("ficha", JSON.stringify(info));
}

export function getFicha() {
  return JSON.parse(localStorage.getItem("ficha"));
}
