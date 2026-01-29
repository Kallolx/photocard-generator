"use client";

import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      className={`min-h-screen bg-[#faf8f5] flex flex-col ${
        lang === "bn" ? "font-noto-bengali" : "font-inter"
      }`}
    >
      <LandingNavbar lang={lang} setLang={setLang} t={t} />

      <main className="flex-grow container mx-auto px-4 py-32 max-w-5xl">
        <div className="bg-white p-8 md:p-12 border-2 border-[#d4c4b0] shadow-sm">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-lora font-bold text-[#2c2419] mb-4">
              {t.contact.title}
            </h1>
            <p className="text-[#5d4e37] text-lg max-w-2xl mx-auto">
              {t.contact.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="md:col-span-1 space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#f5f0e8] border border-[#d4c4b0] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-[#8b6834]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2c2419] mb-1 font-lora text-lg">
                    Email
                  </h3>
                  <p className="text-[#5d4e37]">{t.contact.info.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#f5f0e8] border border-[#d4c4b0] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-[#8b6834]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2c2419] mb-1 font-lora text-lg">
                    Phone
                  </h3>
                  <p className="text-[#5d4e37]">{t.contact.info.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#f5f0e8] border border-[#d4c4b0] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[#8b6834]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2c2419] mb-1 font-lora text-lg">
                    Office
                  </h3>
                  <p className="text-[#5d4e37]">{t.contact.info.address}</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#2c2419]">
                      {t.contact.form.name}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] placeholder-[#a08d74] focus:outline-none focus:ring-2 focus:ring-[#8b6834] focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#2c2419]">
                      {t.contact.form.email}
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] placeholder-[#a08d74] focus:outline-none focus:ring-2 focus:ring-[#8b6834] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#2c2419]">
                    {t.contact.form.subject}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] placeholder-[#a08d74] focus:outline-none focus:ring-2 focus:ring-[#8b6834] focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#2c2419]">
                    {t.contact.form.message}
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] placeholder-[#a08d74] focus:outline-none focus:ring-2 focus:ring-[#8b6834] focus:border-transparent transition-all resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#8b6834] text-white font-medium py-3 px-6 hover:bg-[#6b4e25] transition-colors duration-200"
                >
                  {t.contact.form.submit}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter t={t} />
    </div>
  );
}
