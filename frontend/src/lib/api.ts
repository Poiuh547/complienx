const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type LoginResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
  };
  token: string;
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error("No se pudo iniciar sesión");
  }

  return response.json();
}

export async function apiFetch<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error("Error al consultar la API");
  }

  return response.json();
}
