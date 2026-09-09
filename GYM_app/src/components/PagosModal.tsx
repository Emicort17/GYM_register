import React, { useEffect, useState } from 'react';
import { personasService, type Persona } from '../services/personasService';

interface PagosModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: Persona | null;
  onPaymentSuccess?: () => void;
}

export const PagosModal: React.FC<PagosModalProps> = ({
  isOpen,
  onClose,
  persona,
  onPaymentSuccess
}) => {
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Registrar nuevo pago state
  const [showAddForm, setShowAddForm] = useState(false);
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchPagos = async () => {
    if (!persona) return;
    try {
      setLoading(true);
      setError('');
      const data = await personasService.getPagos(persona.id);
      const list = Array.isArray(data) ? data : data?.data || [];
      setPagos(list);
    } catch (err: any) {
      setError(err.message || 'No se pudieron cargar los pagos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && persona) {
      fetchPagos();
      setShowAddForm(false);
      setFechaPago(new Date().toISOString().split('T')[0]);
      setSuccessMsg('');
      setError('');
    }
  }, [isOpen, persona]);

  if (!isOpen || !persona) return null;

  const handleRegistrarPago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!persona) return;
    try {
      setIsSubmitting(true);
      setError('');
      setSuccessMsg('');
      await personasService.registrarPago(persona.id, fechaPago);
      setSuccessMsg('¡Pago registrado con éxito!');
      setShowAddForm(false);
      await fetchPagos();
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Error al registrar el pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBadgeClass = (estado?: string) => {
    if (!estado) return 'badge-info';
    if (estado === 'Activo' || estado === 'VERDE') return 'badge-success';
    if (estado === 'Proximo a vencer' || estado === 'AMARILLO') return 'badge-warning';
    if (estado === 'Vencido' || estado === 'ROJO') return 'badge-danger';
    return 'badge-info';
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <div className="modal-header">
          <h3>Historial de Pagos - {persona.name}</h3>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Estado actual: <strong style={{ color: 'var(--text-main)' }}>{persona.estado || 'Sin Registro'}</strong>
            </span>

            {!showAddForm && (
              <button
                type="button"
                className="btn-primary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                onClick={() => setShowAddForm(true)}
              >
                + Registrar Nuevo Pago
              </button>
            )}
          </div>

          {showAddForm && (
            <form
              onSubmit={handleRegistrarPago}
              style={{
                backgroundColor: 'var(--bg-color)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                marginBottom: '1.2rem'
              }}
            >
              <h4 style={{ margin: '0 0 0.8rem 0', color: 'var(--primary)', fontSize: '0.95rem' }}>
                Nuevo Pago de Mensualidad
              </h4>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
                  <label htmlFor="fechaPagoModal">Fecha de Pago</label>
                  <input
                    type="date"
                    id="fechaPagoModal"
                    value={fechaPago}
                    onChange={(e) => setFechaPago(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowAddForm(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : 'Confirmar Pago'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Cargando historial de pagos...</p>
          ) : pagos.length > 0 ? (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th># ID</th>
                    <th>Fecha de Pago</th>
                    <th>Vencimiento</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map((p, idx) => (
                    <tr key={p.id || idx}>
                      <td>#{p.id || idx + 1}</td>
                      <td>
                        <strong>{p.fechaPago || p.fecha || 'N/A'}</strong>
                      </td>
                      <td>{p.fechaVencimiento || '1 mes posterior'}</td>
                      <td>
                        <span className={`badge ${getBadgeClass(p.estado)}`}>
                          {p.estado || 'Activo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              No se registran pagos previos para esta persona.
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
