import React from 'react';
import '../css/UserRegister.css';

export default function RefugiadoDashboard() {
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
              <p>Esta é a página do dashboard para refugiados.</p>
              <p>Aqui você poderá encontrar oportunidades de trabalho e acompanhar suas candidaturas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
