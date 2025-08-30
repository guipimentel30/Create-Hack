// components/LanguageSwitcher.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import useMediaQuery from "../hooks/useMediaQuery";
import LanguageSwitcherDesktop from "./LanguageSwitcherDesktop";
import LanguageSwitcherMobile from "./LanguageSwitcherMobile";

const languages = [
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "fa", name: "فارسی", flag: "🇮🇷" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem("language", langCode);
  };

  return isMobile ? (
    <LanguageSwitcherMobile
      languages={languages}
      currentLanguage={currentLanguage}
      changeLanguage={changeLanguage}
    />
  ) : (
    <LanguageSwitcherDesktop
      languages={languages}
      currentLanguage={currentLanguage}
      changeLanguage={changeLanguage}
    />
  );
}
