import React, { useEffect, useState } from 'react';
import { personasService, type Persona } from '../services/personasService';
import { PersonaModal, type PersonaSaveOptions } from '../components/PersonaModal';
import { PagosModal } from '../components/PagosModal';

export const Personas: React.FC = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [filteredPersonas, setFilteredPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
      setFilteredPersonas(list);
    } catch (err: any) {
      setError(err.message || 'Error al obtener personas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPersonas(personas);
      return;
    }
    const term = searchTerm.toLowerCase();
    setFilteredPersonas(
      personas.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.email?.toLowerCase().includes(term) ||
          p.telefono?.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, personas]);

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
          await personasService.registrarPago(createdId, options.fechaPago);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.6rem', fontWeight: 700 }}>Gestión de Personas y Pagos</h1>
          <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Registro de socios, cobro de mensualidades y control de vencimientos
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar por nombre, correo o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '280px' }}
          />
          <button className="btn-primary" onClick={handleCreateOpen}>
            + Nueva Persona
          </button>
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

      <div className="card table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Último Pago</th>
              <th>Vencimiento</th>
              <th>Estado Pago</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPersonas.length > 0 ? (
              filteredPersonas.map((p) => {
                const badgeClass = getBadgeClass(p.estado);

                return (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>
                      <strong>{p.name}</strong>
                    </td>
                    <td>{p.email}</td>
                    <td>{p.telefono || '-'}</td>
                    <td>{p.ultimoPago || <span style={{ color: 'var(--text-muted)' }}>Sin pagos</span>}</td>
                    <td>{p.fechaVencimiento || '-'}</td>
                    <td>
                      <span className={`badge ${badgeClass}`}>
                        {p.estado || 'Activo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button
                          className="btn-primary"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                          onClick={() => handleOpenPagos(p)}
                          title="Realizar o ver pagos de mensualidad"
                        >
                          Realizar Pago / Historial
                        </button>
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
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No se encontraron personas registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
