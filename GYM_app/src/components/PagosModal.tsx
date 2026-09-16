import React, { useEffect, useState } from 'react';
import { personasService, type Persona } from '../services/personasService';
import { DataTable } from './DataTable';

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
  const [tipoPago, setTipoPago] = useState<'MENSUAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL'>('MENSUAL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

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
      setTipoPago('MENSUAL');
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
      await personasService.registrarPago(persona.id, fechaPago, tipoPago);
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
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
                Nuevo Pago de Suscripción / Mensualidad
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="fechaPagoModal">Fecha de Pago *</label>
                  <input
                    type="date"
                    id="fechaPagoModal"
                    value={fechaPago}
                    onChange={(e) => setFechaPago(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="tipoPagoModal">Plan / Duración *</label>
                  <select
                    id="tipoPagoModal"
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
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
            </form>
          )}

          <DataTable<any>
            data={pagos}
            loading={loading}
            keyExtractor={(p, idx) => p.id || idx}
            searchPlaceholder="Buscar por fecha..."
            defaultSortKey="fechaPago"
            defaultSortOrder="desc"
            defaultPageSize={5}
            emptyMessage="No se registran pagos previos para esta persona."
            columns={[
              {
                key: 'id',
                label: '# ID',
                sortable: true,
                sortType: 'number',
                render: (p: any) => `#${p.id || '-'}`,
              },
              {
                key: 'fechaPago',
                label: 'Fecha de Pago',
                sortable: true,
                sortType: 'date',
                getValue: (p) => p.fechaPago || p.fecha,
                render: (p) => <strong>{p.fechaPago || p.fecha || 'N/A'}</strong>,
              },
              {
                key: 'fechaVencimiento',
                label: 'Vencimiento',
                sortable: true,
                sortType: 'date',
                render: (p) => p.fechaVencimiento || '1 mes posterior',
              },
              {
                key: 'tipoPago',
                label: 'Tipo Plan',
                sortable: true,
                render: (p) => p.tipoPago || 'MENSUAL',
              },
              {
                key: 'estado',
                label: 'Estado',
                sortable: true,
                render: (p) => (
                  <span className={`badge ${getBadgeClass(p.estado)}`}>
                    {p.estado || 'Activo'}
                  </span>
                ),
              },
            ]}
          />
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

