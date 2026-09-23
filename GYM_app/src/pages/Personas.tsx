import React, { useEffect, useState } from 'react';
import { personasService, type Persona } from '../services/personasService';
import { PersonaModal, type PersonaSaveOptions } from '../components/PersonaModal';
import { PagosModal } from '../components/PagosModal';
import { DataTable } from '../components/DataTable';
import { useAuth } from '../context/AuthContext';

export const Personas: React.FC = () => {
  const { isAdmin } = useAuth();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Modales state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);

  const [selectedPersonaForPagos, setSelectedPersonaForPagos] = useState<Persona | null>(null);
  const [isPagosModalOpen, setIsPagosModalOpen] = useState(false);

  const fetchPersonas = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await personasService.getAll();
      const list = Array.isArray(data) ? data : data?.data || [];
      setPersonas(list);
      setSelectedPersonaForPagos(prev => {
        if (!prev) return null;
        return list.find((p: Persona) => p.id === prev.id) || prev;
      });
    } catch (err: any) {
      setError(err.message || 'Error al obtener personas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

  const handleCreateOpen = () => {
    setEditingPersona(null);
    setIsModalOpen(true);
  };

  const handleEditOpen = (persona: Persona) => {
    setEditingPersona(persona);
    setIsModalOpen(true);
  };

  const handleSavePersona = async (personaData: Partial<Persona>, options?: PersonaSaveOptions) => {
    setSuccessMsg('');
    setError('');
    
    if (editingPersona) {
      await personasService.update(editingPersona.id, personaData);
      setSuccessMsg('Persona actualizada con éxito');
    } else {
      const response = await personasService.create(personaData);
      // Extraer la persona creada del wrapper ApiResponse
      const createdPersona = response?.data || response;
      const createdId = createdPersona?.id;

      if (options?.registrarPagoInmediato && createdId) {
        try {
          await personasService.registrarPago(createdId, options.fechaPago, options.tipoPago);
          setSuccessMsg('Persona registrada y primer pago procesado correctamente');
        } catch (pagoErr: any) {
          setError('Persona creada pero falló el registro del pago: ' + (pagoErr.message || ''));
        }
      } else {
        setSuccessMsg('Persona registrada con éxito');
      }
    }
    await fetchPersonas();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta persona?')) {
      try {
        setSuccessMsg('');
        setError('');
        await personasService.delete(id);
        setSuccessMsg('Persona eliminada');
        await fetchPersonas();
      } catch (err: any) {
        setError(err.message || 'No se pudo eliminar la persona');
      }
    }
  };

  const handleOpenPagos = (persona: Persona) => {
    setSelectedPersonaForPagos(persona);
    setIsPagosModalOpen(true);
  };

  const getBadgeClass = (estado?: string) => {
    if (!estado) return 'badge-info';
    if (estado === 'Activo' || estado === 'VERDE') return 'badge-success';
    if (estado === 'Proximo a vencer' || estado === 'AMARILLO') return 'badge-warning';
    if (estado === 'Vencido' || estado === 'ROJO') return 'badge-danger';
    return 'badge-info';
  };

  if (loading && personas.length === 0) return <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Cargando personas...</div>;

  return (
    <div>
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

      <DataTable<Persona>
        data={personas}
        loading={loading}
        keyExtractor={(p) => p.id}
        searchPlaceholder="Buscar por nombre, correo o teléfono..."
        getSearchValue={(p) => `${p.name || ''} ${p.email || ''} ${p.telefono || ''}`}
        enableDateRangeFilter={true}
        getDateValue={(p) => p.ultimoPago || p.fechaRegistro}
        selectFilters={[
          {
            id: 'estado',
            label: 'Estado',
            options: [
              { label: 'Activos / Verdes', value: 'Activo' },
              { label: 'Próximos a Vencer', value: 'Proximo a vencer' },
              { label: 'Vencidos / Rojos', value: 'Vencido' },
            ],
            filterFn: (p, val) => (p.estado || '').toLowerCase().includes(val.toLowerCase()),
          },
        ]}
        defaultSortKey="name"
        defaultSortOrder="asc"
        emptyMessage="No se encontraron personas registradas"
        extraHeaderActions={
          <button className="btn-primary" onClick={handleCreateOpen}>
            + Nueva Persona
          </button>
        }
        columns={[
          {
            key: 'id',
            label: 'ID',
            sortable: true,
            sortType: 'number',
            render: (p) => `#${p.id}`,
          },
          {
            key: 'name',
            label: 'Nombre Completo',
            sortable: true,
            sortType: 'string',
            render: (p) => <strong>{p.name}</strong>,
          },
          {
            key: 'email',
            label: 'Correo',
            sortable: true,
            sortType: 'string',
            render: (p) => p.email || <span style={{ color: 'var(--text-muted)' }}>-</span>,
          },
          {
            key: 'telefono',
            label: 'Teléfono',
            sortable: true,
            render: (p) => p.telefono || '-',
          },
          {
            key: 'ultimoPago',
            label: 'Último Pago',
            sortable: true,
            sortType: 'date',
            render: (p) => p.ultimoPago || <span style={{ color: 'var(--text-muted)' }}>Sin pagos</span>,
          },
          {
            key: 'fechaVencimiento',
            label: 'Vencimiento',
            sortable: true,
            sortType: 'date',
            render: (p) => p.fechaVencimiento || '-',
          },
          {
            key: 'estado',
            label: 'Estado Pago',
            sortable: true,
            sortType: 'string',
            render: (p) => (
              <span className={`badge ${getBadgeClass(p.estado)}`}>
                {p.estado || 'Activo'}
              </span>
            ),
          },
          {
            key: 'acciones',
            label: 'Acciones',
            sortable: false,
            render: (p) => (
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button
                  className="btn-primary"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                  onClick={() => handleOpenPagos(p)}
                  title="Realizar o ver pagos de mensualidad"
                >
                  Realizar Pago / Historial
                </button>
                {isAdmin && (
                  <>
                    <button
                      className="btn-outline"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      onClick={() => handleEditOpen(p)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-outline"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: '#b91c1c', borderColor: '#fca5a5' }}
                      onClick={() => handleDelete(p.id)}
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            ),
          },
        ]}
      />

      <PersonaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePersona}
        initialData={editingPersona}
      />

      <PagosModal
        isOpen={isPagosModalOpen}
        onClose={() => setIsPagosModalOpen(false)}
        persona={selectedPersonaForPagos}
        onPaymentSuccess={fetchPersonas}
      />
    </div>
  );
};
