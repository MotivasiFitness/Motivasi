import { useLanguage } from '@/i18n/LanguageContext';
import { Instagram, Mail } from 'lucide-react';
import { memo } from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white text-charcoal-black border-t border-light-gray relative overflow-hidden">
      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-20 py-24 sm:py-32 lg:py-40">

        {/* Main Footer Grid - Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16 lg:gap-20 mb-24 sm:mb-32 lg:mb-40 relative z-20">

          {/* Brand Section */}
          <div className="flex flex-col">
            <p className="font-paragraph text-sm text-medium-gray mb-8 leading-relaxed max-w-xs">
              {t.footer.empoweringBusy}
            </p>

            {/* Small Brand Logo */}
            <div className="mb-8">
              <div className="font-heading text-4xl font-bold leading-none">
                <span className="text-charcoal-black">moti</span>
                <span className="text-blue-600">vasi</span>
              </div>
            </div>

            {/* Social Icons */}
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

          {/* Quick Links */}
          <div>
            <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-charcoal-black mb-6">
              Quick Links
            </h4>

            <nav className="flex flex-col gap-3">
              <Link
                to="/"
                className="font-paragraph text-sm text-medium-gray hover:text-warm-bronze transition-colors"
              >
                {t.nav.home}
              </Link>

              <Link
                to="/about"
                className="font-paragraph text-sm text-medium-gray hover:text-warm-bronze transition-colors"
              >
                {t.nav.about}
              </Link>

              <Link
                to="/online-training"
                className="font-paragraph text-sm text-medium-gray hover:text-warm-bronze transition-colors"
              >
                Online
              </Link>

              <Link
                to="/blog"
                className="font-paragraph text-sm text-medium-gray hover:text-warm-bronze transition-colors"
              >
                Face-to-Face
              </Link>

              <Link
                to="/parq"
                className="font-paragraph text-sm text-medium-gray hover:text-warm-bronze transition-colors"
              >
                {t.nav.parqForm}
              </Link>
            </nav>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-charcoal-black mb-6">
              Legal & Compliance
            </h4>

            <nav className="flex flex-col gap-3">
              <Link
                to="/privacy"
                className="font-paragraph text-sm text-medium-gray hover:text-warm-bronze transition-colors"
              >
                Privacy & Cookie Policy
              </Link>

              <Link
                to="/terms"
                className="font-paragraph text-sm text-medium-gray hover:text-warm-bronze transition-colors"
              >
                Terms & Conditions
              </Link>

              <Link
                to="/disclaimer"
                className="font-paragraph text-sm text-medium-gray hover:text-warm-bronze transition-colors"
              >
                Disclaimer
              </Link>

              <Link
                to="/accessibility"
                className="font-paragraph text-sm text-medium-gray hover:text-warm-bronze transition-colors"
              >
                Accessibility Statement
              </Link>

              <p className="font-paragraph text-xs text-medium-gray mt-3 max-w-xs">
                Motivasi holds appropriate professional and public liability
                insurance.
              </p>
            </nav>
          </div>

          {/* Empty Right Column (Luxury spacing like Airoc) */}
          <div />
        </div>

        {/* Footer Bottom Section */}
        <div className="border-t border-light-gray pt-8 sm:pt-10 mt-40 sm:mt-52 lg:mt-64 relative z-20">

          {/* Large Background Watermark */}
          <div className="absolute -bottom-32 -right-12 pointer-events-none overflow-hidden opacity-5 w-full h-full flex items-end justify-end">
            <div className="text-right pr-4 sm:pr-8 lg:pr-12">
              <div className="font-heading text-[160px] sm:text-[220px] lg:text-[280px] font-bold leading-none whitespace-nowrap">
                <span className="text-charcoal-black">moti</span>
                <span className="text-blue-600">vasi</span>
              </div>
            </div>
          </div>

          {/* Bottom Content */}
          <div className="flex flex-col gap-6 relative z-10">
            <p className="font-paragraph text-xs text-medium-gray">
              © {new Date().getFullYear()} Motivasi Ltd. All rights reserved.
            </p>

            <div className="flex flex-wrap gap-4 sm:gap-6">
              <Link
                to="/privacy"
                className="font-paragraph text-xs text-medium-gray hover:text-warm-bronze transition-colors"
              >
                Privacy
              </Link>

              <Link
                to="/terms"
                className="font-paragraph text-xs text-medium-gray hover:text-warm-bronze transition-colors"
              >
                Terms & Policies
              </Link>

              <Link
                to="/accessibility"
                className="font-paragraph text-xs text-medium-gray hover:text-warm-bronze transition-colors"
              >
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
