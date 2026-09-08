import React, { useEffect, useState } from 'react';
import { personasService, type Persona } from '../services/personasService';
import { PersonaModal } from '../components/PersonaModal';
import { PagosModal } from '../components/PagosModal';

export const Personas: React.FC = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [filteredPersonas, setFilteredPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
          p.email?.toLowerCase().includes(term)
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

  const handleSavePersona = async (personaData: Partial<Persona>) => {
    if (editingPersona) {
      await personasService.update(editingPersona.id, personaData);
    } else {
      await personasService.create(personaData);
    }
    await fetchPersonas();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta persona?')) {
      try {
        await personasService.delete(id);
        await fetchPersonas();
      } catch (err: any) {
        alert(err.message || 'No se pudo eliminar la persona');
      }
    }
  };

  const handleOpenPagos = (persona: Persona) => {
    setSelectedPersonaForPagos(persona);
    setIsPagosModalOpen(true);
  };

  if (loading) return <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Cargando personas...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.6rem', fontWeight: 700 }}>Gestión de Personas</h1>
          <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Registro de socios y clientes del gimnasio
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '280px' }}
          />
          <button className="btn-primary" onClick={handleCreateOpen}>
            + Nueva Persona
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '0.8rem', borderRadius: '6px', marginBottom: '1rem' }}>
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
              <th>Estado Pago</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPersonas.length > 0 ? (
              filteredPersonas.map((p) => {
                let badgeClass = 'badge-info';
                if (p.estado === 'Activo') badgeClass = 'badge-success';
                if (p.estado === 'Proximo a vencer') badgeClass = 'badge-warning';
                if (p.estado === 'Vencido') badgeClass = 'badge-danger';

                return (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>
                      <strong>{p.name}</strong>
                    </td>
                    <td>{p.email}</td>
                    <td>{p.telefono || '-'}</td>
                    <td>
                      <span className={`badge ${badgeClass}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn-outline"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                          onClick={() => handleOpenPagos(p)}
                        >
                          Pagos
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
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
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
      />
    </div>
  );
};
