import { useTranslation } from 'react-i18next';
import '../css/Hero.css'

export default function Hero() {
  const { t, i18n } = useTranslation();
  
  return (
    <section className="hero" data-lang={i18n.language}>
      <div className="hero__overlay" />
      <div className="hero__content">
        <h1>{t('hero.title')}</h1>
        <p>{t('hero.subtitle')}</p>
        {/*<button className="btn btn--primary hero__cta">{t('hero.cta')}</button>*/}
      </div>
    </section>
  );
}