import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Personas } from './Personas';
import { Usuarios } from './Usuarios';
import { Bitacora } from './Bitacora';
import { personasService } from '../services/personasService';
import { usuariosService } from '../services/usuariosService';
import { bitacoraService } from '../services/bitacoraService';

type View = 'personas' | 'usuarios' | 'bitacora';

export const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>('personas');

  // Stats state
  const [totalPersonas, setTotalPersonas] = useState<number>(0);
  const [totalUsuarios, setTotalUsuarios] = useState<number>(0);
  const [totalBitacora, setTotalBitacora] = useState<number>(0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [pData, uData, bData] = await Promise.all([
          personasService.getAll().catch(() => []),
          usuariosService.getAll().catch(() => []),
          bitacoraService.getAll().catch(() => [])
        ]);
        setTotalPersonas(Array.isArray(pData) ? pData.length : 0);
        setTotalUsuarios(Array.isArray(uData) ? uData.length : 0);
        setTotalBitacora(Array.isArray(bData) ? bData.length : 0);
      } catch {
        // Fallback silently
      }
    };
    loadStats();
  }, [currentView]);

  const renderView = () => {
    switch (currentView) {
      case 'personas':
        return <Personas />;
      case 'usuarios':
        return <Usuarios />;
      case 'bitacora':
        return <Bitacora />;
      default:
        return <Personas />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-sm)',
          zIndex: 10
        }}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem'
            }}
          >
            G
          </div>
          <div>
            <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>GYM Admin</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gestión Integral</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1.2rem 0' }}>
          <ul style={{ listStyle: 'none' }}>
            <NavItem
              active={currentView === 'personas'}
              onClick={() => setCurrentView('personas')}
              label="Personas / Socios"
              icon="👥"
            />
            <NavItem
              active={currentView === 'usuarios'}
              onClick={() => setCurrentView('usuarios')}
              label="Usuarios Sistema"
              icon="🔐"
            />
            <NavItem
              active={currentView === 'bitacora'}
              onClick={() => setCurrentView('bitacora')}
              label="Bitácora Auditoría"
              icon="📋"
            />
          </ul>
        </nav>

        <div style={{ padding: '1.2rem', borderTop: '1px solid var(--border)', backgroundColor: '#f8fafc' }}>
          <button className="btn-outline" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={logout}>
            <span>🚪</span> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {/* Top Summary Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h4>Socios Registrados</h4>
              <div className="stat-value">{totalPersonas}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔐</div>
            <div className="stat-info">
              <h4>Usuarios Sistema</h4>
              <div className="stat-value">{totalUsuarios}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h4>Movimientos Bitácora</h4>
              <div className="stat-value">{totalBitacora}</div>
            </div>
          </div>
        </div>

        {/* View Component */}
        {renderView()}
      </main>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; label: string; icon: string }> = ({
  active,
  onClick,
  label,
  icon
}) => {
  return (
    <li style={{ marginBottom: '0.3rem' }}>
      <button
        onClick={onClick}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '0.85rem 1.5rem',
          backgroundColor: active ? 'var(--primary-light)' : 'transparent',
          color: active ? 'var(--primary)' : 'var(--text-main)',
          borderLeft: active ? '4px solid var(--primary)' : '4px solid transparent',
          fontWeight: active ? 600 : 400,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.92rem',
          transition: 'all 0.15s ease'
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        {label}
      </button>
    </li>
  );
};
