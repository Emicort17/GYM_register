import { fetchWithAuth } from './api';

export interface Persona {
  id: number;
  name: string;
  email?: string | null; // opcional
  telefono: string;
  age: number;
  fechaRegistro: string;
  ultimoPago?: string;
  fechaVencimiento?: string;
  diasRestantes?: number;
  estado: string; // Activo, Proximo a vencer, Vencido
}

export const personasService = {
  getAll: () => fetchWithAuth('/personas'),
  getById: (id: number) => fetchWithAuth(`/personas/${id}`),
  create: (persona: Partial<Persona>) => fetchWithAuth('/personas/crear', {
    method: 'POST',
    body: JSON.stringify(persona)
  }),
  update: (id: number, persona: Partial<Persona>) => fetchWithAuth(`/personas/modificar/${id}`, {
    method: 'PUT',
    body: JSON.stringify(persona)
  }),
  delete: (id: number) => fetchWithAuth(`/personas/borrar/${id}`, {
    method: 'DELETE'
  }),
  getPagos: (id: number) => fetchWithAuth(`/personas/${id}/pagos`),
  registrarPago: (personaId: number, fechaPago?: string, tipoPago?: 'MENSUAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL') =>
    fetchWithAuth(`/personas/${personaId}/pagos`, {
      method: 'POST',
      body: JSON.stringify({
        ...(fechaPago ? { fechaPago } : {}),
        ...(tipoPago ? { tipoPago } : {})
      })
    })
};

