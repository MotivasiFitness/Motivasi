import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  // Check if user has already made a cookie choice
  useEffect(() => {
    const savedPreferences = localStorage.getItem('cookiePreferences');
    if (!savedPreferences) {
      setIsVisible(true);
    } else {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    setPreferences(allAccepted);
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    const rejected: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    localStorage.setItem('cookiePreferences', JSON.stringify(rejected));
    setPreferences(rejected);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
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

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-charcoal-black text-soft-white p-6 md:p-8 shadow-2xl">
      <div className="max-w-[100rem] mx-auto">
        {!showPreferences ? (
          <>
            {/* Main Banner */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start lg:items-center justify-between">
              <div className="flex-1">
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
            <div className="max-w-2xl">
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
                You can choose which cookies you allow. Strictly necessary cookies are always enabled as they are required for the website to function.
              </p>

              {/* Cookie Options */}
              <div className="space-y-4 mb-8">
                {/* Necessary Cookies */}
                <div className="bg-soft-white/5 border border-soft-bronze/30 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-heading text-lg font-bold text-soft-white mb-2">
                        Strictly Necessary Cookies
                      </h3>
                      <p className="font-paragraph text-sm text-warm-grey">
                        Required for the website to function properly. These cannot be disabled.
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={preferences.necessary}
                        disabled
                        className="w-5 h-5 accent-soft-bronze cursor-not-allowed"
                        aria-label="Strictly necessary cookies"
                      />
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="bg-soft-white/5 border border-warm-grey/20 rounded-xl p-6 hover:border-warm-grey/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-heading text-lg font-bold text-soft-white mb-2">
                        Analytics Cookies
                      </h3>
                      <p className="font-paragraph text-sm text-warm-grey">
                        Help us understand how you use our website so we can improve your experience.
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                        className="w-5 h-5 accent-soft-bronze cursor-pointer"
                        aria-label="Analytics cookies"
                      />
                    </div>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="bg-soft-white/5 border border-warm-grey/20 rounded-xl p-6 hover:border-warm-grey/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-heading text-lg font-bold text-soft-white mb-2">
                        Marketing Cookies
                      </h3>
                      <p className="font-paragraph text-sm text-warm-grey">
                        Used to track your activity and show you relevant ads and content.
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                        className="w-5 h-5 accent-soft-bronze cursor-pointer"
                        aria-label="Marketing cookies"
                      />
                    </div>
                  </div>
                </div>
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
