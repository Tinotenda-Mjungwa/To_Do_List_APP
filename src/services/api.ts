/**
 * API Service for TaskFlow Pro
 */

const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const api = {
  auth: {
    login: async (data: any) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Login failed');
      return res.json();
    },
    register: async (data: any) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Registration failed');
      return res.json();
    },
  },
  tasks: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/tasks`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
    create: async (data: any) => {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create task');
      return res.json();
    },
    update: async (id: number, data: any) => {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    delete: async (id: number) => {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete task');
      return true;
    },
    undo: async () => {
      const res = await fetch(`${API_BASE}/tasks/undo`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to undo');
      return res.json();
    },
  },
  categories: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/categories`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  },
  search: async (q: string) => {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },
  analytics: {
    getStats: async () => {
      const res = await fetch(`${API_BASE}/analytics`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
  },
};
