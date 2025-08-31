import { useState, useEffect } from 'react'
import '../css/UserRegister.css'

interface UserTypeSelectionProps {
  onSelectType: (type: 'refugiado' | 'empresa' | 'professor') => void
}

export default function UserTypeSelection({ onSelectType }: UserTypeSelectionProps) {
  const [animateCards, setAnimateCards] = useState(false)

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setAnimateCards(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="user-register-page">
      <div className="register-hero">
        <div className="register-hero__overlay"></div>
        <div className="register-hero__content">
          <div className="register-container">
            <div className="register-header">
              <h2 className="register-header__title">Escolha seu Perfil</h2>
              <p className="register-header__subtitle">Selecione o tipo de cadastro que melhor se adequa ao seu perfil</p>
            </div>

            <div className="user-type-cards">
              <div 
                className={`user-type-card ${animateCards ? 'animate-in' : ''}`}
                onClick={() => onSelectType('refugiado')}
                style={{ animationDelay: '0.1s' }}
              >
                <div className="card-icon">🏠</div>
                <h3 className="card-title">Em Refúgio</h3>
                <p className="card-description">
                  Para pessoas em situação de refúgio que buscam oportunidades de trabalho e integração
                </p>
                <button className="card-button">Cadastrar como Refugiado</button>
              </div>

              <div 
                className={`user-type-card ${animateCards ? 'animate-in' : ''}`}
                onClick={() => onSelectType('empresa')}
                style={{ animationDelay: '0.3s' }}
              >
                <div className="card-icon">🏢</div>
                <h3 className="card-title">Empresa</h3>
                <p className="card-description">
                  Para empresas que desejam contratar talentos e oferecer oportunidades de trabalho
                </p>
                <button className="card-button">Cadastrar Empresa</button>
              </div>

              <div 
                className={`user-type-card ${animateCards ? 'animate-in' : ''}`}
                onClick={() => onSelectType('professor')}
                style={{ animationDelay: '0.5s' }}
              >
                <div className="card-icon">👨‍🏫</div>
                <h3 className="card-title">Professor</h3>
                <p className="card-description">
                  Para educadores que desejam ensinar idiomas e compartilhar conhecimento
                </p>
                <button className="card-button">Cadastrar como Professor</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
