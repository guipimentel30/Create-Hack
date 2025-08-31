import partnerLogo1 from '../images/partners/6.jpg';
import partnerLogo2 from '../images/partners/4.jpg';
import partnerLogo3 from '../images/partners/5.jpg';
import partnerLogo4 from '../images/partners/2.jpg';

import '../css/partners.css';

// Mock for useTranslation to avoid dependency errors
const useTranslation = () => {
  const t = (key: string) => key; // Just return the key as fallback
  const i18n = { language: 'pt-BR' }; // Default language
  return { t, i18n };
};

export default function PartnersPage() {
  const { t, i18n } = useTranslation();

  // Create an array of partner objects
const partners = [
  { name: 'Parceiro 1', logo: partnerLogo1, alt: 'Logo do Parceiro 1' },
  { name: 'Parceiro 2', logo: partnerLogo2, alt: 'Logo do Parceiro 2' },
  { name: 'Parceiro 3', logo: partnerLogo3, alt: 'Logo do Parceiro 3' },
  { name: 'Parceiro 4', logo: partnerLogo4, alt: 'Logo do Parceiro 4' },
];

  return (
    <div className="partners-page" data-lang={i18n.language}>
      {/* Hero Section */}
      <section className="partners-hero">
        <div className="partners-hero__overlay"></div>
        <div className="partners-hero__content">
          <h1 className="partners-hero__title">A esperança é para todos!</h1>
          <p className="partners-hero__subtitle">
            Em um mundo marcado por crises humanitárias, milhares de refugiados enfrentam um dos maiores desafios da sua vida: a inclusão no mercado de trabalho. Em muitos casos, o desemprego entre os refugiados ultrapassa os 50%, e a oportunidade de reconstruir suas vidas parece cada vez mais distante. 
Mas isso não precisa ser assim.
          </p>
        </div>
      </section>

{/* Partners Grid Section */}
<section className="partners-grid-section">
  <div className="partners-grid-section__container">
    <h2 className="partners-grid-section__title">
      {t('Conheça nossos parceiros:')}
    </h2>
    <div className="partners-grid">
      {/* Map over the 'partners' array */}
      {partners.map((partner, idx) => (
        <div key={idx} className="partner-logo-card">
          {/* Use the image from the partner object */}
          <img src={partner.logo} alt={partner.alt} />
        </div>
      ))}
    </div>
  </div>
</section>

      {/* Call to Action Section */}
      <section className="partners-grid-section">
        <div className="partners-cta__container">
          <div className="partners-cta__content">
            <h2 className="partners-cta__title">{t('Seja um parceiro!')}</h2>
            <p className="partners-cta__text">
              {t(
                'Interessado em se tornar um parceiro e ajudar a construir um futuro melhor? Entre em contato conosco.'
              )}
            </p>
          </div>
          <div className="partners-cta__buttons">
            {/*<button className="cta-button cta-button--partner">
              {t('Seja um Parceiro')}
            </button>*/}
          </div>
        </div>
      </section>
    </div>
  );
}
