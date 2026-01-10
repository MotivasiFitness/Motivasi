import { Link } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Image } from '@/components/ui/image';
import { MiniCart } from '@/wix-verticals/react-pages/react-router/routes/root';
import { useLanguage } from '@/i18n/LanguageContext';
import { useMember } from '@/integrations';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { member, isAuthenticated, actions } = useMember();

  return (
    <header className="bg-soft-white border-b border-warm-sand-beige sticky top-0 z-40">
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
              className="font-paragraph text-base text-charcoal-black hover:text-soft-bronze transition-colors"
            >
              {t.nav.home}
            </Link>
            <Link 
              to="/about" 
              className="font-paragraph text-base text-charcoal-black hover:text-soft-bronze transition-colors"
            >
              {t.nav.about}
            </Link>
            <Link 
              to="/online-training" 
              className="font-paragraph text-base text-charcoal-black hover:text-soft-bronze transition-colors"
            >
              {t.nav.onlineTraining}
            </Link>
            <Link 
              to="/blog" 
              className="font-paragraph text-base text-charcoal-black hover:text-soft-bronze transition-colors"
            >
              {t.nav.faceToFaceTraining}
            </Link>
            <a 
              href="#contact" 
              className="font-paragraph text-base text-charcoal-black hover:text-soft-bronze transition-colors"
            >
              {t.nav.contact}
            </a>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/portal" 
                  className="font-paragraph text-base text-charcoal-black hover:text-soft-bronze transition-colors"
                >
                  My Portal
                </Link>
                <button
                  onClick={actions.logout}
                  className="font-paragraph text-base text-charcoal-black hover:text-soft-bronze transition-colors flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <Link 
                to="/store" 
                className="font-paragraph text-base bg-soft-bronze text-soft-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                {t.nav.bookNow}
              </Link>
            )}
            <LanguageSwitcher />
            <MiniCart cartIconClassName="ml-2" />
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <MiniCart cartIconClassName="" />
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
          <nav className="md:hidden py-4 border-t border-warm-sand-beige">
            <div className="flex flex-col gap-4">
              <Link 
                to="/" 
                className="font-paragraph text-base text-charcoal-black hover:text-soft-bronze transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.home}
              </Link>
              <Link 
                to="/about" 
                className="font-paragraph text-base text-charcoal-black hover:text-soft-bronze transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.about}
              </Link>
              <Link 
                to="/online-training" 
                className="font-paragraph text-base text-charcoal-black hover:text-soft-bronze transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.onlineTraining}
              </Link>
              <Link 
                to="/blog" 
                className="font-paragraph text-base text-charcoal-black hover:text-soft-bronze transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.faceToFaceTraining}
              </Link>
              <a 
                href="#contact" 
                className="font-paragraph text-base text-charcoal-black hover:text-soft-bronze transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.contact}
              </a>
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/portal" 
                    className="font-paragraph text-base text-charcoal-black hover:text-soft-bronze transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Portal
                  </Link>
                  <button
                    onClick={() => {
                      actions.logout();
                      setIsMenuOpen(false);
                    }}
                    className="font-paragraph text-base text-charcoal-black hover:text-soft-bronze transition-colors flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link 
                  to="/store" 
                  className="font-paragraph text-base bg-soft-bronze text-soft-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t.nav.bookNow}
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
