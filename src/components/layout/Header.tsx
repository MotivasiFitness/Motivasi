import { Link } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useState, memo } from 'react';
import { MiniCart } from '@/wix-verticals/react-pages/react-router/routes/root';
import { useLanguage } from '@/i18n/LanguageContext';
import { useMember } from '@/integrations';
import { useRole } from '@/hooks/useRole';
import LanguageSwitcher from '@/components/LanguageSwitcher';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { member, isAuthenticated, actions } = useMember();
  const { isTrainer, isClient } = useRole();

  return (
    <header 
      className="sticky top-0 z-40 shadow-sm safe-area-top"
    >
      {/* Background with overlay for blending */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://static.wixstatic.com/media/93e866_261f84f84f544c2eadf73946d48e8637~mv2.png)',
        }}
      />
      {/* Gradient overlay for smooth blending */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-black/50 via-charcoal-black/40 to-charcoal-black/30" />
      
      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-20 relative z-10">
        <div className="flex items-center justify-center h-16 sm:h-20 relative">
          {/* Left Navigation - Hidden on Mobile */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 absolute left-0">
            <Link 
              to="/online-training" 
              className="font-paragraph text-sm text-white hover:text-warm-cream transition-colors duration-200"
            >
              <span dangerouslySetInnerHTML={{ __html: t.nav.onlineTraining }} />
            </Link>
            <Link 
              to="/about" 
              className="font-paragraph text-sm text-white hover:text-warm-cream transition-colors duration-200"
            >
              <span dangerouslySetInnerHTML={{ __html: t.nav.faceToFaceTraining }} />
            </Link>
          </nav>

          {/* Centered Brand Name - Split Color Wordmark */}
          <Link to="/" className="flex items-center justify-center hover:opacity-80 transition-opacity flex-shrink-0">

          </Link>

          {/* Right Navigation and Actions */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6 absolute right-0 h-full">
            {isAuthenticated ? (
              <>
                {isTrainer ? (
                  <Link 
                    to="/trainer" 
                    className="font-paragraph text-sm lg:text-base text-white hover:text-warm-cream transition-colors duration-200 flex items-center"
                  >
                    Trainer Hub
                  </Link>
                ) : (
                  <Link 
                    to="/portal" 
                    className="font-paragraph text-sm lg:text-base text-white hover:text-warm-cream transition-colors duration-200 flex items-center"
                  >
                    My Portal
                  </Link>
                )}
                <button
                  onClick={actions.logout}
                  className="font-paragraph text-sm lg:text-base text-white hover:text-warm-cream transition-colors duration-200 flex items-center gap-2 h-10 px-2"
                >
                  <LogOut size={16} className="text-white" />
                  <span className="hidden lg:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <button 
                onClick={actions.login}
                className="text-white hover:text-warm-cream transition-colors duration-200 flex items-center justify-center h-10 w-10"
              >
                <User size={20} className="text-white" />
              </button>
            )}
            <div className="flex items-center gap-4 lg:gap-6">
              <LanguageSwitcher />
              <MiniCart cartIconClassName="[&_svg]:text-white" />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden absolute right-0 h-full">
            <LanguageSwitcher />
            <MiniCart cartIconClassName="[&_svg]:text-white" />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-secondary-bg bg-light-contrast relative z-10">
            <div className="flex flex-col gap-2">
              <Link 
                to="/online-training" 
                className="font-paragraph text-base text-primary-text hover:text-accent transition-colors duration-200 px-4 py-3 rounded min-h-[44px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <span dangerouslySetInnerHTML={{ __html: t.nav.onlineTraining }} />
              </Link>
              <Link 
                to="/about" 
                className="font-paragraph text-base text-primary-text hover:text-accent transition-colors duration-200 px-4 py-3 rounded min-h-[44px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <span dangerouslySetInnerHTML={{ __html: t.nav.faceToFaceTraining }} />
              </Link>
              {isAuthenticated ? (
                <>
                  {isTrainer ? (
                    <Link 
                      to="/trainer" 
                      className="font-paragraph text-base text-primary-text hover:text-accent transition-colors duration-200 px-4 py-3 rounded min-h-[44px] flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Trainer Hub
                    </Link>
                  ) : (
                    <Link 
                      to="/portal" 
                      className="font-paragraph text-base text-primary-text hover:text-accent transition-colors duration-200 px-4 py-3 rounded min-h-[44px] flex items-center"
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
                    className="font-paragraph text-base text-primary-text hover:text-accent transition-colors duration-200 flex items-center gap-2 px-4 py-3 rounded min-h-[44px] w-full text-left"
                  >
                    <LogOut size={16} className="text-primary-text" />
                    Sign Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    actions.login();
                    setIsMenuOpen(false);
                  }}
                  className="font-paragraph text-base text-primary-text border-2 border-primary-text bg-light-contrast px-4 py-3 rounded-lg hover:bg-primary-text hover:text-light-contrast transition-all duration-200 font-semibold text-center w-full min-h-[44px]"
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
