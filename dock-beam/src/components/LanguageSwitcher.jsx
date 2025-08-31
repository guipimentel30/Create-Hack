// components/LanguageSwitcher.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import * as Flags from "country-flag-icons/react/3x2";

import "../css/LanguageSwitcher.css"

// Expanded list of languages
const languages = [
  { code: "pt", name: "Português", countryCode: "BR" },
  { code: "en", name: "English", countryCode: "US" },
  { code: "es", name: "Español", countryCode: "ES" },
  { code: "ar", name: "العربية", countryCode: "SA" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  // Find the index of the current language, defaulting to 0 if not found
  const currentIndex = Math.max(
    0,
    languages.findIndex((lang) => lang.code === i18n.language)
  );

  // --- KEY CHANGE: Determine the NEXT language ---
  // Calculate the index for the next language in the cycle.
  const nextIndex = (currentIndex + 1) % languages.length;
  const nextLanguage = languages[nextIndex];

  const cycleLanguage = () => {
    // The next language is already calculated, so we just use its code.
    i18n.changeLanguage(nextLanguage.code);
    localStorage.setItem("language", nextLanguage.code);
  };

  // Get the FlagIcon for the NEXT language to display it in the button.
  const NextFlagIcon = Flags[nextLanguage.countryCode];

  return (
    <button
      type="button"
      className="language-switcher"
      onClick={cycleLanguage}
      // Improved accessibility by specifying what the button does.
      aria-label={`Change language to ${nextLanguage.name}`}
    >
      {NextFlagIcon && <NextFlagIcon className="language-switcher__icon" />}
    </button>
  );
}