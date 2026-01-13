import { Link } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Image } from '@/components/ui/image';
import { useMember } from '@/integrations';
import { useRole } from '@/hooks/useRole';

interface PortalHeaderProps {
  portalType: 'client' | 'trainer';
}

export default function PortalHeader({ portalType }: PortalHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { member, actions } = useMember();
  const { isTrainer, isClient } = useRole();

  const portalTitle = portalType === 'trainer' ? 'Trainer Hub' : 'Client Portal';
  const backLink = portalType === 'trainer' ? '/trainer' : '/portal';

  return (
    <header className="bg-charcoal-black border-b border-soft-bronze/20 sticky top-0 z-40">
      <div className="max-w-[100rem] mx-auto px-6 lg:px-20">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Title */}
          <Link to={backLink} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="https://static.wixstatic.com/media/93e866_81ff1c66b9e449bc92b4e3a2a753a5ec~mv2.png"
              alt="Motivasi Logo"
              className="h-6 md:h-8 w-auto"
              width={40}
            />
            <div className="hidden sm:flex flex-col">
              <span className="font-heading text-sm font-bold text-soft-white">Motivasi</span>
              <span className="text-xs text-warm-grey">{portalTitle}</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* User Info */}
            <div className="text-right">
              <p className="font-paragraph text-sm font-medium text-soft-white">
                {member?.profile?.nickname || member?.contact?.firstName || 'User'}
              </p>
              <p className="text-xs text-warm-grey truncate max-w-xs">
                {member?.loginEmail}
              </p>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={actions.logout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-soft-bronze/20 text-soft-bronze hover:bg-soft-bronze/30 transition-colors font-paragraph text-sm font-medium"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-soft-white p-2"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-soft-bronze/20 space-y-4">
            <div className="px-4 py-3 bg-soft-bronze/10 rounded-lg">
              <p className="font-paragraph text-sm font-medium text-soft-white">
                {member?.profile?.nickname || member?.contact?.firstName || 'User'}
              </p>
              <p className="text-xs text-warm-grey mt-1">
                {member?.loginEmail}
              </p>
            </div>
            <button
              onClick={() => {
                actions.logout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-soft-bronze/20 text-soft-bronze hover:bg-soft-bronze/30 transition-colors font-paragraph text-sm font-medium"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
