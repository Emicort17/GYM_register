import { fetchWithAuth } from './api';

export interface Bitacora {
  id_bitacora: number;
  fecha: string;
  accion: string;
  tablaAfectada?: string;
  registroAfectadoId?: number;
  detalles?: string;
  usuario?: {
    id: number;
    email: string;
  } | null;
}

export const bitacoraService = {
  getAll: async (): Promise<Bitacora[]> => {
    const response = await fetchWithAuth('/bitacora');
    // Backend wraps list inside ApiResponse (data field)
    return response.data || response || [];
  },
  getByUsuarioId: async (idUsuario: number): Promise<Bitacora[]> => {
    const response = await fetchWithAuth(`/bitacora/usuario/${idUsuario}`);
    return response.data || response || [];
  }
};
