import { FaBookOpen, FaBriefcase } from 'react-icons/fa';
import '../css/Features.css'

export default function Features() {
  return (
    <section className="features">
      <h2>Como podemos te ajudar?</h2>
      <div className="features__grid">
        <div className="feature-card">
          <FaBookOpen size={36} className="feature-card__icon" />
          <h3>Capacitação de Idiomas</h3>
          <p>Aulas com professores dedicados, do iniciante ao avançado. Estude no seu ritmo com conteúdo gravado e ao vivo.</p>
        </div>
        <div className="feature-card">
          <FaBriefcase size={36} className="feature-card__icon" />
          <h3>Oportunidades de Emprego</h3>
          <p>Crie seu perfil profissional e conecte-se com empresas que valorizam sua história e suas habilidades.</p>
        </div>
      </div>
    </section>
  );
}