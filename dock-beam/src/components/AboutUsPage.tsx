import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';

import '../css/AboutUs.css';

export default function AboutUsPage() {
  const { t, i18n } = useTranslation();
  
  // The text for "Valores" (Values)
  const valuesText = t('Pautados na verdade e transparência; Contratação com propósito, conectando talentos e oportunidades de forma estratégica;\n Compromisso com princípios sólidos, guiando nossas decisões com integridade e responsabilidade, pautado na palavra de Deus.');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-us-page" data-lang={i18n.language}>
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero__overlay"></div>
        <div className="about-hero__content">
          <h1 className="about-hero__title">
            Quem somos
          </h1>
          <p className="about-hero__subtitle">
            A Dock Beam tem como foco transformar vidas por meio da inclusão no mercado de trabalho, criando oportunidades que impulsionam tanto indivíduos quanto empresas,  promovendo um impacto econômico e social positivo em escala global. Somos o primeiro aplicativo da America Latina com o foco em empregabilidade para pessoas em situação de refúgio.
          </p>
        </div>
      </section>

      {/* Mission, Vision, and Values Section */}
      <section className="about-content">
        <div className="about-content__container">
          
          <div className="about-section">
            <h2 className="about-section__title">{t('Missão')}</h2>
            <p className='about-section__text'>
              {/* Corrected mission text */}
              {t('Nossa missão é ser casa para o recomeço de pessoas em situação de refúgio. Gerando empregos dignos com um matching inteligente da nossa plataforma, gerando assim um impacto global.')}
            </p>
          </div>

          <div className="about-section">
            <h2 className="about-section__title">{t('Visão')}</h2>
            <p className="about-section__text">
              {t('Nossa visão é ampliar as oportunidades para refugiados em escala global, promovendo sua inclusão no mercado de trabalho e contribuindo para o crescimento econômico dos países onde atuamos. Buscamos operar em todos os continentes, conectando talentos a empresas e impulsionando um futuro mais próspero para todos.')}
            </p>
          </div>

          {/* --- "Valores" section is now here, matching the structure above --- */}
          <div className="about-section">
            <h2 className="about-section__title">{t('Valores')}</h2>
            <p className='about-section__text'>
              {valuesText.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < valuesText.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          </div>

        </div>
      </section>
      
      {/* The old "about-pillars" section has been removed */}
    </div>
  );
}