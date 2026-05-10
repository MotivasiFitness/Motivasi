import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, ShoppingCart } from 'lucide-react';
import { useState, memo } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useMember } from '@/integrations';
import { useRole } from '@/hooks/useRole';
import { useCart } from '@/integrations';
import LanguageSwitcher from '@/components/LanguageSwitcher';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { member, isAuthenticated, actions } = useMember();
  const { isTrainer, isClient } = useRole();
  const { itemCount, actions: cartActions } = useCart();
  const location = useLocation();
  
  // Check if we're on the online training, about, blog, privacy, terms, disclaimer, checkout, or payment success page
  const isOnlineTrainingPage = location.pathname === '/online-training';
  const isAboutPage = location.pathname === '/about';
  const isBlogPage = location.pathname === '/blog';
  const isPrivacyPage = location.pathname === '/privacy';
  const isTermsPage = location.pathname === '/terms';
  const isDisclaimerPage = location.pathname === '/disclaimer';
  const isCheckoutPage = location.pathname === '/checkout';
  const isPaymentSuccessPage = location.pathname === '/payment-success';
  const shouldUseBlackText = isOnlineTrainingPage || isAboutPage || isBlogPage || isPrivacyPage || isTermsPage || isDisclaimerPage || isCheckoutPage || isPaymentSuccessPage;
  const linkTextColor = shouldUseBlackText ? 'text-charcoal-black' : 'text-white';
  const linkHoverColor = shouldUseBlackText ? 'hover:text-gray-600' : 'hover:text-gray-300';
  const iconColor = shouldUseBlackText ? 'text-charcoal-black' : 'text-white';

  return (
    <header 
      className="sticky top-0 z-40 shadow-sm safe-area-top bg-transparent"
    >
      <div className="max-w-[100rem] mx-auto px-3 sm:px-4 md:px-6 lg:px-20">
        <div className="flex items-center justify-center h-14 sm:h-16 md:h-20 relative">
          {/* Left Navigation - Hidden on Mobile */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 absolute left-0 h-full">
            <Link 
              to="/online-training" 
              className={`font-paragraph text-sm ${linkTextColor} ${linkHoverColor} transition-colors duration-200 flex items-center h-full min-h-[44px]`}
            >
              <span dangerouslySetInnerHTML={{ __html: t.nav.onlineTraining }} />
            </Link>
            <Link 
              to="/about" 
              className={`font-paragraph text-sm ${linkTextColor} ${linkHoverColor} transition-colors duration-200 flex items-center h-full min-h-[44px]`}
            >
              <span dangerouslySetInnerHTML={{ __html: t.nav.faceToFaceTraining }} />
            </Link>
          </nav>

          {/* Centered Brand Name - Split Color Wordmark */}
          <Link to="/" className="flex items-center justify-center hover:opacity-80 transition-opacity flex-shrink-0 min-h-[44px]">

          </Link>

          {/* Right Navigation and Actions */}
          <div className="hidden md:flex items-center gap-3 lg:gap-6 absolute right-0 h-full">
            {isAuthenticated ? (
              <>
                {isTrainer ? (
                  <Link 
                    to="/trainer" 
                    className={`font-paragraph text-sm lg:text-base ${linkTextColor} ${linkHoverColor} transition-colors duration-200 flex items-center min-h-[44px] px-2`}
                  >
                    Trainer Hub
                  </Link>
                ) : (
                  <Link 
                    to="/portal" 
                    className={`font-paragraph text-sm lg:text-base ${linkTextColor} ${linkHoverColor} transition-colors duration-200 flex items-center min-h-[44px] px-2`}
                  >
                    My Portal
                  </Link>
                )}
                <button
                  onClick={actions.logout}
                  className={`font-paragraph text-sm lg:text-base ${linkTextColor} ${linkHoverColor} transition-colors duration-200 flex items-center gap-2 min-h-[44px] px-2`}
                >
                  <LogOut size={16} className={iconColor} />
                  <span className="hidden lg:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <button 
                onClick={actions.login}
                className={`${linkTextColor} ${linkHoverColor} transition-colors duration-200 flex items-center justify-center min-h-[44px] min-w-[44px]`}
              >
                <User size={20} className={iconColor} />
              </button>
            )}
            <div className="flex items-center gap-2 lg:gap-4">
              <LanguageSwitcher />
              <button
                onClick={cartActions.toggleCart}
                className={`relative ${linkTextColor} ${linkHoverColor} transition-colors duration-200 flex items-center justify-center min-h-[44px] min-w-[44px]`}
              >
                <ShoppingCart size={20} className={iconColor} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden absolute right-0 h-full">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`${linkTextColor} p-2 min-h-[44px] min-w-[44px] flex items-center justify-center`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} className={iconColor} /> : <Menu size={24} className={iconColor} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-3 border-t border-gray-200 bg-white relative z-10">
            <div className="flex flex-col gap-1">
              <Link 
                to="/online-training" 
                className="font-paragraph text-base text-black hover:text-gray-600 transition-colors duration-200 px-4 py-3 rounded min-h-[44px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <span dangerouslySetInnerHTML={{ __html: t.nav.onlineTraining }} />
              </Link>
              <Link 
                to="/about" 
                className="font-paragraph text-base text-black hover:text-gray-600 transition-colors duration-200 px-4 py-3 rounded min-h-[44px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <span dangerouslySetInnerHTML={{ __html: t.nav.faceToFaceTraining }} />
              </Link>
              {isAuthenticated ? (
                <>
                  {isTrainer ? (
                    <Link 
                      to="/trainer" 
                      className="font-paragraph text-base text-black hover:text-gray-600 transition-colors duration-200 px-4 py-3 rounded min-h-[44px] flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Trainer Hub
                    </Link>
                  ) : (
                    <Link 
                      to="/portal" 
                      className="font-paragraph text-base text-black hover:text-gray-600 transition-colors duration-200 px-4 py-3 rounded min-h-[44px] flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Portal
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      actions.logout();
                      setIsMenuOpen(false);
                    }}
                    className="font-paragraph text-base text-black hover:text-gray-600 transition-colors duration-200 flex items-center gap-2 px-4 py-3 rounded min-h-[44px] w-full text-left"
                  >
                    <LogOut size={16} className="text-black" />
                    Sign Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    actions.login();
                    setIsMenuOpen(false);
                  }}
                  className="font-paragraph text-base text-black border-2 border-black bg-white px-4 py-3 rounded-lg hover:bg-black hover:text-white transition-all duration-200 font-semibold text-center w-full min-h-[44px]"
                >
                  Client Portal
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

export default memo(Header);
