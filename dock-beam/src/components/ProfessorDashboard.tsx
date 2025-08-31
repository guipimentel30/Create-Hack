import React, { useEffect } from 'react';
import { useTurmas } from '../hooks/useTurmas';
import TurmaCard from './TurmaCard';
import '../css/UserRegister.css';
import '../css/ProfessorDashboard.css';

export default function ProfessorDashboard() {
  const { turmas, loading, error, clearError } = useTurmas();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleTurmaClick = (turmaId: string) => {
    // TODO: Navigate to turma details page
    console.log('Clicked turma:', turmaId);
  };

  return (
    <div className="user-register-page">
      <div className="register-hero">
        <div className="register-hero__overlay"></div>
        <div className="register-hero__content">
          <div className="register-container">
            <div className="register-header">
              <h2 className="register-header__title">Dashboard do Professor</h2>
              <p className="register-header__subtitle">Gerencie suas turmas e acompanhe o progresso dos alunos</p>
            </div>
            
            <div className="dashboard-content">
              {error && (
                <div className="error-message">
                  <p>Erro ao carregar turmas: {error}</p>
                  <button onClick={clearError}>
                    Tentar novamente
                  </button>
                </div>
              )}

              {loading ? (
                <div className="loading-state">
                  <p>Carregando suas turmas...</p>
                </div>
              ) : turmas.length === 0 ? (
                <div className="empty-state">
                  <h3>Nenhuma turma encontrada</h3>
                  <p>
                    Você ainda não possui turmas cadastradas. Entre em contato com a administração 
                    para que suas turmas sejam criadas no sistema.
                  </p>
                </div>
              ) : (
                <div className="turmas-section">
                  <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>
                    Suas Turmas ({turmas.length})
                  </h3>
                  <div className="turmas-grid">
                    {turmas.map((turma) => (
                      <TurmaCard 
                        key={turma.id} 
                        turma={turma} 
                        onClick={handleTurmaClick}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
