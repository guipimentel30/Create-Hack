import { useState } from 'react'
import { FiMenu, FiX } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher.jsx'; 
import logo from '../images/logo.png'; 

import '../css/Navbar.css'

export default function Navbar({ session, onShowAuth, currentPage, setCurrentPage }) {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <img src={logo} alt="Dock Beam" className="logo-image" />
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          <button 
            onClick={() => setCurrentPage('home')} 
            className={`nav-link ${currentPage === 'home' ? 'nav-link--active' : ''}`}
          >
            {t('navbar.home')}
          </button>
          <a href="#como-funciona" className="nav-link">{t('navbar.howItWorks')}</a>
          <a href="#parceiros" className="nav-link">{t('navbar.partners')}</a>
          <button 
            onClick={() => setCurrentPage('about')} 
            className={`nav-link ${currentPage === 'about' ? 'nav-link--active' : ''}`}
          >
            {t('navbar.about')}
          </button>
        </div>

        {/* Right side - Language switcher and buttons */}
        <div className="navbar-actions">
          <LanguageSwitcher />
          {session ? (
            <>
              <span className="user-email">{session.user.email}</span>
              <button className="btn-secondary" onClick={handleSignOut}>{t('navbar.logout')}</button>
            </>
          ) : (
            <>
              <button className="btn-secondary" onClick={onShowAuth}>{t('navbar.login')}</button>
              <button className="btn-primary" onClick={onShowAuth}>{t('navbar.signup')}</button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-links">
            <button 
              onClick={() => { setCurrentPage('about'); toggleMenu(); }} 
              className={`mobile-link ${currentPage === 'about' ? 'nav-link--active' : ''}`}
            >
              {t('navbar.about')}
            </button>
            <button 
              onClick={() => { setCurrentPage('home'); toggleMenu(); }} 
              className={`mobile-link ${currentPage === 'home' ? 'nav-link--active' : ''}`}
            >
              {t('navbar.home')}
            </button>
            <a href="#como-funciona" className="mobile-link" onClick={toggleMenu}>{t('navbar.howItWorks')}</a>
            <a href="#parceiros" className="mobile-link" onClick={toggleMenu}>{t('navbar.partners')}</a>
          </div>
          <div className="mobile-actions">
            <LanguageSwitcher />
            {session ? (
              <>
                <span className="user-email mobile">{session.user.email}</span>
                <button className="btn-secondary mobile-btn" onClick={handleSignOut}>{t('navbar.logout')}</button>
              </>
            ) : (
              <>
                <button className="btn-secondary mobile-btn" onClick={onShowAuth}>{t('navbar.login')}</button>
                <button className="btn-primary mobile-btn" onClick={onShowAuth}>{t('navbar.signup')}</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
