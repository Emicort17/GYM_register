import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import headerImg from '../img/WhatsApp Image 2026-08-18 at 10.13.19 PM.jpeg';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.signin({ usuario: username, contrasenia: password });
      login(response.token);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        padding: '1.5rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Curved Header Image */}
        <div
          style={{
            width: '100%',
            height: '210px',
            overflow: 'hidden',
            position: 'relative',
            borderBottomLeftRadius: '50% 35px',
            borderBottomRightRadius: '50% 35px'
          }}
        >
          <img
            src={headerImg}
            alt="Header illustration"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>

        {/* Form Body */}
        <div style={{ padding: '1.8rem 2rem 2.2rem 2rem' }}>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: '#c62828',
              margin: '0 0 1.4rem 0',
              fontFamily: "'Georgia', 'Merriweather', 'Inter', serif",
              letterSpacing: '-0.02em'
            }}
          >
            Hello again!
          </h1>

          {error && (
            <div
              style={{
                backgroundColor: '#ffebee',
                color: '#c62828',
                padding: '0.8rem 1rem',
                borderRadius: '12px',
                marginBottom: '1.2rem',
                fontSize: '0.88rem',
                border: '1px solid #ffcdd2'
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.2rem' }}>
              <label
                htmlFor="username"
                style={{
                  display: 'block',
                  color: '#b91c1c',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  marginBottom: '0.4rem',
                  fontFamily: "'Georgia', 'Merriweather', 'Inter', serif"
                }}
              >
                Email
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your email"
                required
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: '1.5px solid #e0e7ff',
                  fontSize: '0.95rem',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  transition: 'all 0.2s ease-in-out'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.8rem' }}>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  color: '#b91c1c',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  marginBottom: '0.4rem',
                  fontFamily: "'Georgia', 'Merriweather', 'Inter', serif"
                }}
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: '1.5px solid #e0e7ff',
                  fontSize: '0.95rem',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  transition: 'all 0.2s ease-in-out'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.9rem',
                backgroundColor: '#b91c1c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 700,
                fontFamily: "'Georgia', 'Merriweather', 'Inter', serif",
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 16px rgba(99, 102, 241, 0.35)',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {isLoading ? 'Iniciando sesión...' : 'Login'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.2rem' }}>
            <span
              style={{
                fontSize: '0.85rem',
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              Forgot your password?
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
