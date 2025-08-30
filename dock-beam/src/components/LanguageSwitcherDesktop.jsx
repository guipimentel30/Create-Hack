// components/LanguageSwitcherDesktop.jsx
import React, { useState } from "react";
import { FiGlobe, FiChevronDown } from "react-icons/fi";

export default function LanguageSwitcherDesktop({ languages, currentLanguage, changeLanguage }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="language-switcher">
      <button className="language-switcher__trigger" onClick={() => setIsOpen(!isOpen)}>
        <FiGlobe />
        <span>{currentLanguage.flag} {currentLanguage.name}</span>
        <FiChevronDown className={isOpen ? "open" : ""} />
      </button>

      {isOpen && (
        <>
          <div className="language-switcher__overlay" onClick={() => setIsOpen(false)} />
          <div className="language-switcher__dropdown">
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
        </>
      )}
    </div>
  );
}
