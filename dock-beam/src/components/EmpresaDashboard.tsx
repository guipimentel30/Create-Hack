import React, { useState, useEffect } from 'react';
import { useVagas } from '../hooks/useVagas';
import VagaForm from './VagaForm';
import VagaEditForm from './VagaEditForm';
import '../css/UserRegister.css';
import '../css/EmpresaDashboard.css';

interface CreateVagaData {
  titulo: string;
  idioma_id: number;
  area_atuacao_id: number;
  descricao?: string;
  requisitos?: string;
  salario_min?: number;
  salario_max?: number;
}

export default function EmpresaDashboard() {
  const { vagas, loading, error, stats, encerrarVaga, createVaga, updateVaga, deleteVaga, clearError, getVagaById, getCandidaturasByVaga } = useVagas();
  const [selectedVaga, setSelectedVaga] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingVaga, setEditingVaga] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [candidaturas, setCandidaturas] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCreateJob = () => {
    setShowCreateForm(true);
  };

  const handleCreateVaga = async (vagaData: CreateVagaData) => {
    setCreating(true);
    try {
      await createVaga(vagaData);
      setShowCreateForm(false);
      // Success feedback could be added here
    } catch (err) {
      console.error('Erro ao criar vaga:', err);
      // Error handling could be improved here
    } finally {
      setCreating(false);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  const handleViewCandidates = async (vagaId: string) => {
    setSelectedVaga(vagaId);
    setLoadingCandidates(true);
    try {
      const candidaturasList = await getCandidaturasByVaga(vagaId);
      setCandidaturas(candidaturasList);
    } catch (err) {
      console.error('Erro ao carregar candidatos:', err);
      setCandidaturas([]);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleEditJob = (vagaId: string) => {
    setEditingVaga(vagaId);
  };

  const handleUpdateVaga = async (vagaId: string, vagaData: CreateVagaData) => {
    try {
      await updateVaga(vagaId, vagaData);
      setEditingVaga(null);
    } catch (err) {
      console.error('Erro ao atualizar vaga:', err);
      throw err;
    }
  };

  const handleDeleteVaga = async (vagaId: string) => {
    try {
      await deleteVaga(vagaId);
      setEditingVaga(null);
    } catch (err) {
      console.error('Erro ao deletar vaga:', err);
      throw err;
    }
  };

  const handleCancelEdit = () => {
    setEditingVaga(null);
  };

  const handleCloseJob = async (vagaId: string) => {
    try {
      await encerrarVaga(vagaId);
    } catch (err) {
      console.error('Erro ao encerrar vaga:', err);
    }
  };

  // Show edit form
  if (editingVaga) {
    const vaga = getVagaById(editingVaga);
    if (!vaga) {
      setEditingVaga(null);
      return null;
    }
    
    return (
      <VagaEditForm 
        vaga={vaga}
        onUpdate={handleUpdateVaga}
        onDelete={handleDeleteVaga}
        onCancel={handleCancelEdit}
      />
    );
  }

  // Show create form
  if (showCreateForm) {
    return (
      <VagaForm 
        onSubmit={handleCreateVaga}
        onCancel={handleCancelCreate}
        loading={creating}
      />
    );
  }

  if (selectedVaga) {
    const vaga = getVagaById(selectedVaga);
    const candidaturasList = vaga ? vaga.candidaturas : [];

    return (
      <div className="user-register-page">
        <div className="register-hero">
          <div className="register-hero__overlay"></div>
          <div className="register-hero__content">
            <div className="register-container">
              <button onClick={() => setSelectedVaga(null)}>← Voltar</button>
              <h2>Candidatos da Vaga</h2>
              {loadingCandidates ? (
                <div className="loading-state">
                  <p>Carregando candidatos...</p>
                </div>
              ) : candidaturas.length === 0 ? (
                <div className="empty-candidates">
                  <p>Nenhum candidato encontrado para esta vaga.</p>
                </div>
              ) : (
                <div className="candidates-list">
                  {candidaturas.map((candidatura) => (
                    <div key={candidatura.id} className="candidate-card">
                      <div className="candidate-info">
                        <h4 className="candidate-name">
                          {candidatura.refugiado?.nome || 'Nome não disponível'}
                        </h4>
                        <p className="candidate-age">
                          Idade: {candidatura.refugiado?.idade || 'N/A'} anos
                        </p>
                        <p className="candidate-nationality">
                          Nacionalidade: {candidatura.refugiado?.nacionalidade || 'N/A'}
                        </p>
                      </div>
                      <div className="candidate-status">
                        <span className={`status-badge ${candidatura.status}`}>
                          {candidatura.status === 'aplicado' ? 'Aplicado' :
                           candidatura.status === 'em_analise' ? 'Em Análise' :
                           candidatura.status === 'aprovado' ? 'Aprovado' :
                           candidatura.status === 'reprovado' ? 'Reprovado' :
                           'Entrevista Agendada'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-register-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="company-info">
          <div className="company-logo">
            E
          </div>
          <h1 className="company-name">Minha Empresa</h1>
        </div>
        <div className="header-actions">
          <button className="create-job-btn" onClick={handleCreateJob}>
            Criar Vaga
          </button>
          <div className="user-menu">
            <button className="user-menu-btn">
               Menu
            </button>
          </div>
        </div>
      </div>

      <div className="register-hero">
        <div className="register-hero__overlay"></div>
        <div className="register-hero__content">
          <div className="register-container">
            <div className="register-header">
              <h2 className="register-header__title">Dashboard da Empresa</h2>
              <p className="register-header__subtitle">Gerencie suas vagas e encontre os melhores talentos</p>
            </div>
            
            <div className="dashboard-content">
              {error && (
                <div className="error-message">
                  <p>Erro ao carregar dados: {error}</p>
                  <button onClick={clearError}>
                    Tentar novamente
                  </button>
                </div>
              )}

              {loading ? (
                <div className="loading-state">
                  <p>Carregando dashboard...</p>
                </div>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div className="summary-cards">
                    <div className="summary-card vagas-abertas">
                      <div className="summary-card-header">
                        <h3 className="summary-card-title">Vagas Abertas</h3>
                      </div>
                      <p className="summary-card-value">{stats.vagasAbertas}</p>
                    </div>
                    
                    <div className="summary-card novos-candidatos">
                      <div className="summary-card-header">
                        <h3 className="summary-card-title">Novos Candidatos</h3>
                        <span className="summary-card-icon">👥</span>
                      </div>
                      <p className="summary-card-value">{stats.novosCandidatos}</p>
                    </div>
                  </div>

                  {/* Job Listings */}
                  <div className="jobs-section">
                    <div className="jobs-header">
                      <h3 className="jobs-title">Suas Vagas ({vagas.length})</h3>
                    </div>

                    {vagas.length === 0 ? (
                      <div className="empty-jobs">
                        <h3>Nenhuma vaga cadastrada</h3>
                        <p>Comece criando sua primeira vaga para atrair talentos!</p>
                        <button className="create-job-btn" onClick={handleCreateJob}>
                          Criar Primeira Vaga
                        </button>
                      </div>
                    ) : (
                      <div className="jobs-list">
                        {vagas.map((vaga) => (
                          <div key={vaga.id} className="job-card">
                            <div className="job-card-header">
                              <div className="job-info">
                                <h4 className="job-title">{vaga.titulo}</h4>
                                <div className="job-details">
                                  <span className="job-language">
                                   {vaga.idioma.nome} - {vaga.nivel_proficiencia}
                                  </span>
                                  <span className="job-candidates">
                                    {vaga.candidaturas_count} candidatos
                                  </span>
                                </div>
                              </div>
                              <span className={`job-status ${vaga.status}`}>
                                {vaga.status === 'ativa' ? 'Ativa' : 
                                 vaga.status === 'encerrada' ? 'Encerrada' : 'Pausada'}
                              </span>
                            </div>
                            
                            <div className="job-actions">
                              <button 
                                className="job-action-btn primary"
                                onClick={() => handleViewCandidates(vaga.id)}
                              >
                                Ver Candidatos
                              </button>
                              <button 
                                className="job-action-btn secondary"
                                onClick={() => handleEditJob(vaga.id)}
                              >
                                Editar
                              </button>
                              {vaga.status === 'ativa' && (
                                <button 
                                  className="job-action-btn danger"
                                  onClick={() => handleCloseJob(vaga.id)}
                                >
                                  Encerrar
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
