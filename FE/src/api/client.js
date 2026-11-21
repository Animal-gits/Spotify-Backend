const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const isFormData = body instanceof FormData;
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: {
      ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...headers
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data.message || "Something went wrong. Please try again.", response.status);
  }
  return data;
}

export const api = {
  register: (details) => request("/auth/register", { method: "POST", body: details }),
  login: (details) => request("/auth/login", { method: "POST", body: details }),
  logout: () => request("/auth/logout", { method: "POST" }),
  currentUser: () => request("/auth/me"),
  updateProfile: (details) => request("/auth/me", { method: "PATCH", body: details }),
  listMusic: ({ q = "", page = 1, limit = 50 } = {}) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (q) params.set("q", q);
    return request(`/music?${params}`);
  },
  listMyMusic: () => request("/music/artist/musics"),
  getMusic: (id) => request(`/music/${encodeURIComponent(id)}`),
  uploadMusic: (formData) => request("/music/upload", { method: "POST", body: formData }),
  updateMusic: (id, details) => request(`/music/${encodeURIComponent(id)}`, { method: "PATCH", body: details }),
  deleteMusic: (id) => request(`/music/${encodeURIComponent(id)}`, { method: "DELETE" }),
  listAlbums: () => request("/music/albums"),
  listMyAlbums: () => request("/music/artist/albums"),
  getAlbum: (id) => request(`/music/albums/${encodeURIComponent(id)}`),
  createAlbum: (details) => request("/music/album", { method: "POST", body: details })
};
