import { useState, useEffect, memo } from 'react';
import { X, ChevronDown, ChevronUp, Info } from 'lucide-react';

type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
};

type CookieCategory = {
  id: keyof CookiePreferences;
  name: string;
  description: string;
  required: boolean;
  examples: string[];
};

const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: 'necessary',
    name: 'Strictly Necessary Cookies',
    description: 'Required for the website to function properly. These enable basic functions like page navigation, security, and access to secure areas.',
    required: true,
    examples: ['Session tokens', 'Security cookies', 'Authentication cookies'],
  },
  {
    id: 'functional',
    name: 'Functional Cookies',
    description: 'Help us remember your preferences and settings to enhance your experience.',
    required: false,
    examples: ['Language preferences', 'Theme settings', 'User preferences'],
  },
  {
    id: 'analytics',
    name: 'Analytics Cookies',
    description: 'Help us understand how you use our website so we can improve your experience. Data is anonymised.',
    required: false,
    examples: ['Page views', 'User interactions', 'Performance metrics'],
  },
  {
    id: 'marketing',
    name: 'Marketing Cookies',
    description: 'Used to track your activity and show you relevant ads and content. May be set by third-party partners.',
    required: false,
    examples: ['Ad targeting', 'Retargeting pixels', 'Social media tracking'],
  },
];

