import { API_URL } from './api';

export const authService = {
  async signin(credentials: { usuario: string; contrasenia: string }): Promise<{ token: string }> {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error(`Error de comunicación con el servidor (${response.status} ${response.statusText})`);
    }

    if (!response.ok || result.error) {
      throw new Error(result.message || 'Credenciales inválidas');
    }

    return { token: result.data.token };
  }
};

