import { Link } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useState, memo } from 'react';
import { Image } from '@/components/ui/image';
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
    <header className="bg-black border-b border-charcoal-black sticky top-0 z-40 shadow-sm safe-area-top">
      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity flex-shrink-0">
            <Image
              src="https://static.wixstatic.com/media/93e866_81ff1c66b9e449bc92b4e3a2a753a5ec~mv2.png"
              alt="Motivasi Lotus Logo"
              className="h-7 sm:h-8 md:h-10 w-auto"
              width={40}
            />
            <span className="font-heading text-xl sm:text-2xl font-bold text-white hidden sm:inline">Motivasi</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link 
              to="/" 
              className="font-paragraph text-sm lg:text-base text-white hover:text-warm-bronze transition-colors"
            >
              {t.nav.home}
            </Link>
            <Link 
              to="/about" 
              className="font-paragraph text-sm lg:text-base text-white hover:text-warm-bronze transition-colors"
            >
              {t.nav.about}
            </Link>
            <Link 
              to="/online-training" 
              className="font-paragraph text-sm lg:text-base text-white hover:text-warm-bronze transition-colors"
            >
              {t.nav.onlineTraining}
            </Link>
            <Link 
              to="/blog" 
              className="font-paragraph text-sm lg:text-base text-white hover:text-warm-bronze transition-colors"
            >
              {t.nav.faceToFaceTraining}
            </Link>
            {isAuthenticated ? (
              <>
                {isTrainer ? (
                  <Link 
                    to="/trainer" 
                    className="font-paragraph text-sm lg:text-base text-white hover:text-warm-bronze transition-colors"
                  >
                    Trainer Hub
                  </Link>
                ) : (
                  <Link 
                    to="/portal" 
                    className="font-paragraph text-sm lg:text-base text-white hover:text-warm-bronze transition-colors"
                  >
                    My Portal
                  </Link>
                )}
                <button
                  onClick={actions.logout}
                  className="font-paragraph text-sm lg:text-base text-white hover:text-warm-bronze transition-colors flex items-center gap-2 min-h-[44px] min-w-[44px]"
                >
                  <LogOut size={16} className="text-white" />
                  <span className="hidden lg:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <button 
                onClick={actions.login}
                className="font-paragraph text-sm lg:text-base text-white border-2 border-white bg-black px-4 lg:px-6 py-2 rounded-lg hover:bg-white hover:text-black transition-all font-semibold min-h-[44px]"
              >
                Portal
              </button>
            )}
            <LanguageSwitcher />
            <MiniCart cartIconClassName="ml-2 [&_svg]:text-white" />
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
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
          <nav className="md:hidden py-4 border-t border-charcoal-black bg-black">
            <div className="flex flex-col gap-2">
              <Link 
                to="/" 
                className="font-paragraph text-base text-white hover:text-warm-bronze transition-colors px-4 py-3 rounded min-h-[44px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.home}
              </Link>
              <Link 
                to="/about" 
                className="font-paragraph text-base text-white hover:text-warm-bronze transition-colors px-4 py-3 rounded min-h-[44px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.about}
              </Link>
              <Link 
                to="/online-training" 
                className="font-paragraph text-base text-white hover:text-warm-bronze transition-colors px-4 py-3 rounded min-h-[44px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.onlineTraining}
              </Link>
              <Link 
                to="/blog" 
                className="font-paragraph text-base text-white hover:text-warm-bronze transition-colors px-4 py-3 rounded min-h-[44px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.faceToFaceTraining}
              </Link>
              {isAuthenticated ? (
                <>
                  {isTrainer ? (
                    <Link 
                      to="/trainer" 
                      className="font-paragraph text-base text-white hover:text-warm-bronze transition-colors px-4 py-3 rounded min-h-[44px] flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Trainer Hub
                    </Link>
                  ) : (
                    <Link 
                      to="/portal" 
                      className="font-paragraph text-base text-white hover:text-warm-bronze transition-colors px-4 py-3 rounded min-h-[44px] flex items-center"
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
                    className="font-paragraph text-base text-white hover:text-warm-bronze transition-colors flex items-center gap-2 px-4 py-3 rounded min-h-[44px] w-full text-left"
                  >
                    <LogOut size={16} className="text-white" />
                    Sign Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    actions.login();
                    setIsMenuOpen(false);
                  }}
                  className="font-paragraph text-base text-white border-2 border-white bg-black px-4 py-3 rounded-lg hover:bg-white hover:text-black transition-all font-semibold text-center w-full min-h-[44px]"
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
