import React, { useEffect, useState } from 'react';
import { bitacoraService, type Bitacora as BitacoraType } from '../services/bitacoraService';
import { DataTable } from '../components/DataTable';

export const Bitacora: React.FC = () => {
  const [logs, setLogs] = useState<BitacoraType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedLog, setSelectedLog] = useState<BitacoraType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBitacora = async () => {
    try {
      setLoading(true);
      const data = await bitacoraService.getAll();
      const list = Array.isArray(data) ? data : [];
      setLogs(list);
    } catch (err: any) {
      setError(err.message || 'Error al obtener la bitácora');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBitacora();
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getActionBadgeClass = (accion?: string) => {
    if (!accion) return 'badge-info';
    const acc = accion.toUpperCase();
    if (acc.includes('CREAR') || acc.includes('REGISTRAR') || acc.includes('INSERT')) return 'badge-success';
    if (acc.includes('ELIMINAR') || acc.includes('BORRAR') || acc.includes('DELETE')) return 'badge-danger';
    if (acc.includes('MODIFICAR') || acc.includes('ACTUALIZAR') || acc.includes('UPDATE')) return 'badge-warning';
    return 'badge-info';
  };

  const handleOpenDetail = (log: BitacoraType) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  if (loading && logs.length === 0) return <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Cargando bitácora de auditoría...</div>;
  if (error) return <div style={{ padding: '1rem', color: '#b91c1c' }}>{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.6rem', fontWeight: 700 }}>Bitácora de Auditoría</h1>
          <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Historial de eventos y movimientos de la aplicación
          </p>
        </div>
      </div>

      <DataTable<BitacoraType>
        data={logs}
        loading={loading}
        keyExtractor={(item) => item.id_bitacora}
        searchPlaceholder="Buscar por usuario, acción, tabla o detalles..."
        getSearchValue={(item) =>
          `${item.accion || ''} ${item.tablaAfectada || ''} ${item.detalles || ''} ${item.usuario?.email || ''}`
        }
        enableDateRangeFilter={true}
        getDateValue={(item) => item.fecha}
        selectFilters={[
          {
            id: 'accion',
            label: 'Acción',
            options: [
              { label: 'Crear Persona', value: 'CREAR_PERSONA' },
              { label: 'Registrar Pago', value: 'REGISTRAR_PAGO' },
              { label: 'Actualizar Persona', value: 'ACTUALIZAR_PERSONA' },
              { label: 'Eliminar Persona', value: 'ELIMINAR_PERSONA' },
            ],
            filterFn: (item, val) => (item.accion || '').toUpperCase().includes(val.toUpperCase()),
          },
        ]}
        defaultSortKey="fecha"
        defaultSortOrder="desc"
        emptyMessage="No se encontraron registros de auditoría"
        columns={[
          {
            key: 'id_bitacora',
            label: 'ID',
            sortable: true,
            sortType: 'number',
            render: (log) => `#${log.id_bitacora}`,
          },
          {
            key: 'fecha',
            label: 'Fecha',
            sortable: true,
            sortType: 'date',
            render: (log) => formatDate(log.fecha),
          },
          {
            key: 'usuario',
            label: 'Usuario',
            sortable: true,
            sortType: 'string',
            getValue: (log) => log.usuario?.email || 'Sistema',
            render: (log) => <strong>{log.usuario?.email || 'Sistema'}</strong>,
          },
          {
            key: 'accion',
            label: 'Acción',
            sortable: true,
            sortType: 'string',
            render: (log) => (
              <span className={`badge ${getActionBadgeClass(log.accion)}`}>
                {log.accion}
              </span>
            ),
          },
          {
            key: 'tablaAfectada',
            label: 'Tabla',
            sortable: true,
            render: (log) => log.tablaAfectada || '-',
          },
          {
            key: 'registroAfectadoId',
            label: 'Registro ID',
            sortable: true,
            sortType: 'number',
            render: (log) => (log.registroAfectadoId ? `#${log.registroAfectadoId}` : '-'),
          },
          {
            key: 'detalles',
            label: 'Detalles',
            sortable: false,
            render: (log) => (
              <button
                className="btn-outline"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                onClick={() => handleOpenDetail(log)}
              >
                Mostrar detalle
              </button>
            ),
          },
        ]}
      />

      {isModalOpen && selectedLog && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3>Detalle del Evento #{selectedLog.id_bitacora}</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>FECHA Y HORA:</strong>
                <p style={{ margin: '0.2rem 0 0 0', fontWeight: 600 }}>{formatDate(selectedLog.fecha)}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>USUARIO:</strong>
                  <p style={{ margin: '0.2rem 0 0 0', fontWeight: 600 }}>{selectedLog.usuario?.email || 'Sistema'}</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>ACCIÓN:</strong>
                  <p style={{ margin: '0.2rem 0 0 0' }}>
                    <span className={`badge ${getActionBadgeClass(selectedLog.accion)}`}>
                      {selectedLog.accion}
                    </span>
                  </p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>TABLA AFECTADA:</strong>
                  <p style={{ margin: '0.2rem 0 0 0', fontWeight: 600 }}>{selectedLog.tablaAfectada || '-'}</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>REGISTRO AFECTADO ID:</strong>
                  <p style={{ margin: '0.2rem 0 0 0', fontWeight: 600 }}>{selectedLog.registroAfectadoId ? `#${selectedLog.registroAfectadoId}` : '-'}</p>
                </div>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>DESCRIPCIÓN / DETALLES DEL CAMBIO:</strong>
                <div style={{
                  marginTop: '0.4rem',
                  padding: '0.8rem',
                  backgroundColor: 'var(--bg-color)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'inherit'
                }}>
                  {selectedLog.detalles || 'Sin detalles especificados'}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
