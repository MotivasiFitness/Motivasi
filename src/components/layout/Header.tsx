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
    <header className="bg-white border-b border-light-gray sticky top-0 z-40 shadow-sm">
      <div className="max-w-[100rem] mx-auto px-8 lg:px-20">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="https://static.wixstatic.com/media/93e866_81ff1c66b9e449bc92b4e3a2a753a5ec~mv2.png"
              alt="Motivasi Lotus Logo"
              className="h-8 md:h-10 w-auto"
              width={40}
            />
            <span className="font-heading text-2xl font-bold text-charcoal-black">Motivasi</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className="font-paragraph text-base text-charcoal-black hover:text-rose-blush transition-colors"
            >
              {t.nav.home}
            </Link>
            <Link 
              to="/about" 
              className="font-paragraph text-base text-charcoal-black hover:text-rose-blush transition-colors"
            >
              {t.nav.about}
            </Link>
            <Link 
              to="/online-training" 
              className="font-paragraph text-base text-charcoal-black hover:text-rose-blush transition-colors"
            >
              {t.nav.onlineTraining}
            </Link>
            <Link 
              to="/blog" 
              className="font-paragraph text-base text-charcoal-black hover:text-rose-blush transition-colors"
            >
              {t.nav.faceToFaceTraining}
            </Link>
            {isAuthenticated ? (
              <>
                {isTrainer ? (
                  <Link 
                    to="/trainer" 
                    className="font-paragraph text-base text-charcoal-black hover:text-rose-blush transition-colors"
                  >
                    Trainer Hub
                  </Link>
                ) : (
                  <Link 
                    to="/portal" 
                    className="font-paragraph text-base text-charcoal-black hover:text-rose-blush transition-colors"
                  >
                    My Portal
                  </Link>
                )}
                <button
                  onClick={actions.logout}
                  className="font-paragraph text-base text-charcoal-black hover:text-rose-blush transition-colors flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <button 
                onClick={actions.login}
                className="font-paragraph text-base text-rose-blush border-2 border-rose-blush bg-white px-6 py-2 rounded-lg hover:bg-rose-blush hover:text-white transition-all font-semibold"
              >
                Client Portal
              </button>
            )}
            <LanguageSwitcher />
            <MiniCart cartIconClassName="ml-2 [&_svg]:text-charcoal-black" />
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <MiniCart cartIconClassName="[&_svg]:text-charcoal-black" />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-charcoal-black"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-light-gray bg-white">
            <div className="flex flex-col gap-4">
              <Link 
                to="/" 
                className="font-paragraph text-base text-charcoal-black hover:text-rose-blush transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.home}
              </Link>
              <Link 
                to="/about" 
                className="font-paragraph text-base text-charcoal-black hover:text-rose-blush transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.about}
              </Link>
              <Link 
                to="/online-training" 
                className="font-paragraph text-base text-charcoal-black hover:text-rose-blush transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.onlineTraining}
              </Link>
              <Link 
                to="/blog" 
                className="font-paragraph text-base text-charcoal-black hover:text-rose-blush transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.faceToFaceTraining}
              </Link>
              {isAuthenticated ? (
                <>
                  {isTrainer ? (
                    <Link 
                      to="/trainer" 
                      className="font-paragraph text-base text-charcoal-black hover:text-rose-blush transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Trainer Hub
                    </Link>
                  ) : (
                    <Link 
                      to="/portal" 
                      className="font-paragraph text-base text-charcoal-black hover:text-rose-blush transition-colors"
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
                    className="font-paragraph text-base text-charcoal-black hover:text-rose-blush transition-colors flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    actions.login();
                    setIsMenuOpen(false);
                  }}
                  className="font-paragraph text-base text-rose-blush border-2 border-rose-blush bg-white px-6 py-2 rounded-lg hover:bg-rose-blush hover:text-white transition-all font-semibold text-center w-full"
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
