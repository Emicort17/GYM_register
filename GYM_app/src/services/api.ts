const apiHost = import.meta.env.VITE_API_HOST;
const apiPort = import.meta.env.VITE_API_PORT;
const apiBase = import.meta.env.VITE_API_BASE || '/api';
const apiProtocol = import.meta.env.VITE_API_PROTOCOL || 'http';

export const API_URL = apiHost
  ? `${apiProtocol}://${apiHost}${apiPort ? `:${apiPort}` : ''}${apiBase}`
  : (import.meta.env.VITE_API_URL || '/api');

// Función para obtener el token del localStorage
export const getAuthToken = () => localStorage.getItem('gym_auth_token');

// Error enriquecido con el mensaje del backend y, si aplica, los errores por campo
export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;

  constructor(message: string, status: number, errors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

// Mensaje genérico y entendible cuando el backend no envía uno propio
function defaultMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'La solicitud contiene datos inválidos. Verifica la información e intenta de nuevo.';
    case 401:
      return 'Tu sesión expiró o no tienes autorización. Vuelve a iniciar sesión.';
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return 'El recurso solicitado no fue encontrado.';
    case 409:
      return 'Ya existe un registro con esos datos.';
    case 500:
      return 'Ocurrió un error interno en el servidor. Intenta más tarde.';
    default:
      return `Ocurrió un error inesperado (código ${status}).`;
  }
}

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
    let data: any = null;
    try {
      data = await response.json();
    } catch {
      // El cuerpo no era JSON (o venía vacío); seguimos con el mensaje por defecto
    }

    const fieldErrors: Record<string, string> | undefined =
      data?.errors && Object.keys(data.errors).length > 0 ? data.errors : undefined;

    const message = fieldErrors
      ? Object.values(fieldErrors).join('. ')
      : data?.message || defaultMessageForStatus(response.status);

    throw new ApiError(message, response.status, fieldErrors);
  }

  // Si no hay contenido (por ejemplo DELETE), retornamos null
  if (response.status === 204) return null;

  return response.json();
}
