import { Link } from 'react-router-dom';
import { Instagram, Mail } from 'lucide-react';
import { useState } from 'react';
import { Image } from '@/components/ui/image';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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
              Empowering busy women to achieve fat loss and strength without extreme diets or intimidation.
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
                href="mailto:hello@sculptedsil.com"
                className="w-10 h-10 rounded-full bg-soft-bronze flex items-center justify-center hover:bg-opacity-80 transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-xl font-bold mb-4">Quick Links</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/" className="font-paragraph text-base text-warm-grey hover:text-soft-bronze transition-colors">
                Home
              </Link>
              <Link to="/about" className="font-paragraph text-base text-warm-grey hover:text-soft-bronze transition-colors">
                About
              </Link>
              <Link to="/blog" className="font-paragraph text-base text-warm-grey hover:text-soft-bronze transition-colors">
                Face-to-Face Training
              </Link>
              <Link to="/parq" className="font-paragraph text-base text-warm-grey hover:text-soft-bronze transition-colors">
                PAR-Q Form
              </Link>
              <Link to="/store" className="font-paragraph text-base text-warm-grey hover:text-soft-bronze transition-colors">
                Book Now
              </Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-heading text-xl font-bold mb-4">Stay Connected</h4>
            <p className="font-paragraph text-base text-warm-grey mb-4">
              Get weekly tips on strength training and nutrition.
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
                {isSubmitted ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-warm-grey mt-12 pt-8 text-center">
          <p className="font-paragraph text-sm text-warm-grey">
            © {new Date().getFullYear()} Motivasi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
