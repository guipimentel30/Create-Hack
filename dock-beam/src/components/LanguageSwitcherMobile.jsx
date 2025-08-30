// components/LanguageSwitcherMobile.jsx
import React, { useState } from "react";
import { FiGlobe } from "react-icons/fi";

export default function LanguageSwitcherMobile({ languages, currentLanguage, changeLanguage }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="language-switcher">
      <button className="language-switcher__trigger" onClick={() => setIsOpen(true)}>
        <FiGlobe />
        <span>{currentLanguage.flag}</span>
      </button>

      {isOpen && (
        <div className="language-switcher__mobile">
          <div className="language-switcher__mobile-overlay" onClick={() => setIsOpen(false)} />
          <div className="language-switcher__mobile-panel">
            <h3>🌐 Escolha o idioma</h3>
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={lang.code === currentLanguage.code ? "active" : ""}
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                }}
              >
                {lang.flag} {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
