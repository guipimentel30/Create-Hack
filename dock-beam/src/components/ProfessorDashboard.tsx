import React from 'react';
import '../css/UserRegister.css';

export default function ProfessorDashboard() {
  return (
    <div className="user-register-page">
      <div className="register-hero">
        <div className="register-hero__overlay"></div>
        <div className="register-hero__content">
          <div className="register-container">
            <div className="register-header">
              <h2 className="register-header__title">Dashboard do Professor</h2>
              <p className="register-header__subtitle">Bem-vindo ao seu painel de controle</p>
            </div>
            
            <div className="dashboard-content">
              <p>Esta é a página do dashboard para professores.</p>
              <p>Aqui você poderá gerenciar suas aulas, alunos e horários.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
