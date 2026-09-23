import React, { useEffect, useState } from 'react';
import { usuariosService, type Usuario } from '../services/usuariosService';
import { UsuarioModal } from '../components/UsuarioModal';
import { DataTable } from '../components/DataTable';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';

export const Usuarios: React.FC = () => {
  const { isAdmin } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: number; email: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Change password modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<Usuario | null>(null);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError('');
      // Un empleado solo puede consultar su propia cuenta (para cambiar su contraseña)
      if (isAdmin) {
        const data = await usuariosService.getAll();
        setUsuarios(Array.isArray(data) ? data : []);
      } else {
        const me = await usuariosService.getMe();
        setUsuarios(me ? [me] : []);
      }
    } catch (err: any) {
      setError(err.message || 'Error al obtener usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleSaveUsuario = async (roleName: string, userData: { email: string; contrasena: string }) => {
    setSuccessMsg('');
    setError('');
    await usuariosService.create(roleName, userData);
    setSuccessMsg('Usuario creado exitosamente');
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
      setSuccessMsg('');
      setError('No puedes eliminar tu propio usuario.');
      return;
    }
    setUserToDelete({ id, email: userEmail || '' });
  };

  const handleConfirmDeleteUsuario = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      setSuccessMsg('');
      setError('');
      await usuariosService.delete(userToDelete.id);
      setSuccessMsg('Usuario eliminado');
      await fetchUsuarios();
    } catch (err: any) {
      setError(err.message || 'No se pudo eliminar el usuario');
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  const handleOpenPasswordModal = (user: Usuario) => {
    setSelectedUserForPassword(user);
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setPasswordError('');
    setIsPasswordModalOpen(true);
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword) return;
    const userId = selectedUserForPassword.id_usuario || selectedUserForPassword.id;
    if (!userId) return;

    try {
      setIsSubmittingPassword(true);
      setPasswordError('');
      await usuariosService.changePassword(userId, {
        currentPassword: currentPasswordInput,
        newPassword: newPasswordInput,
      });
      setSuccessMsg('Contraseña actualizada correctamente');
      setIsPasswordModalOpen(false);
    } catch (err: any) {
      setPasswordError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  if (loading && usuarios.length === 0) return <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Cargando usuarios...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.6rem', fontWeight: 700 }}>{isAdmin ? 'Gestión de Usuarios' : 'Mi Cuenta'}</h1>
          <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isAdmin ? 'Cuentas de acceso, contraseñas y roles del personal del gimnasio' : 'Tu cuenta de acceso y cambio de contraseña'}
          </p>
        </div>
      </div>

      {successMsg && (
        <div style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '0.8rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {successMsg}
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '0.8rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <DataTable<Usuario>
        data={usuarios}
        loading={loading}
        keyExtractor={(u, idx) => u.id_usuario || u.id || idx}
        searchPlaceholder="Buscar por correo o rol..."
        getSearchValue={(u) => `${u.email || u.username || ''} ${u.role?.name || ''}`}
        selectFilters={[
          {
            id: 'role',
            label: 'Rol',
            options: [
              { label: 'Administrador (ADMIN)', value: 'ADMIN' },
              { label: 'Usuario Estándar (USER)', value: 'USER' },
            ],
            filterFn: (u, val) => (u.role?.name || '').toUpperCase().includes(val.toUpperCase()),
          },
          {
            id: 'status',
            label: 'Estado',
            options: [
              { label: 'Activos', value: 'activo' },
              { label: 'Inactivos / Bloqueados', value: 'inactivo' },
            ],
            filterFn: (u, val) => {
              const isActive = u.status !== false && !u.blocked;
              return val === 'activo' ? isActive : !isActive;
            },
          },
        ]}
        defaultSortKey="id"
        defaultSortOrder="asc"
        emptyMessage="No se encontraron usuarios registrados"
        extraHeaderActions={
          isAdmin ? (
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              + Nuevo Usuario
            </button>
          ) : undefined
        }
        columns={[
          {
            key: 'id',
            label: 'ID',
            sortable: true,
            sortType: 'number',
            getValue: (u) => u.id_usuario || u.id,
            render: (u) => `#${u.id_usuario || u.id || '-'}`,
          },
          {
            key: 'email',
            label: 'Usuario (Email)',
            sortable: true,
            sortType: 'string',
            getValue: (u) => u.email || u.username || '',
            render: (u) => {
              const emailStr = u.email || u.username || 'Sin correo';
              const isSelf = currentUserEmail !== '' && emailStr.toLowerCase() === currentUserEmail;
              return (
                <div>
                  <strong>{emailStr}</strong>{' '}
                  {isSelf && <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>(Tú)</span>}
                </div>
              );
            },
          },
          {
            key: 'role',
            label: 'Rol',
            sortable: true,
            sortType: 'string',
            getValue: (u) => u.role?.name || 'USER_ROLE',
            render: (u) => {
              const roleStr = u.role?.name || 'USER_ROLE';
              return (
                <span className={`badge ${roleStr.includes('ADMIN') ? 'badge-danger' : 'badge-info'}`}>
                  {roleStr}
                </span>
              );
            },
          },
          {
            key: 'status',
            label: 'Estado',
            sortable: true,
            render: (u) => {
              const isActive = u.status !== false && !u.blocked;
              return (
                <span className={`badge ${isActive ? 'badge-success' : 'badge-warning'}`}>
                  {isActive ? 'Activo' : 'Inactivo / Bloqueado'}
                </span>
              );
            },
          },
          {
            key: 'acciones',
            label: 'Acciones',
            sortable: false,
            render: (u) => {
              const userId = u.id_usuario || u.id;
              const emailStr = u.email || u.username || '';
              const isSelf = currentUserEmail !== '' && emailStr.toLowerCase() === currentUserEmail;

              return (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {isSelf && (
                    <button
                      className="btn-outline"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      onClick={() => handleOpenPasswordModal(u)}
                    >
                      Cambiar Contraseña
                    </button>
                  )}
                  {userId && !isSelf ? (
                    <button
                      className="btn-outline"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: '#b91c1c', borderColor: '#fca5a5' }}
                      onClick={() => handleDeleteUsuario(userId, emailStr)}
                    >
                      Eliminar
                    </button>
                  ) : !isSelf ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No disponible</span>
                  ) : null}
                </div>
              );
            },
          },
        ]}
      />

      <ConfirmModal
        isOpen={userToDelete !== null}
        title="Eliminar usuario"
        message={`¿Seguro que deseas eliminar al usuario ${userToDelete?.email ?? ''}? Esta acción no se puede deshacer.`}
        isLoading={isDeleting}
        onConfirm={handleConfirmDeleteUsuario}
        onCancel={() => setUserToDelete(null)}
      />

      <UsuarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUsuario}
      />

      {isPasswordModalOpen && selectedUserForPassword && (
        <div className="modal-backdrop" onClick={() => setIsPasswordModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cambiar Contraseña - {selectedUserForPassword.email}</h3>
              <button className="modal-close-btn" onClick={() => setIsPasswordModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleChangePasswordSubmit}>
              <div className="modal-body">
                {passwordError && (
                  <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '0.8rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    {passwordError}
                  </div>
                )}
                <div className="form-group">
                  <label>Contraseña Actual *</label>
                  <input
                    type="password"
                    required
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    placeholder="Ingresa tu contraseña actual"
                  />
                </div>
                <div className="form-group">
                  <label>Nueva Contraseña *</label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Ingresa la nueva contraseña"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsPasswordModalOpen(false)} disabled={isSubmittingPassword}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmittingPassword}>
                  {isSubmittingPassword ? 'Actualizando...' : 'Guardar Nueva Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

