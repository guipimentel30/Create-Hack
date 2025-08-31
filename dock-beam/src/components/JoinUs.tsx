import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import '../css/JoinUs.css';

export default function JoinUs() {
  const { t, i18n } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.joinus-card');
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('animate-in');
              }, index * 150 + Math.sin(index * 0.5) * 100); // Wave effect with sine function
            });
          }
        });
      },
      {
        threshold: 0.2, // Trigger when 20% of the section is visible
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section className="joinus" ref={sectionRef} data-lang={i18n.language}>
      <h2>{t('joinUs.title')}</h2>
      <div className="joinus__grid">
        <div className="joinus-card">
          <h3>{t('joinUs.refugee.title')}</h3>
          <p>{t('joinUs.refugee.description')}</p>
          {/*<button className="btn btn--primary">{t('joinUs.refugee.cta')}</button>*/}
        </div>
        <div className="joinus-card">
          <h3>{t('joinUs.teacher.title')}</h3>
          <p>{t('joinUs.teacher.description')}</p>
          {/*<button className="btn btn--primary">{t('joinUs.teacher.cta')}</button>*/}
        </div>
        <div className="joinus-card">
          <h3>{t('joinUs.company.title')}</h3>
          <p>{t('joinUs.company.description')}</p>
          {/*<button className="btn btn--primary">{t('joinUs.company.cta')}</button>*/}
        </div>
      </div>
    </section>
  );
}