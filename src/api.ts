// Scentsmiths API Client
// Uses Vite environment variable for API base URL

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(method: string, path: string, body?: any) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('scentsmiths_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Request failed');
    }

    return res.json();
}

export const api = {
    get: (path: string) => request('GET', path),
    post: (path: string, body?: any) => request('POST', path, body),
    put: (path: string, body?: any) => request('PUT', path, body),
    patch: (path: string, body?: any) => request('PATCH', path, body),
    delete: (path: string) => request('DELETE', path),
};

// Auth helpers
export const auth = {
    register: (data: { email: string; password: string; name: string }) =>
        api.post('/auth/register', data),
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
    saveToken: (token: string) => localStorage.setItem('scentsmiths_token', token),
    getToken: () => localStorage.getItem('scentsmiths_token'),
    logout: () => localStorage.removeItem('scentsmiths_token'),
};

export default api;
