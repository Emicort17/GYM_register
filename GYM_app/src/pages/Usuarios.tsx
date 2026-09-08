import React, { useEffect, useState } from 'react';
import { usuariosService, type Usuario } from '../services/usuariosService';
import { UsuarioModal } from '../components/UsuarioModal';

export const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await usuariosService.getAll();
      const list = Array.isArray(data) ? data : [];
      setUsuarios(list);
      setFilteredUsuarios(list);
    } catch (err: any) {
      setError(err.message || 'Error al obtener usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsuarios(usuarios);
      return;
    }
    const term = searchTerm.toLowerCase();
    setFilteredUsuarios(
      usuarios.filter(
        (u) =>
          (u.email || u.username || '').toLowerCase().includes(term) ||
          (u.role?.name || '').toLowerCase().includes(term)
      )
    );
  }, [searchTerm, usuarios]);

  const handleSaveUsuario = async (roleName: string, userData: { email: string; contrasena: string }) => {
    await usuariosService.create(roleName, userData);
    await fetchUsuarios();
  };

  // Helper to extract current user email from JWT token
  const getCurrentUserEmail = (): string => {
    try {
      const token = localStorage.getItem('gym_auth_token');
      if (!token) return '';
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return '';
      const decodedJson = atob(payloadBase64);
      const decoded = JSON.parse(decodedJson);
      return decoded.sub || decoded.subject || '';
    } catch {
      return '';
    }
  };

  const currentUserEmail = getCurrentUserEmail().toLowerCase();

  const handleDeleteUsuario = async (id?: number, userEmail?: string) => {
    if (!id) return;
    if (userEmail && userEmail.toLowerCase() === currentUserEmail) {
      alert('No puedes eliminar tu propio usuario.');
      return;
    }
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await usuariosService.delete(id);
        await fetchUsuarios();
      } catch (err: any) {
        alert(err.message || 'No se pudo eliminar el usuario');
      }
    }
  };

  if (loading) return <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Cargando usuarios...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.6rem', fontWeight: 700 }}>Gestión de Usuarios</h1>
          <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Cuentas de acceso y roles del personal del gimnasio
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar por correo o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '280px' }}
          />
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            + Nuevo Usuario
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '0.8rem', borderRadius: '6px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div className="card table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario (Email)</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios.length > 0 ? (
              filteredUsuarios.map((u) => {
                const userId = u.id_usuario || u.id;
                const emailStr = u.email || u.username || 'Sin correo';
                const roleStr = u.role?.name || 'USER_ROLE';
                const isActive = u.status !== false && !u.blocked;
                const isSelf = currentUserEmail !== '' && emailStr.toLowerCase() === currentUserEmail;

                return (
                  <tr key={userId || emailStr}>
                    <td>#{userId || '-'}</td>
                    <td>
                      <strong>{emailStr}</strong> {isSelf && <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>(Tú)</span>}
                    </td>
                    <td>
                      <span className={`badge ${roleStr.includes('ADMIN') ? 'badge-danger' : 'badge-info'}`}>
                        {roleStr}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isActive ? 'badge-success' : 'badge-warning'}`}>
                        {isActive ? 'Activo' : 'Inactivo / Bloqueado'}
                      </span>
                    </td>
                    <td>
                      {userId && !isSelf ? (
                        <button
                          className="btn-outline"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: '#b91c1c', borderColor: '#fca5a5' }}
                          onClick={() => handleDeleteUsuario(userId, emailStr)}
                        >
                          Eliminar
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No disponible</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No se encontraron usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <UsuarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUsuario}
      />
    </div>
  );
};
