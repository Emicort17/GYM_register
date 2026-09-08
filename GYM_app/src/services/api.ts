export const API_URL = '/api';

// Función para obtener el token del localStorage
export const getAuthToken = () => localStorage.getItem('gym_auth_token');

// Función helper para hacer peticiones fetch con el token JWT
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Si la respuesta es unauthorized, podríamos disparar un evento para hacer logout
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('gym_auth_token');
    window.dispatchEvent(new Event('auth-error'));
  }

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  // Si no hay contenido (por ejemplo DELETE), retornamos null
  if (response.status === 204) return null;
  
  return response.json();
}
