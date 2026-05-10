import { useLanguage } from '@/i18n/LanguageContext';
import { Language } from '@/i18n/translations';
import { Globe } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

const languageOptions: { code: Language; label: string; flag: string }[] = [
  { code: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
  { code: 'en-US', label: 'English (USA)', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Check if we're on pages that need black text
  const isOnlineTrainingPage = location.pathname === '/online-training';
  const isAboutPage = location.pathname === '/about';
  const isBlogPage = location.pathname === '/blog';
  const isPrivacyPage = location.pathname === '/privacy';
  const isTermsPage = location.pathname === '/terms';
  const isDisclaimerPage = location.pathname === '/disclaimer';
  const isCheckoutPage = location.pathname === '/checkout';
  const shouldUseBlackText = isOnlineTrainingPage || isAboutPage || isBlogPage || isPrivacyPage || isTermsPage || isDisclaimerPage || isCheckoutPage;

  const currentLanguage = languageOptions.find(opt => opt.code === language);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center h-10 w-10 rounded-lg hover:bg-gray-100 transition-colors ${
          shouldUseBlackText 
            ? 'text-charcoal-black hover:text-gray-600' 
            : 'text-white hover:text-gray-300'
        }`}
        aria-label={t.header.selectLanguage}
        title={t.header.selectLanguage}
      >
        <Globe size={20} className={shouldUseBlackText ? 'text-charcoal-black' : 'text-white'} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-soft-white border border-warm-sand-beige rounded-lg shadow-lg z-50">
          <div className="p-2">
            {languageOptions.map((option) => (
              <button
                key={option.code}
                onClick={() => {
                  setLanguage(option.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  language === option.code
                    ? 'bg-soft-bronze text-soft-white'
                    : 'hover:bg-warm-sand-beige/30 text-charcoal-black'
                }`}
              >
                <span className="text-lg">{option.flag}</span>
                <span className="font-paragraph text-sm">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
