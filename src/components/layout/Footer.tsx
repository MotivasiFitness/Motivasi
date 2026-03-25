import { Link } from 'react-router-dom';
import { Instagram, Mail } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useLanguage } from '@/i18n/LanguageContext';
import { memo } from 'react';

function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-soft-lavender text-dark-gray">
      {/* Decorative Botanical Divider */}
      <div className="relative h-12 bg-soft-lavender overflow-hidden">
        <svg
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Curved wave divider */}
          <path
            d="M0,30 Q300,10 600,30 T1200,30 L1200,0 L0,0 Z"
            fill="#F4E4F1"
            opacity="0.5"
          />
          {/* Leaf pattern accent */}
          <g opacity="0.3" fill="#c9a876">
            {/* Left leaves */}
            <ellipse cx="150" cy="25" rx="8" ry="12" transform="rotate(-30 150 25)" />
            <ellipse cx="180" cy="20" rx="6" ry="10" transform="rotate(20 180 20)" />
            {/* Center leaves */}
            <ellipse cx="600" cy="15" rx="9" ry="13" transform="rotate(-40 600 15)" />
            <ellipse cx="630" cy="22" rx="7" ry="11" transform="rotate(35 630 22)" />
            {/* Right leaves */}
            <ellipse cx="1050" cy="20" rx="8" ry="12" transform="rotate(-25 1050 20)" />
            <ellipse cx="1080" cy="28" rx="6" ry="10" transform="rotate(30 1080 28)" />
          </g>
        </svg>
      </div>

      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-20 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
          {/* Brand Section */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <Image
                src="https://static.wixstatic.com/media/93e866_81ff1c66b9e449bc92b4e3a2a753a5ec~mv2.png"
                alt="Motivasi Logo"
                className="h-6 w-auto"
                width={30}
              />
              <span className="font-heading text-lg font-bold text-soft-bronze">Motivasi</span>
            </Link>
            <p className="font-paragraph text-sm sm:text-base text-dark-gray mb-6">
              {t.footer.empoweringBusy}
            </p>
            <div className="flex gap-3 sm:gap-4">
              <a 
                href="https://www.instagram.com/risewithmotivasi?igsh=bml4NmhnNw8yenht" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-rose-blush flex items-center justify-center hover:bg-rose-blush/80 transition-colors text-charcoal-black min-h-[44px] min-w-[44px]"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="mailto:hello@motivasi.co.uk"
                className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-rose-blush flex items-center justify-center hover:bg-rose-blush/80 transition-colors text-charcoal-black min-h-[44px] min-w-[44px]"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
            <p className="font-paragraph text-xs text-dark-gray/70 mt-6">
              Based in the United Kingdom
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg sm:text-xl font-bold mb-4 text-dark-gray">Quick Links</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/" className="font-paragraph text-sm sm:text-base text-dark-gray hover:text-soft-bronze transition-colors py-2 px-2 rounded min-h-[44px] flex items-center">
                {t.nav.home}
              </Link>
              <Link to="/about" className="font-paragraph text-sm sm:text-base text-dark-gray hover:text-soft-bronze transition-colors py-2 px-2 rounded min-h-[44px] flex items-center">
                {t.nav.about}
              </Link>
              <Link to="/online-training" className="font-paragraph text-sm sm:text-base text-dark-gray hover:text-soft-bronze transition-colors py-2 px-2 rounded min-h-[44px] flex items-center">
                {t.nav.onlineTraining}
              </Link>
              <Link to="/blog" className="font-paragraph text-sm sm:text-base text-dark-gray hover:text-soft-bronze transition-colors py-2 px-2 rounded min-h-[44px] flex items-center">
                {t.nav.faceToFaceTraining}
              </Link>
              <Link to="/parq" className="font-paragraph text-sm sm:text-base text-dark-gray hover:text-soft-bronze transition-colors py-2 px-2 rounded min-h-[44px] flex items-center">
                {t.nav.parqForm}
              </Link>
            </nav>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="font-heading text-lg sm:text-xl font-bold mb-4 text-dark-gray">Legal & Compliance</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/privacy" className="font-paragraph text-sm sm:text-base text-dark-gray hover:text-soft-bronze transition-colors py-2 px-2 rounded min-h-[44px] flex items-center">
                Privacy & Cookie Policy
              </Link>
              <Link to="/terms" className="font-paragraph text-sm sm:text-base text-dark-gray hover:text-soft-bronze transition-colors py-2 px-2 rounded min-h-[44px] flex items-center">
                Terms & Conditions
              </Link>
              <Link to="/disclaimer" className="font-paragraph text-sm sm:text-base text-dark-gray hover:text-soft-bronze transition-colors py-2 px-2 rounded min-h-[44px] flex items-center">
                Disclaimer
              </Link>
              <Link to="/accessibility" className="font-paragraph text-sm sm:text-base text-dark-gray hover:text-soft-bronze transition-colors py-2 px-2 rounded min-h-[44px] flex items-center">
                Accessibility Statement
              </Link>
              <p className="font-paragraph text-xs text-dark-gray/70 mt-3 pt-3 border-t border-dark-gray/20">
                Motivasi holds appropriate professional and public liability insurance.
              </p>
            </nav>
          </div>
        </div>

        <div className="border-t border-dark-gray/20 mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="text-center mb-4 sm:mb-6">
            <p className="font-paragraph text-xs sm:text-sm text-dark-gray leading-relaxed">
              © Motivasi {new Date().getFullYear()}. All rights reserved. Based in the United Kingdom. Personal data is processed in accordance with our <Link to="/privacy" className="text-soft-bronze hover:underline">Privacy & Cookie Policy</Link> and applicable data protection laws.
            </p>
          </div>
          <div className="text-center">
            <p className="font-paragraph text-xs text-dark-gray/70 flex flex-wrap justify-center gap-2 sm:gap-3">
              <Link to="/privacy" className="text-soft-bronze hover:underline">Privacy</Link>
              <span>|</span>
              <Link to="/disclaimer" className="text-soft-bronze hover:underline">Disclaimer</Link>
              <span>|</span>
              <Link to="/accessibility" className="text-soft-bronze hover:underline">Accessibility</Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
