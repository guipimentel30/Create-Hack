import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import logo from '../images/logo.png'; 

import '../css/Footer.css'

export default function Footer() {
  const { t, i18n } = useTranslation();
  return (
    <footer className="footer" data-lang={i18n.language}>
      <div className="footer-container">
        <div className="footer-grid">
          {/* Column 1 - Logo and Mission */}
          <div className="footer-column">
            <span className="footer-logo-text">Dock Beam</span>
            {/*
            <div className="footer-logo">
               <img src={logo} alt="Dock Beam" className="footer-logo-image" /> 
            </div>*/}
            <p className="footer-mission">
              {t('footer.mission')}
            </p>
          </div>
          
          {/* Column 2 - Navigation Links */}
          <div className="footer-column">
            <h4 className="footer-column-title">{t('footer.navigation.title')}</h4>
            <ul className="footer-links">
              <li><a href="#sobre" className="footer-link">{t('footer.navigation.about')}</a></li>
              <li><a href="#contato" className="footer-link">{t('footer.navigation.contact')}</a></li>
              <li><a href="#faq" className="footer-link">{t('footer.navigation.faq')}</a></li>
            </ul>
          </div>
          
          {/* Column 3 - Legal and Social */}
          <div className="footer-column">
            <h4 className="footer-column-title">{t('footer.legal.title')}</h4>
            <ul className="footer-links">
              <li><a href="#privacidade" className="footer-link">{t('footer.legal.privacy')}</a></li>
              <li><a href="#termos" className="footer-link">{t('footer.legal.terms')}</a></li>
            </ul>
            
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
