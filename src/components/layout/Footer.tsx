import { Link } from 'react-router-dom';
import { Instagram, Mail } from 'lucide-react';
import { useState } from 'react';
import { Image } from '@/components/ui/image';
import { useLanguage } from '@/i18n/LanguageContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setEmail('');
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <footer className="bg-charcoal-black text-soft-white">
      <div className="max-w-[100rem] mx-auto px-8 lg:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <Image
                src="https://static.wixstatic.com/media/93e866_81ff1c66b9e449bc92b4e3a2a753a5ec~mv2.png"
                alt="Motivasi Logo"
                className="h-6 w-auto"
                width={30}
              />
              <span className="font-heading text-lg font-bold text-soft-white">Motivasi</span>
            </Link>
            <p className="font-paragraph text-base text-warm-grey mb-6">
              {t.footer.empoweringBusy}
            </p>
            <div className="flex gap-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-soft-bronze flex items-center justify-center hover:bg-opacity-80 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="mailto:hello@motivasi.co.uk"
                className="w-10 h-10 rounded-full bg-soft-bronze flex items-center justify-center hover:bg-opacity-80 transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
            <p className="font-paragraph text-xs text-warm-grey/70 mt-6">
              Based in the United Kingdom
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-xl font-bold mb-4">Quick Links</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/" className="font-paragraph text-base text-warm-grey hover:text-soft-bronze transition-colors">
                {t.nav.home}
              </Link>
              <Link to="/about" className="font-paragraph text-base text-warm-grey hover:text-soft-bronze transition-colors">
                {t.nav.about}
              </Link>
              <Link to="/online-training" className="font-paragraph text-base text-warm-grey hover:text-soft-bronze transition-colors">
                {t.nav.onlineTraining}
              </Link>
              <Link to="/blog" className="font-paragraph text-base text-warm-grey hover:text-soft-bronze transition-colors">
                {t.nav.faceToFaceTraining}
              </Link>
              <Link to="/parq" className="font-paragraph text-base text-warm-grey hover:text-soft-bronze transition-colors">
                {t.nav.parqForm}
              </Link>
            </nav>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="font-heading text-xl font-bold mb-4">Legal & Compliance</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/privacy" className="font-paragraph text-base text-warm-grey hover:text-soft-bronze transition-colors">
                Privacy & Cookie Policy
              </Link>
              <Link to="/terms" className="font-paragraph text-base text-warm-grey hover:text-soft-bronze transition-colors">
                Terms & Conditions
              </Link>
              <Link to="/disclaimer" className="font-paragraph text-base text-warm-grey hover:text-soft-bronze transition-colors">
                Disclaimer
              </Link>
              <Link to="/accessibility" className="font-paragraph text-base text-warm-grey hover:text-soft-bronze transition-colors">
                Accessibility Statement
              </Link>
              <p className="font-paragraph text-xs text-warm-grey/70 mt-3 pt-3 border-t border-warm-grey/30">
                🛡️ Motivasi holds appropriate professional and public liability insurance.
              </p>
            </nav>
          </div>
          <div>
            <h4 className="font-heading text-xl font-bold mb-4">{t.footer.stayConnected}</h4>
            <p className="font-paragraph text-base text-warm-grey mb-4">
              {t.footer.getWeeklyTips}
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="px-4 py-3 rounded-lg bg-warm-sand-beige text-charcoal-black font-paragraph text-base focus:outline-none focus:ring-2 focus:ring-soft-bronze"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-soft-bronze text-soft-white rounded-lg font-paragraph text-base hover:bg-opacity-90 transition-colors"
              >
                {isSubmitted ? t.footer.subscribed : t.footer.subscribe}
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-warm-grey mt-12 pt-8">
          <div className="text-center mb-6">
            <p className="font-paragraph text-sm text-warm-grey leading-relaxed">
              © Motivasi {new Date().getFullYear()}. All rights reserved. Based in the United Kingdom. Personal data is processed in accordance with our <Link to="/privacy" className="text-soft-bronze hover:underline">Privacy & Cookie Policy</Link> and applicable data protection laws.
            </p>
          </div>
          <div className="text-center">
            <p className="font-paragraph text-xs text-warm-grey/70">
              <Link to="/privacy" className="text-soft-bronze hover:underline">Privacy & Cookie Policy</Link> | <Link to="/disclaimer" className="text-soft-bronze hover:underline">Disclaimer</Link> | <Link to="/accessibility" className="text-soft-bronze hover:underline">Accessibility</Link> | <button className="text-soft-bronze hover:underline">Cookie Settings</button>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
