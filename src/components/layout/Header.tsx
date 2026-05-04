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
    <header className="bg-white border-b border-light-gray sticky top-0 z-40 shadow-sm safe-area-top">
      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex items-center justify-center h-16 sm:h-20 relative">
          {/* Left Navigation - Hidden on Mobile */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 absolute left-0">
            <Link 
              to="/online-training" 
              className="font-paragraph text-sm text-charcoal-black hover:text-warm-bronze transition-colors"
            >
              <span dangerouslySetInnerHTML={{ __html: t.nav.onlineTraining }} />
            </Link>
            <Link 
              to="/blog" 
              className="font-paragraph text-sm text-charcoal-black hover:text-warm-bronze transition-colors"
            >
              <span dangerouslySetInnerHTML={{ __html: t.nav.faceToFaceTraining }} />
            </Link>
          </nav>

          {/* Centered Brand Name - Split Color Wordmark */}
          <Link to="/" className="flex items-center justify-center hover:opacity-80 transition-opacity flex-shrink-0">
            <div className="flex items-center" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '54px', fontWeight: 400, letterSpacing: '7px' }}>
              <span style={{ color: '#000000' }}>moti</span>
              <span style={{ color: '#378ADD' }}>vasi</span>
            </div>
          </Link>

          {/* Right Navigation and Actions */}
          <div className="hidden md:flex items-center gap-4 lg:gap-5 absolute right-0">
            {isAuthenticated ? (
              <>
                {isTrainer ? (
                  <Link 
                    to="/trainer" 
                    className="font-paragraph text-sm lg:text-base text-charcoal-black hover:text-warm-bronze transition-colors"
                  >
                    Trainer Hub
                  </Link>
                ) : (
                  <Link 
                    to="/portal" 
                    className="font-paragraph text-sm lg:text-base text-charcoal-black hover:text-warm-bronze transition-colors"
                  >
                    My Portal
                  </Link>
                )}
                <button
                  onClick={actions.logout}
                  className="font-paragraph text-sm lg:text-base text-charcoal-black hover:text-warm-bronze transition-colors flex items-center gap-2 h-10 px-2"
                >
                  <LogOut size={16} className="text-charcoal-black" />
                  <span className="hidden lg:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <button 
                onClick={actions.login}
                className="text-charcoal-black hover:text-warm-bronze transition-colors flex items-center justify-center h-10 w-10"
              >
                <User size={20} className="text-charcoal-black" />
              </button>
            )}
            <LanguageSwitcher />
            <MiniCart cartIconClassName="[&_svg]:text-charcoal-black" />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden absolute right-0">
            <MiniCart cartIconClassName="[&_svg]:text-charcoal-black" />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-charcoal-black p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} className="text-charcoal-black" /> : <Menu size={24} className="text-charcoal-black" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-light-gray bg-white">
            <div className="flex flex-col gap-2">
              <Link 
                to="/online-training" 
                className="font-paragraph text-base text-charcoal-black hover:text-warm-bronze transition-colors px-4 py-3 rounded min-h-[44px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <span dangerouslySetInnerHTML={{ __html: t.nav.onlineTraining }} />
              </Link>
              <Link 
                to="/blog" 
                className="font-paragraph text-base text-charcoal-black hover:text-warm-bronze transition-colors px-4 py-3 rounded min-h-[44px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <span dangerouslySetInnerHTML={{ __html: t.nav.faceToFaceTraining }} />
              </Link>
              {isAuthenticated ? (
                <>
                  {isTrainer ? (
                    <Link 
                      to="/trainer" 
                      className="font-paragraph text-base text-charcoal-black hover:text-warm-bronze transition-colors px-4 py-3 rounded min-h-[44px] flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Trainer Hub
                    </Link>
                  ) : (
                    <Link 
                      to="/portal" 
                      className="font-paragraph text-base text-charcoal-black hover:text-warm-bronze transition-colors px-4 py-3 rounded min-h-[44px] flex items-center"
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
                    className="font-paragraph text-base text-charcoal-black hover:text-warm-bronze transition-colors flex items-center gap-2 px-4 py-3 rounded min-h-[44px] w-full text-left"
                  >
                    <LogOut size={16} className="text-charcoal-black" />
                    Sign Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    actions.login();
                    setIsMenuOpen(false);
                  }}
                  className="font-paragraph text-base text-charcoal-black border-2 border-charcoal-black bg-white px-4 py-3 rounded-lg hover:bg-charcoal-black hover:text-white transition-all font-semibold text-center w-full min-h-[44px]"
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
