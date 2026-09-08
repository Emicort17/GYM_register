import React, { useState, useEffect } from 'react';
import type { Persona } from '../services/personasService';

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (personaData: Partial<Persona>) => Promise<void>;
  initialData?: Persona | null;
}

export const PersonaModal: React.FC<PersonaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fecha_registro, setFechaRegistro] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      // Split name back into nombres and apellidos if possible, or just put it all in nombres
      const parts = (initialData.name || '').split(' ');
      setNombres(parts[0] || '');
      setApellidos(parts.slice(1).join(' ') || '');
      setCorreo(initialData.email || '');
      setTelefono(initialData.telefono || '');
      setFechaRegistro('');
    } else {
      setNombres('');
      setApellidos('');
      setCorreo('');
      setTelefono('');
      setFechaRegistro('');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Compute age from fechaNacimiento
      let age = 0;
      if (fecha_registro) {
        const diff_ms = Date.now() - new Date(fecha_registro).getTime();
        const age_dt = new Date(diff_ms);
        age = Math.abs(age_dt.getUTCFullYear() - 1970);
      }

      await onSave({
        name: `${nombres} ${apellidos}`.trim(),
        email: correo,
        telefono,
        age
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la persona');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initialData ? 'Editar Persona' : 'Nueva Persona'}</h3>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '0.8rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Nombres *</label>
                <input
                  type="text"
                  required
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  placeholder="Ej. Juan Carlos"
                />
              </div>

              <div className="form-group">
                <label>Apellidos *</label>
                <input
                  type="text"
                  required
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  placeholder="Ej. Pérez Gómez"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. 8888-9999"
              />
            </div>

            <div className="form-group">
              <label>Correo Electrónico *</label>
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="juan.perez@example.com"
              />
            </div>

            <div className="form-group">
              <label>Fecha de Registro</label>
              <input
                type="date"
                value={fecha_registro}
                onChange={(e) => setFechaRegistro(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
