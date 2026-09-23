import React, { useState, useEffect } from 'react';
import type { Persona } from '../services/personasService';

export interface PersonaSaveOptions {
  registrarPagoInmediato?: boolean;
  fechaPago?: string;
  tipoPago?: 'MENSUAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL';
}

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (personaData: Partial<Persona>, options?: PersonaSaveOptions) => Promise<void>;
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
  const [edad, setEdad] = useState<number | ''>(25);
  
  // Pago inicial opcional
  const [registrarPagoInmediato, setRegistrarPagoInmediato] = useState(true);
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);
  const [tipoPago, setTipoPago] = useState<'MENSUAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL'>('MENSUAL');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      const parts = (initialData.name || '').split(' ');
      setNombres(parts[0] || '');
      setApellidos(parts.slice(1).join(' ') || '');
      setCorreo(initialData.email || '');
      setTelefono(initialData.telefono || '');
      setEdad(initialData.age || 25);
      setRegistrarPagoInmediato(false); // Default to false when editing existing persona
    } else {
      setNombres('');
      setApellidos('');
      setCorreo('');
      setTelefono('');
      setEdad(25);
      setRegistrarPagoInmediato(true); // Default to true when creating new persona
      setFechaPago(new Date().toISOString().split('T')[0]);
      setTipoPago('MENSUAL');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const personaPayload: Partial<Persona> = {
        name: `${nombres.trim()} ${apellidos.trim()}`.trim(),
        email: correo.trim() || null,
        telefono: telefono.trim(),
        age: typeof edad === 'number' ? edad : 25
      };

      const saveOptions: PersonaSaveOptions = {
        registrarPagoInmediato: !initialData && registrarPagoInmediato,
        fechaPago,
        tipoPago
      };

      await onSave(personaPayload, saveOptions);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la persona');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
        <div className="modal-header">
          <h3>{initialData ? 'Editar Persona / Socio' : 'Nueva Persona / Socio'}</h3>
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
                <label htmlFor="nombres">Nombres *</label>
                <input
                  id="nombres"
                  type="text"
                  required
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  placeholder="Ej. Juan Carlos"
                />
              </div>

              <div className="form-group">
                <label htmlFor="apellidos">Apellidos *</label>
                <input
                  id="apellidos"
                  type="text"
                  required
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  placeholder="Ej. Pérez Gómez"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="correo">Correo Electrónico (opcional)</label>
                <input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="juan.perez@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono *</label>
                <input
                  id="telefono"
                  type="text"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej. 8888-9999"
                />
              </div>
            </div>

            <div className="form-group" style={{ maxWidth: '200px' }}>
              <label htmlFor="edad">Edad *</label>
              <input
                id="edad"
                type="number"
                min="1"
                max="120"
                required
                value={edad}
                onChange={(e) => setEdad(e.target.value ? parseInt(e.target.value, 10) : '')}
                placeholder="Ej. 25"
              />
            </div>

            {/* Opciones de Registro de Pago Inmediato (Solo al crear nueva persona) */}
            {!initialData && (
              <div style={{
                marginTop: '1.2rem',
                padding: '1rem',
                backgroundColor: 'var(--bg-color)',
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600, color: 'var(--primary)' }}>
                  <input
                    type="checkbox"
                    checked={registrarPagoInmediato}
                    onChange={(e) => setRegistrarPagoInmediato(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  Registrar primer pago de mensualidad inmediatamente
                </label>

                {registrarPagoInmediato && (
                  <div style={{ marginTop: '0.8rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="fechaPagoInicial">Fecha del Pago *</label>
                      <input
                        id="fechaPagoInicial"
                        type="date"
                        required={registrarPagoInmediato}
                        value={fechaPago}
                        onChange={(e) => setFechaPago(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="tipoPagoInicial">Plan / Cantidad de Meses *</label>
                      <select
                        id="tipoPagoInicial"
                        value={tipoPago}
                        onChange={(e) => setTipoPago(e.target.value as any)}
                      >
                        <option value="MENSUAL">Mensual (1 Mes)</option>
                        <option value="TRIMESTRAL">Trimestral (3 Meses)</option>
                        <option value="SEMESTRAL">Semestral (6 Meses)</option>
                        <option value="ANUAL">Anual (12 Meses)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar Persona' : 'Guardar y Continuar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
