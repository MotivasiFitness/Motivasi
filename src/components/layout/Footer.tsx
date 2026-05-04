import { Link } from 'react-router-dom';
import { Instagram, Mail } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useLanguage } from '@/i18n/LanguageContext';
import { memo } from 'react';

function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white text-charcoal-black border-t border-light-gray">
      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-20 py-16 sm:py-20">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16 lg:gap-20 mb-12">
          {/* Brand Section - Left */}
          <div className="flex flex-col">
            {/* Motivasi Logo */}
            <div className="mb-6 flex items-baseline gap-1">
              <span className="font-heading text-2xl font-bold text-charcoal-black">moti</span>
              <span className="font-heading text-2xl font-bold text-blue-600">vasi</span>
            </div>
            
            <p className="font-paragraph text-sm text-medium-gray mb-8 leading-relaxed max-w-xs">
              {t.footer.empoweringBusy}
            </p>
            <div className="flex gap-4 mb-8">
              <a 
                href="https://www.instagram.com/risewithmotivasi?igsh=bml4NmhnNw8yenht" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center hover:text-warm-bronze transition-colors text-charcoal-black"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="mailto:hello@motivasi.co.uk"
                className="w-10 h-10 flex items-center justify-center hover:text-warm-bronze transition-colors text-charcoal-black"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
            <p className="font-paragraph text-xs text-medium-gray">
              Based in the United Kingdom
            </p>
          </div>

          {/* Quick Links - Center Left */}
          <div>
            <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-charcoal-black mb-6 letter-spacing-wide">Quick Links</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/" className="font-paragraph text-sm text-medium-gray hover:text-warm-bronze transition-colors">
                {t.nav.home}
              </Link>
              <Link to="/about" className="font-paragraph text-sm text-medium-gray hover:text-warm-bronze transition-colors">
                {t.nav.about}
              </Link>
              <Link to="/online-training" className="font-paragraph text-sm text-medium-gray hover:text-warm-bronze transition-colors">
                Online
              </Link>
              <Link to="/blog" className="font-paragraph text-sm text-medium-gray hover:text-warm-bronze transition-colors">
                Face-to-Face
              </Link>
              <Link to="/parq" className="font-paragraph text-sm text-medium-gray hover:text-warm-bronze transition-colors">
                {t.nav.parqForm}
              </Link>
            </nav>
          </div>

          {/* Legal & Compliance - Center Right */}
          <div>
            <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-charcoal-black mb-6 letter-spacing-wide">Legal & Compliance</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/privacy" className="font-paragraph text-sm text-medium-gray hover:text-warm-bronze transition-colors">
                Privacy & Cookie Policy
              </Link>
              <Link to="/terms" className="font-paragraph text-sm text-medium-gray hover:text-warm-bronze transition-colors">
                Terms & Conditions
              </Link>
              <Link to="/disclaimer" className="font-paragraph text-sm text-medium-gray hover:text-warm-bronze transition-colors">
                Disclaimer
              </Link>
              <Link to="/accessibility" className="font-paragraph text-sm text-medium-gray hover:text-warm-bronze transition-colors">
                Accessibility Statement
              </Link>
              <p className="font-paragraph text-xs text-medium-gray mt-3">
                Motivasi holds appropriate professional and public liability insurance.
              </p>
            </nav>
          </div>

          {/* Right Column - Blank Space (Airoc Style) */}
          <div />
        </div>

        {/* Footer Bottom Divider */}
        <div className="border-t border-light-gray pt-8 sm:pt-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <p className="font-paragraph text-xs text-medium-gray">
              © {new Date().getFullYear()} Motivasi Ltd. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <Link to="/privacy" className="font-paragraph text-xs text-medium-gray hover:text-warm-bronze transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="font-paragraph text-xs text-medium-gray hover:text-warm-bronze transition-colors">
                Terms & Policies
              </Link>
              <Link to="/accessibility" className="font-paragraph text-xs text-medium-gray hover:text-warm-bronze transition-colors">
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
