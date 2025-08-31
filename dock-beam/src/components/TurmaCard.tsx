import React from 'react';
import type { Turma } from '../hooks/useTurmas';
import '../css/TurmaCard.css';

interface TurmaCardProps {
  turma: Turma;
  onClick: (turmaId: string) => void;
}

export default function TurmaCard({ turma, onClick }: TurmaCardProps) {
  const formatHorarios = () => {
    if (!turma.horarios || turma.horarios.length === 0) {
      return 'Horários não definidos';
    }

    return turma.horarios.map(horario => 
      `${horario.dia_semana}: ${horario.horario_inicio} - ${horario.horario_fim}`
    ).join(' | ');
  };

  const getStatusBadge = () => {
    const currentYear = new Date().getFullYear();
    const [year, semester] = turma.semestre_ano.split('/');
    const turmaYear = parseInt(year);
    
    if (turmaYear > currentYear) {
      return { text: 'Futura', className: 'status-future' };
    } else if (turmaYear < currentYear) {
      return { text: 'Finalizada', className: 'status-finished' };
    } else {
      return { text: 'Ativa', className: 'status-active' };
    }
  };

  const status = getStatusBadge();
  const alunosCount = turma.refugiados?.filter(r => r.status === 'ativo').length || 0;

  return (
    <div 
      className="turma-card" 
      data-idioma={turma.idioma.nome}
      onClick={() => onClick(turma.id)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(turma.id);
        }
      }}
    >
      <div className="turma-card__header">
        <div className="turma-card__title">
          <h3>{turma.semestre_ano} - {turma.idioma.nome} - {turma.nivel_proficiencia}</h3>
          <span className={`turma-card__status ${status.className}`}>
            {status.text}
          </span>
        </div>
      </div>
      
      <div className="turma-card__content">
        <div className="turma-card__info">
          <div className="turma-card__detail">
            <span className="turma-card__label">Idioma:</span>
            <span className="turma-card__value">{turma.idioma.nome}</span>
          </div>
          
          <div className="turma-card__detail">
            <span className="turma-card__label">Nível:</span>
            <span className="turma-card__value">{turma.nivel_proficiencia}</span>
          </div>
          
          <div className="turma-card__detail">
            <span className="turma-card__label">Alunos:</span>
            <span className="turma-card__value">{alunosCount} inscritos</span>
          </div>
        </div>
        
        <div className="turma-card__schedule">
          <span className="turma-card__label">Horários:</span>
          <span className="turma-card__schedule-text">{formatHorarios()}</span>
        </div>
      </div>
      
      <div className="turma-card__arrow">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}
