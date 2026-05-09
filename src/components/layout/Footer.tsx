import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { useLanguage } from '@/i18n/LanguageContext';
import { memo } from 'react';

// Instagram Logo Component with Gradient
function InstagramLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="instagramGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FD5949" />
          <stop offset="5%" stopColor="#D6249F" />
          <stop offset="45%" stopColor="#285AEB" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#instagramGradient)" />
      <rect x="10" y="10" width="20" height="20" rx="4.5" fill="none" stroke="white" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="5.5" fill="none" stroke="white" strokeWidth="1.5" />
      <circle cx="27.5" cy="12.5" r="1.5" fill="white" />
    </svg>
  );
}

// Email Logo Component with Blue Circle Background
function EmailLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Blue circular background */}
      <circle cx="20" cy="20" r="20" fill="#1E88E5" />
      
      {/* White envelope icon */}
      <g>
        {/* Envelope body */}
        <rect x="10" y="13" width="20" height="14" rx="1.5" stroke="white" strokeWidth="1.5" fill="none" />
        
        {/* Envelope flap - top triangle */}
        <path d="M 10 13 L 20 20.5 L 30 13" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Mail lines - horizontal lines representing letter content */}
        <line x1="13" y1="17" x2="27" y2="17" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <line x1="13" y1="20" x2="27" y2="20" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <line x1="13" y1="23" x2="22" y2="23" stroke="white" strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-light-contrast text-primary-text border-t border-secondary-bg relative overflow-hidden">
      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-20 py-8 sm:py-10 lg:py-12 pb-4 sm:pb-6 lg:pb-8">
        {/* Main Footer Grid - Top Section - Centered */}
        <div className="flex flex-col items-center text-center mb-16 sm:mb-20 lg:mb-24 relative z-20">
          {/* Large Background Watermark Text - Brand Name */}
          <div className="flex items-center justify-center pointer-events-none overflow-hidden mb-4 sm:mb-6 lg:mb-8 w-full">
            <div className="text-[60px] sm:text-[100px] md:text-[130px] lg:text-[160px] xl:text-[200px] font-heading font-bold leading-none whitespace-nowrap opacity-5 text-primary-text select-none">
              MOTIVASI
            </div>
          </div>

          {/* Brand Section - Centered - Below Large Name */}
          <div className="flex flex-col items-center mb-12 sm:mb-16 lg:mb-20">
            <p className="font-paragraph text-sm text-secondary-text mb-8 leading-relaxed max-w-md">
              {t.footer.empoweringBusy}
            </p>
            
            <div className="flex gap-4 mb-8 justify-center">
              <a 
                href="https://www.instagram.com/risewithmotivasi?igsh=bml4NmhnNw8yenht" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:opacity-80 transition-opacity"
                aria-label="Instagram"
              >
                <InstagramLogo />
              </a>
              <a 
                href="mailto:hello@motivasi.co.uk"
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:opacity-80 transition-opacity"
                aria-label="Email"
              >
                <EmailLogo />
              </a>
            </div>
            <p className="font-paragraph text-xs text-secondary-text">
              Based in the United Kingdom
            </p>
          </div>

          {/* Quick Links & Legal & Compliance - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-24 mb-8 sm:mb-10 lg:mb-12 md:text-left">
            {/* Quick Links */}
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

            {/* Legal & Compliance */}
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
          </div>


        </div>

        {/* Footer Bottom Section - Centered */}
        <div className="border-t border-secondary-bg pt-8 sm:pt-10 mt-8 sm:mt-12 lg:mt-16 relative z-20">
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
