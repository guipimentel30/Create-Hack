import { FaHeart, FaUsers, FaBook, FaBriefcase } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import '../css/AboutUs.css';

export default function AboutUsPage() {
  const { t, i18n } = useTranslation();
  return (
    <div className="about-us-page" data-lang={i18n.language}>
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero__overlay"></div>
        <div className="about-hero__content">
          <h1 className="about-hero__title">{t('aboutUs.hero.title')}</h1>
          <p className="about-hero__subtitle">
            {t('aboutUs.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="about-content">
        <div className="about-content__container">
          <div className="about-section">
            <h2 className="about-section__title">{t('aboutUs.mission.title')}</h2>
            <p className="about-section__text">
              {t('aboutUs.mission.content')}
            </p>
          </div>

          <div className="about-section">
            <h2 className="about-section__title">{t('aboutUs.vision.title')}</h2>
            <p className="about-section__text">
              {t('aboutUs.vision.content')}
            </p>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="about-pillars">
        <div className="about-pillars__container">
          <h2 className="about-pillars__title">{t('aboutUs.pillars.title')}</h2>
          <div className="about-pillars__grid">
            <div className="pillar-card">
              <div className="pillar-card__icon">
                <FaBook size={48} />
              </div>
              <h3 className="pillar-card__title">{t('aboutUs.pillars.language.title')}</h3>
              <p className="pillar-card__text">
                {t('aboutUs.pillars.language.content')}
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-card__icon">
                <FaBriefcase size={48} />
              </div>
              <h3 className="pillar-card__title">{t('aboutUs.pillars.employment.title')}</h3>
              <p className="pillar-card__text">
                {t('aboutUs.pillars.employment.content')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="about-cta">
        <div className="about-cta__container">
          <div className="about-cta__content">
            <h2 className="about-cta__title">{t('aboutUs.cta.title')}</h2>
            <p className="about-cta__text">
              {t('aboutUs.cta.subtitle')}
            </p>
          </div>
          <div className="about-cta__buttons">
            <button className="cta-button cta-button--refugee">
              <FaHeart className="cta-button__icon" />
              <span>{t('aboutUs.cta.refugee')}</span>
            </button>
            <button className="cta-button cta-button--teacher">
              <FaUsers className="cta-button__icon" />
              <span>{t('aboutUs.cta.teacher')}</span>
            </button>
            <button className="cta-button cta-button--company">
              <FaBriefcase className="cta-button__icon" />
              <span>{t('aboutUs.cta.company')}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
