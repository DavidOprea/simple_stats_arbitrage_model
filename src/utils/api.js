export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  return response.json();
}