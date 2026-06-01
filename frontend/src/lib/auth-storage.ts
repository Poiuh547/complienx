import type { AuthResponse } from "./api";

export function saveAuthSession(auth: AuthResponse) {
  localStorage.setItem("complienx_token", auth.token);
  localStorage.setItem("complienx_user", JSON.stringify(auth.user));

  if (auth.company) {
    localStorage.setItem("complienx_company", JSON.stringify(auth.company));
  }

  if (auth.companies) {
    localStorage.setItem("complienx_companies", JSON.stringify(auth.companies));
  }
}

export function clearAuthSession() {
  localStorage.removeItem("complienx_token");
  localStorage.removeItem("complienx_user");
  localStorage.removeItem("complienx_company");
  localStorage.removeItem("complienx_companies");
}
