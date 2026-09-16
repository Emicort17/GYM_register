import { fetchWithAuth } from './api';

export interface Usuario {
  id_usuario?: number;
  id?: number;
  email: string;
  username?: string;
  contrasena?: string;
  status?: boolean;
  blocked?: boolean;
  role?: {
    id_role?: number;
    id?: number;
    name?: string;
  };
}

export const usuariosService = {
  getAll: async (): Promise<Usuario[]> => {
    const response = await fetchWithAuth('/usuarios');
    return response.data || response || [];
  },
  getById: async (id: number): Promise<Usuario> => {
    const response = await fetchWithAuth(`/usuarios/${id}`);
    return response.data || response;
  },
  create: async (roleName: string, usuario: { email: string; contrasena: string }): Promise<Usuario> => {
    const response = await fetchWithAuth(`/usuarios/crear/${roleName}`, {
      method: 'POST',
      body: JSON.stringify(usuario)
    });
    return response.data || response;
  },
  update: async (id: number, usuario: Partial<Usuario>): Promise<Usuario> => {
    const response = await fetchWithAuth(`/usuarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(usuario)
    });
    return response.data || response;
  },
  changePassword: async (id: number, payload: { currentPassword: string; newPassword: string }): Promise<void> => {
    await fetchWithAuth(`/usuarios/${id}/password`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },
  delete: async (id: number): Promise<void> => {
    await fetchWithAuth(`/usuarios/${id}`, {
      method: 'DELETE'
    });
  }
};
