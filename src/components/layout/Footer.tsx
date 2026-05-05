import { Link } from 'react-router-dom';
import { Instagram, Mail } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useLanguage } from '@/i18n/LanguageContext';
import { memo } from 'react';

function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-light-contrast text-primary-text border-t border-secondary-bg relative overflow-hidden">
      {/* Large Background Watermark Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="text-[120px] sm:text-[160px] md:text-[200px] lg:text-[240px] xl:text-[280px] font-heading font-bold leading-none whitespace-nowrap opacity-5 text-primary-text select-none">
          MOTIVASI
        </div>
      </div>

      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-20 py-24 sm:py-32 lg:py-40">
        {/* Main Footer Grid - Top Section - Centered */}
        <div className="flex flex-col items-center text-center mb-24 sm:mb-32 lg:mb-40 relative z-20">
          {/* Brand Section - Centered */}
          <div className="flex flex-col items-center mb-16 sm:mb-20 lg:mb-24">
            <p className="font-paragraph text-sm text-secondary-text mb-8 leading-relaxed max-w-md">
              {t.footer.empoweringBusy}
            </p>
            
            <div className="flex gap-4 mb-8 justify-center">
              <a 
                href="https://www.instagram.com/risewithmotivasi?igsh=bml4NmhnNw8yenht" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center hover:text-accent transition-colors text-primary-text"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="mailto:hello@motivasi.co.uk"
                className="w-10 h-10 flex items-center justify-center hover:text-accent transition-colors text-primary-text"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
            <p className="font-paragraph text-xs text-secondary-text">
              Based in the United Kingdom
            </p>
          </div>

          {/* Quick Links - Centered */}
          <div className="mb-16 sm:mb-20 lg:mb-24">
            <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-primary-text mb-6 letter-spacing-wide">Quick Links</h4>
            <nav className="flex flex-col gap-3 items-center">
              <Link to="/" className="font-paragraph text-sm text-secondary-text hover:text-accent transition-colors">
                {t.nav.home}
              </Link>
              <Link to="/about" className="font-paragraph text-sm text-secondary-text hover:text-accent transition-colors">
                {t.nav.about}
              </Link>
              <Link to="/online-training" className="font-paragraph text-sm text-secondary-text hover:text-accent transition-colors">
                Online
              </Link>
              <Link to="/blog" className="font-paragraph text-sm text-secondary-text hover:text-accent transition-colors">
                Face-to-Face
              </Link>
              <Link to="/parq" className="font-paragraph text-sm text-secondary-text hover:text-accent transition-colors">
                {t.nav.parqForm}
              </Link>
            </nav>
          </div>

          {/* Legal & Compliance - Centered */}
          <div className="mb-16 sm:mb-20 lg:mb-24">
            <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-primary-text mb-6 letter-spacing-wide">Legal & Compliance</h4>
            <nav className="flex flex-col gap-3 items-center">
              <Link to="/privacy" className="font-paragraph text-sm text-secondary-text hover:text-accent transition-colors">
                Privacy & Cookie Policy
              </Link>
              <Link to="/terms" className="font-paragraph text-sm text-secondary-text hover:text-accent transition-colors">
                Terms & Conditions
              </Link>
              <Link to="/disclaimer" className="font-paragraph text-sm text-secondary-text hover:text-accent transition-colors">
                Disclaimer
              </Link>
              <Link to="/accessibility" className="font-paragraph text-sm text-secondary-text hover:text-accent transition-colors">
                Accessibility Statement
              </Link>
              <p className="font-paragraph text-xs text-secondary-text mt-3 max-w-sm">
                Motivasi holds appropriate professional and public liability insurance.
              </p>
            </nav>
          </div>
        </div>

        {/* Footer Bottom Section - Centered */}
        <div className="border-t border-secondary-bg pt-8 sm:pt-10 mt-24 sm:mt-32 lg:mt-40 relative z-20">
          <div className="flex flex-col gap-6 items-center text-center">
            <p className="font-paragraph text-xs text-secondary-text">
              © {new Date().getFullYear()} Motivasi Ltd. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
              <Link to="/privacy" className="font-paragraph text-xs text-secondary-text hover:text-accent transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="font-paragraph text-xs text-secondary-text hover:text-accent transition-colors">
                Terms & Policies
              </Link>
              <Link to="/accessibility" className="font-paragraph text-xs text-secondary-text hover:text-accent transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
