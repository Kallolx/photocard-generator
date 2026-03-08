"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { en } from "@/locales/en";
import { bn } from "@/locales/bn";

type Language = "en" | "bn";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    // If the user has a saved preference, use it immediately — no fetch needed
    const savedLang = localStorage.getItem("language");
    if (savedLang === "en" || savedLang === "bn") {
      setLangState(savedLang);
      return;
    }

    // No saved preference — detect country via our server-side API (avoids CORS/blocks)
    fetch("/api/geo")
      .then((res) => res.json())
      .then((data) => {
        if (data?.country_code === "BD") {
          setLangState("bn");
        }
        // else stays "en" (the initial default)
      })
      .catch(() => {
        // Stay on "en" if anything fails
      });
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("language", newLang);
  };

  const t = lang === "bn" ? bn : en;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}