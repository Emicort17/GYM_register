import React, { useState, useEffect } from 'react';

interface UsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleName: string, userData: { email: string; contrasena: string }) => Promise<void>;
}

export const UsuarioModal: React.FC<UsuarioModalProps> = ({ isOpen, onClose, onSave }) => {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [roleName, setRoleName] = useState('USER_ROLE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setContrasena('');
      setRoleName('USER_ROLE');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onSave(roleName, { email, contrasena });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear el usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Nuevo Usuario del Sistema</h3>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '0.8rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label>Correo Electrónico (Usuario) *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@gym.com"
              />
            </div>

            <div className="form-group">
              <label>Contraseña *</label>
              <input
                type="password"
                required
                minLength={4}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label>Rol de Usuario *</label>
              <select value={roleName} onChange={(e) => setRoleName(e.target.value)}>
                <option value="ADMIN_ROLE">Administrador (ADMIN_ROLE)</option>
                <option value="USER_ROLE">Empleado (USER_ROLE)</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
