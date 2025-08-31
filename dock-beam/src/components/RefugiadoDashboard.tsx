import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTurmas } from '../hooks/useTurmas';
import { useRefugiado } from '../hooks/useRefugiado';
import '../css/UserRegister.css';
import '../css/RefugiadoDashboard.css';

export default function RefugiadoDashboard() {
  const { turmas, loading: turmasLoading, error: turmasError } = useTurmas();
  const { 
    vagas, 
    candidaturas, 
    vagasLoading, 
    candidaturasLoading, 
    vagasError, 
    candidaturasError, 
    createCandidatura, 
    fetchVagasDisponiveis,
    fetchMinhasCandidaturas 
  } = useRefugiado();
  const [selectedView, setSelectedView] = useState<'dashboard' | 'turma' | 'empregos'>('dashboard');
  const [activeTab, setActiveTab] = useState<'oportunidades' | 'candidaturas'>('oportunidades');
  const [applyingToVaga, setApplyingToVaga] = useState<string | null>(null);
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check if refugee belongs to any turma (mock logic for now)
  const refugiadoTurma = turmas && turmas.length > 0 ? turmas[0] : null;

  // Filter only active job postings for refugees to see
  const vagasAtivas = vagas.filter(vaga => vaga.status === 'ativa');

  const handleTurmaClick = () => {
    setSelectedView('turma');
  };

  const handleEmpregoClick = () => {
    setSelectedView('empregos');
  };

  const handleBackToDashboard = () => {
    setSelectedView('dashboard');
  };

  const handleTabChange = (tab: 'oportunidades' | 'candidaturas') => {
    setActiveTab(tab);
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'A combinar';
    if (min && max) return `R$ ${min.toLocaleString()} - R$ ${max.toLocaleString()}`;
    if (min) return `A partir de R$ ${min.toLocaleString()}`;
    if (max) return `Até R$ ${max.toLocaleString()}`;
    return 'A combinar';
  };

  const handleCandidatar = async (vagaId: string) => {
    setApplyingToVaga(vagaId);
    try {
      await createCandidatura(vagaId);
      await fetchVagasDisponiveis();
      await fetchMinhasCandidaturas();
      alert('Candidatura enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar candidatura:', error);
      alert(error instanceof Error ? error.message : 'Erro ao enviar candidatura. Tente novamente.');
    } finally {
      setApplyingToVaga(null);
    }
  };

  if (selectedView === 'turma') {
    return (
      <div className="user-register-page">
        <div className="register-hero">
          <div className="register-hero__overlay"></div>
          <div className="register-hero__content">
            <div className="register-container">
              <button className="back-button" onClick={handleBackToDashboard}>
                ← Voltar ao Dashboard
              </button>
              <div className="register-header">
                <h2 className="register-header__title">Acompanhamento da Turma</h2>
                <p className="register-header__subtitle">
                  {refugiadoTurma ? 'Sua turma atual' : 'Turmas disponíveis para inscrição'}
                </p>
              </div>
              
              <div className="turma-content">
                {refugiadoTurma ? (
                  <div className="current-turma">
                    <div className="turma-info-card">
                      <h3>{refugiadoTurma.idioma?.nome} - {refugiadoTurma.nivel_proficiencia}</h3>
                      <p><strong>Semestre:</strong> {refugiadoTurma.semestre_ano}</p>
                      <p><strong>Professor:</strong> {refugiadoTurma.professor?.nome || 'A definir'}</p>
                      <div className="progress-section">
                        <h4>Progresso do Curso</h4>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width: '65%'}}></div>
                        </div>
                        <p>65% concluído</p>
                      </div>
                      <div className="next-class">
                        <h4>Próxima Aula</h4>
                        <p>Terça-feira, 14:00 - Conversação Básica</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="available-turmas">
                    <h3>Turmas Abertas para Inscrição</h3>
                    <div className="turmas-grid">
                      {turmas?.map((turma) => (
                        <div key={turma.id} className="turma-card">
                          <h4>{turma.idioma?.nome} - {turma.nivel_proficiencia}</h4>
                          <p><strong>Semestre:</strong> {turma.semestre_ano}</p>
                          <p><strong>Professor:</strong> {turma.professor?.nome || 'A definir'}</p>
                          <button className="inscricao-btn">
                            Inscrever-se
                          </button>
                        </div>
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

  if (selectedView === 'empregos') {
    return (
      <div className="user-register-page">
        <div className="register-hero">
          <div className="register-hero__overlay"></div>
          <div className="register-hero__content">
            <div className="register-container">
              <button className="back-button" onClick={handleBackToDashboard}>
                ← Voltar ao Dashboard
              </button>
              <div className="register-header">
                <h2 className="register-header__title">Área Empregatícia</h2>
                <p className="register-header__subtitle">Encontre vagas e acompanhe suas candidaturas</p>
              </div>
              
              <div className="emprego-content">
                <div className="emprego-tabs">
                  <button 
                    className={`tab-button ${activeTab === 'oportunidades' ? 'active' : ''}`}
                    onClick={() => handleTabChange('oportunidades')}
                  >
                    Oportunidades Abertas
                  </button>
                  <button 
                    className={`tab-button ${activeTab === 'candidaturas' ? 'active' : ''}`}
                    onClick={() => handleTabChange('candidaturas')}
                  >
                    Minhas Candidaturas
                  </button>
                </div>
                
                {activeTab === 'oportunidades' && (
                  <div className="vagas-section">
                    <h3>Vagas Disponíveis ({vagasAtivas.length})</h3>
                    
                    {vagasLoading ? (
                      <div className="loading-state">
                        <p>Carregando vagas...</p>
                      </div>
                    ) : vagasError ? (
                      <div className="error-message">
                        <p>Erro ao carregar vagas: {vagasError}</p>
                      </div>
                    ) : vagasAtivas.length === 0 ? (
                      <div className="empty-vagas">
                        <h4>Nenhuma vaga disponível no momento</h4>
                        <p>Novas oportunidades aparecerão aqui em breve!</p>
                      </div>
                    ) : (
                      <div className="vagas-grid">
                        {vagasAtivas.map((vaga) => (
                          <div key={vaga.id} className="vaga-card">
                            <h4>{vaga.titulo}</h4>
                            <p><strong>Idioma:</strong> {vaga.idioma?.nome} - {vaga.nivel_proficiencia}</p>
                            <p><strong>Salário:</strong> {formatSalary(vaga.salario_min, vaga.salario_max)}</p>
                            {vaga.descricao && (
                              <p><strong>Descrição:</strong> {vaga.descricao}</p>
                            )}
                            {vaga.requisitos && (
                              <p><strong>Requisitos:</strong> {vaga.requisitos}</p>
                            )}
                            <div className="vaga-meta">
                              <span className="candidatos-count">
                                {vaga.candidaturas_count} candidatos
                              </span>
                              <span className="data-publicacao">
                                Publicado em {new Date(vaga.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <button 
                              className="candidatar-btn"
                              onClick={() => handleCandidatar(vaga.id)}
                              disabled={applyingToVaga === vaga.id}
                            >
                              {applyingToVaga === vaga.id ? 'Enviando...' : 'Candidatar-se'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'candidaturas' && (
                  <div className="candidaturas-section">
                    <h3>Minhas Candidaturas ({candidaturas.length})</h3>
                    
                    {candidaturasLoading ? (
                      <div className="loading-state">
                        <p>Carregando candidaturas...</p>
                      </div>
                    ) : candidaturasError ? (
                      <div className="error-message">
                        <p>Erro ao carregar candidaturas: {candidaturasError}</p>
                      </div>
                    ) : candidaturas.length === 0 ? (
                      <div className="empty-candidaturas">
                        <h4>Você ainda não se candidatou a nenhuma vaga</h4>
                        <p>Suas candidaturas aparecerão aqui quando você se aplicar para vagas.</p>
                        <button 
                          className="ver-vagas-btn"
                          onClick={() => handleTabChange('oportunidades')}
                        >
                          Ver Vagas Disponíveis
                        </button>
                      </div>
                    ) : (
                      <div className="candidaturas-grid">
                        {candidaturas.map((candidatura) => (
                          <div key={candidatura.id} className="candidatura-card">
                            <h4>{candidatura.vaga.titulo}</h4>
                            <p><strong>ID da Vaga:</strong> {candidatura.vaga.id}</p>
                            <p><strong>Setor:</strong> {candidatura.vaga.area_atuacao.nome}</p>
                            <p><strong>Data da Candidatura:</strong> {new Date(candidatura.created_at).toLocaleDateString('pt-BR')}</p>
                            <div className="candidatura-status">
                              <span className={`status-badge status-${candidatura.status}`}>
                                {candidatura.status === 'aplicado' && 'Aplicado'}
                                {candidatura.status === 'em_analise' && 'Em Análise'}
                                {candidatura.status === 'aprovado' && 'Aprovado'}
                                {candidatura.status === 'rejeitado' && 'Rejeitado'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-register-page">
      <div className="register-hero">
        <div className="register-hero__overlay"></div>
        <div className="register-hero__content">
          <div className="register-container">
            <div className="register-header">
              <h2 className="register-header__title">Dashboard do Refugiado</h2>
              <p className="register-header__subtitle">Bem-vindo ao seu painel de oportunidades</p>
            </div>
            
            <div className="dashboard-content">
              <div className="dashboard-cards">
                <div className="dashboard-card turma-card" onClick={handleTurmaClick}>
                  <div className="card-icon">📚</div>
                  <div className="card-content">
                    <h3>
                      {refugiadoTurma ? 'Acompanhamento da Turma' : 'Inscrever-se em Turma'}
                    </h3>
                    <p>
                      {refugiadoTurma 
                        ? `Sua turma: ${refugiadoTurma.idioma?.nome} - ${refugiadoTurma.nivel_proficiencia}`
                        : 'Encontre uma turma de idioma adequada ao seu nível e comece a aprender'
                      }
                    </p>
                    {refugiadoTurma && (
                      <div className="card-progress">
                        <span>Progresso: 65%</span>
                        <div className="mini-progress-bar">
                          <div className="mini-progress-fill" style={{width: '65%'}}></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="card-arrow">→</div>
                </div>

                <div className="dashboard-card emprego-card" onClick={handleEmpregoClick}>
                  <div className="card-icon">💼</div>
                  <div className="card-content">
                    <h3>Área Empregatícia</h3>
                    <p>Encontre vagas de trabalho adequadas ao seu perfil e acompanhe suas candidaturas</p>
                    <div className="card-stats">
                      <span>{vagasAtivas.length} vagas disponíveis</span>
                      <span>•</span>
                      <span>{candidaturas.length} candidaturas ativas</span>
                    </div>
                  </div>
                  <div className="card-arrow">→</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