function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  // Check if user has already made a cookie choice - deferred to avoid blocking render
  useEffect(() => {
    const checkCookies = () => {
      if (typeof window !== 'undefined') {
        try {
          const savedPreferences = localStorage.getItem('cookiePreferences');
          if (!savedPreferences) {
            setIsVisible(true);
          } else {
            setPreferences(JSON.parse(savedPreferences));
          }
        } catch (error) {
          // localStorage might not be available in some environments
          setIsVisible(true);
        }
      }
    };
    
    // Defer cookie check to avoid blocking initial render
    const timerId = setTimeout(checkCookies, 100);
    
    return () => {
      clearTimeout(timerId);
    };
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
        localStorage.setItem('cookiePreferencesTimestamp', new Date().toISOString());
      } catch (error) {
        // localStorage might not be available
      }
    }
    setPreferences(allAccepted);
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    const rejected: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cookiePreferences', JSON.stringify(rejected));
        localStorage.setItem('cookiePreferencesTimestamp', new Date().toISOString());
      } catch (error) {
        // localStorage might not be available
      }
    }
    setPreferences(rejected);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
        localStorage.setItem('cookiePreferencesTimestamp', new Date().toISOString());
      } catch (error) {
        // localStorage might not be available
      }
    }
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Necessary cookies cannot be disabled
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-charcoal-black text-soft-white p-6 md:p-8 shadow-2xl">
      <div className="max-w-[100rem] mx-auto">
        {!showPreferences ? (
          <>
            {/* Main Banner */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start lg:items-center justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-4">
                  <Info size={20} className="text-soft-bronze flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-paragraph text-base md:text-lg leading-relaxed text-soft-white/90">
                      We use cookies to improve your experience, analyse website traffic, and support marketing activities. You can accept all cookies, reject non-essential cookies, or manage your preferences at any time.
                    </p>
                    <p className="font-paragraph text-sm md:text-base leading-relaxed text-warm-grey mt-3">
                      By clicking "Accept", you consent to the use of cookies in accordance with our{' '}
                      <a href="/privacy" className="text-soft-bronze hover:underline transition-colors">
                        Privacy & Cookie Policy
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-shrink-0">
                <button
                  onClick={handleRejectNonEssential}
                  className="px-6 py-3 rounded-lg border border-warm-grey/30 text-soft-white font-medium text-sm md:text-base hover:bg-warm-grey/10 transition-colors duration-300 whitespace-nowrap"
                >
                  Reject Non-Essential
                </button>
                <button
                  onClick={() => setShowPreferences(true)}
                  className="px-6 py-3 rounded-lg border border-soft-bronze text-soft-bronze font-medium text-sm md:text-base hover:bg-soft-bronze/10 transition-colors duration-300 whitespace-nowrap"
                >
                  Manage Preferences
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-3 rounded-lg bg-soft-bronze text-charcoal-black font-medium text-sm md:text-base hover:bg-soft-white transition-colors duration-300 whitespace-nowrap"
                >
                  Accept All
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={handleRejectNonEssential}
                className="absolute top-4 right-4 md:top-6 md:right-6 text-warm-grey hover:text-soft-white transition-colors"
                aria-label="Close cookie banner"
              >
                <X size={20} />
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Preferences Modal */}
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-soft-white">
                  Cookie Preferences
                </h2>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="text-warm-grey hover:text-soft-white transition-colors"
                  aria-label="Close preferences"
                >
                  <X size={24} />
                </button>
              </div>

              <p className="font-paragraph text-base text-warm-grey mb-8">
                You can choose which cookies you allow. Strictly necessary cookies are always enabled as they are required for the website to function. We are transparent about how we use each type of cookie.
              </p>

              {/* Cookie Options */}
              <div className="space-y-4 mb-8">
                {COOKIE_CATEGORIES.map((category) => (
                  <div
                    key={category.id}
                    className={`border rounded-xl p-6 transition-all ${
                      category.required
                        ? 'bg-soft-white/5 border-soft-bronze/30'
                        : 'bg-soft-white/5 border-warm-grey/20 hover:border-warm-grey/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-heading text-lg font-bold text-soft-white">
                            {category.name}
                          </h3>
                          {category.required && (
                            <span className="text-xs bg-soft-bronze/20 text-soft-bronze px-2 py-1 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="font-paragraph text-sm text-warm-grey mb-3">
                          {category.description}
                        </p>
                        
                        {/* Expandable Examples */}
                        <button
                          onClick={() => toggleCategory(category.id)}
                          className="flex items-center gap-2 text-soft-bronze hover:text-soft-white transition-colors text-sm font-medium"
                        >
                          {expandedCategory === category.id ? (
                            <>
                              <ChevronUp size={16} />
                              Hide examples
                            </>
                          ) : (
                            <>
                              <ChevronDown size={16} />
                              Show examples
                            </>
                          )}
                        </button>

                        {expandedCategory === category.id && (
                          <div className="mt-3 pt-3 border-t border-warm-grey/20">
                            <p className="font-paragraph text-xs text-warm-grey mb-2 font-bold">
                              Examples:
                            </p>
                            <ul className="space-y-1">
                              {category.examples.map((example, idx) => (
                                <li key={idx} className="font-paragraph text-xs text-warm-grey/80 flex items-center gap-2">
                                  <span className="w-1 h-1 bg-soft-bronze rounded-full"></span>
                                  {example}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0 mt-1">
                        <input
                          type="checkbox"
                          checked={preferences[category.id]}
                          onChange={(e) => handlePreferenceChange(category.id, e.target.checked)}
                          disabled={category.required}
                          className="w-5 h-5 accent-soft-bronze cursor-pointer disabled:cursor-not-allowed"
                          aria-label={`${category.name} toggle`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Transparency Notice */}
              <div className="bg-soft-white/5 border border-warm-grey/20 rounded-xl p-4 mb-8">
                <p className="font-paragraph text-xs text-warm-grey">
                  <span className="font-bold text-soft-white">Transparency:</span> We do not sell your personal data. All cookies are used solely to improve your experience and understand how our website is used. You can change your preferences at any time by accessing this menu again.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowPreferences(false)}
                  className="flex-1 px-6 py-3 rounded-lg border border-warm-grey/30 text-soft-white font-medium hover:bg-warm-grey/10 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 px-6 py-3 rounded-lg bg-soft-bronze text-charcoal-black font-medium hover:bg-soft-white transition-colors duration-300"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default memo(CookieBanner);
