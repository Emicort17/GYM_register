import React, { useEffect, useState } from 'react';
import { personasService, type Persona } from '../services/personasService';

interface PagosModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: Persona | null;
}

export const PagosModal: React.FC<PagosModalProps> = ({ isOpen, onClose, persona }) => {
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && persona) {
      const fetchPagos = async () => {
        try {
          setLoading(true);
          setError('');
          const data = await personasService.getPagos(persona.id);
          setPagos(Array.isArray(data) ? data : data?.data || []);
        } catch (err: any) {
          setError(err.message || 'No se pudieron cargar los pagos');
        } finally {
          setLoading(false);
        }
      };
      fetchPagos();
    }
  }, [isOpen, persona]);

  if (!isOpen || !persona) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Historial de Pagos - {persona.name}</h3>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Cargando pagos...</p>
          ) : error ? (
            <p style={{ color: '#b91c1c' }}>{error}</p>
          ) : pagos.length > 0 ? (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Monto</th>
                    <th>Concepto</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map((p, idx) => (
                    <tr key={p.id || idx}>
                      <td>{p.fecha || 'N/A'}</td>
                      <td><strong>${p.monto || '0.00'}</strong></td>
                      <td>{p.concepto || 'Mensualidad Gimnasio'}</td>
                      <td>
                        <span className="badge badge-success">Pagado</span>
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
