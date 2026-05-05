import { Link } from 'react-router-dom';
import { Instagram, Mail } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useLanguage } from '@/i18n/LanguageContext';
import { memo } from 'react';

function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-light-contrast text-primary-text border-t border-secondary-bg relative overflow-hidden">
      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-20 py-24 sm:py-32 lg:py-40">
        {/* Main Footer Grid - Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16 lg:gap-20 mb-24 sm:mb-32 lg:mb-40 relative z-20">
          {/* Brand Section - Left */}
          <div className="flex flex-col">
            <p className="font-paragraph text-sm text-secondary-text mb-8 leading-relaxed max-w-xs">
              {t.footer.empoweringBusy}
            </p>
            

            <div className="flex gap-4 mb-8">
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

          {/* Quick Links - Center Left */}
          <div>
            <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-primary-text mb-6 letter-spacing-wide">Quick Links</h4>
            <nav className="flex flex-col gap-3">
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

          {/* Legal & Compliance - Center Right */}
          <div>
            <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-primary-text mb-6 letter-spacing-wide">Legal & Compliance</h4>
            <nav className="flex flex-col gap-3">
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
              <p className="font-paragraph text-xs text-secondary-text mt-3">
                Motivasi holds appropriate professional and public liability insurance.
              </p>
            </nav>
          </div>

          {/* Right Column - Blank Space (Airoc Style) */}
          <div />
        </div>

        {/* Footer Bottom Section - Below Large Brand Name */}
        <div className="border-t border-secondary-bg pt-8 sm:pt-10 mt-24 sm:mt-32 lg:mt-40 relative z-20">
          {/* Large Background Watermark - Motivasi Branding */}
          <div className="absolute -bottom-12 -right-12 pointer-events-none overflow-hidden opacity-5 w-full h-full flex items-end justify-end">
            <div className="text-right pr-4 sm:pr-8 lg:pr-12">
              <div className="font-heading text-[200px] sm:text-[250px] lg:text-[320px] font-bold leading-none whitespace-nowrap">
                <span className="text-primary-text">moti</span>
                <span className="text-blue-600">vasi</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6 relative z-10">
            <p className="font-paragraph text-xs text-secondary-text">
              © {new Date().getFullYear()} Motivasi Ltd. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 sm:gap-6">
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
