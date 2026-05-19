export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

export type DocumentCategory = {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type DocumentVersion = {
  id: string;
  documentId: string;
  versionNumber: string;
  fileUrl: string;
  fileName: string;
  fileType?: string | null;
  uploadedBy?: string | null;
  changeNotes?: string | null;
  createdAt: string;
};

export type Document = {
  id: string;
  title: string;
  description?: string | null;
  categoryId?: string | null;
  ownerId?: string | null;
  status: string;
  currentVersionId?: string | null;
  reviewDueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: DocumentCategory | null;
  owner?: Pick<User, "id" | "name" | "email"> | null;
  currentVersion?: DocumentVersion | null;
  versions?: DocumentVersion[];
};

export type Approval = {
  id: string;
  documentId: string;
  documentVersionId: string;
  approverId: string;
  status: "pending" | "approved" | "rejected";
  comment?: string | null;
  decidedAt?: string | null;
  createdAt: string;
  document?: Document | null;
  documentVersion?: DocumentVersion | null;
  approver?: Pick<User, "id" | "name" | "email"> | null;
};

export type ActionComment = {
  id: string;
  actionId: string;
  userId: string;
  comment: string;
  createdAt: string;
  user?: Pick<User, "id" | "name" | "email"> | null;
};

export type ComplianceAction = {
  id: string;
  title: string;
  description?: string | null;
  type: "corrective" | "preventive" | "improvement";
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "in_review" | "closed" | "cancelled";
  ownerId?: string | null;
  dueDate?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  owner?: Pick<User, "id" | "name" | "email"> | null;
  comments?: ActionComment[];
};

export type LoginResponse = {
  user: User;
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
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error?.message ?? "Error al consultar la API");
  }

  return response.json();
}

export async function uploadFetch<T>(path: string, token: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error?.message ?? "Error al subir archivo");
  }

  return response.json();
}

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("complienx_token");
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;

  const rawUser = localStorage.getItem("complienx_user");

  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    return null;
  }
}
