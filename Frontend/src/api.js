export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const buildHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const request = async (path, { method = 'GET', body, token } = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: buildHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.error || data?.message || 'Request failed';
    throw new Error(message);
  }
  return data;
};

export const authApi = {
  signup: (payload) => request('/api/auth/signup', { method: 'POST', body: payload }),
  login: (idToken) => request('/api/auth/login', { method: 'POST', body: { idToken } }),
  me: (token) => request('/api/auth/me', { token }),
  updateProfile: (payload, token) => request('/api/auth/me', { method: 'PUT', body: payload, token }),
};

export const companyApi = {
  create: (payload, token) => request('/api/companies', { method: 'POST', body: payload, token }),
  myCompany: (token) => request('/api/companies/my-company', { token }),
  invite: (companyId, token) => request(`/api/companies/${companyId}/invite`, { method: 'POST', token }),
  acceptInvite: (tokenValue, token) => request('/api/companies/accept-invitation', { method: 'POST', body: { token: tokenValue }, token }),
};

export const employeeApi = {
  list: (params = {}, token) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/employees${query ? `?${query}` : ''}`, { token });
  },
  me: (token) => request('/api/employees/me', { token }),
};

export const taskApi = {
  create: (payload, token) => request('/api/tasks', { method: 'POST', body: payload, token }),
  list: (params = {}, token) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/tasks${query ? `?${query}` : ''}`, { token });
  },
  getById: (id, token) => request(`/api/tasks/${id}`, { token }),
  update: (id, payload, token) => request(`/api/tasks/${id}`, { method: 'PUT', body: payload, token }),
  delete: (id, token) => request(`/api/tasks/${id}`, { method: 'DELETE', token }),
};

export const screenshotApi = {
  upload: (payload, token) => request('/api/screenshots', { method: 'POST', body: payload, token }),
  list: (params = {}, token) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/screenshots${query ? `?${query}` : ''}`, { token });
  },
  getImage: (id, token) => request(`/api/screenshots/${id}/image`, { token }),
  delete: (id, token) => request(`/api/screenshots/${id}`, { method: 'DELETE', token }),
};
