export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}/api${path.startsWith('/') ? path : `/${path}`}`;
  const backendToken = typeof window !== 'undefined' ? localStorage.getItem('backend_token') : null;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) } as Record<string,string>;
  if (backendToken) headers['Authorization'] = `Bearer ${backendToken}`;

  const res = await fetch(url, {
    headers,
    credentials: 'include',
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { message: text }; }
    throw { status: res.status, data };
  }

  // If no content
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: async (path: string) => request(path, { method: 'GET' }),
  post: async (path: string, body?: any) => request(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  // Send multipart/form-data. `form` must be a FormData instance.
  postForm: async (path: string, form: FormData) => {
    const url = `${BASE_URL}/api${path.startsWith('/') ? path : `/${path}`}`;
    const res = await fetch(url, {
      method: 'POST',
      body: form,
      credentials: 'include',
    });
    if (!res.ok) {
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { message: text }; }
      throw { status: res.status, data };
    }
    if (res.status === 204) return null;
    return res.json();
  },
  put: async (path: string, body?: any) => request(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  del: async (path: string) => request(path, { method: 'DELETE' }),
};

export default api;
