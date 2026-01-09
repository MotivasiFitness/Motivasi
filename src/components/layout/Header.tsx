import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { MiniCart } from '@/wix-verticals/react-pages/react-router/routes/root';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-soft-white border-b border-warm-sand-beige sticky top-0 z-40">
      <div className="max-w-[100rem] mx-auto px-8 lg:px-20">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="font-heading text-2xl font-bold text-charcoal-black">
            Motivasi
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className="font-paragraph text-base text-charcoal-black hover:text-soft-bronze transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="font-paragraph text-base text-charcoal-black hover:text-soft-bronze transition-colors"
            >
              About
            </Link>
            <Link 
              to="/blog" 
              className="font-paragraph text-base text-charcoal-black hover:text-soft-bronze transition-colors"
            >
              Face-to-Face Training
            </Link>
            <Link 
              to="/store" 
              className="font-paragraph text-base bg-soft-bronze text-soft-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Book Now
            </Link>
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
                Home
              </Link>
              <Link 
                to="/about" 
                className="font-paragraph text-base text-charcoal-black hover:text-soft-bronze transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/blog" 
                className="font-paragraph text-base text-charcoal-black hover:text-soft-bronze transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Face-to-Face Training
              </Link>
              <Link 
                to="/store" 
                className="font-paragraph text-base bg-soft-bronze text-soft-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Book Now
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
