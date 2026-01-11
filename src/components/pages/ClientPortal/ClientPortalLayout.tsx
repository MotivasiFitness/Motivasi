import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useMember } from '@/integrations';
import { Menu, X, LogOut, LayoutDashboard, Dumbbell, Apple, TrendingUp, Calendar, MessageSquare, Video, User } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function ClientPortalLayout() {
  const { member, actions } = useMember();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/portal', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/portal/program', label: 'My Program', icon: Dumbbell },
    { path: '/portal/nutrition', label: 'Nutrition', icon: Apple },
    { path: '/portal/progress', label: 'Progress', icon: TrendingUp },
    { path: '/portal/bookings', label: 'Bookings', icon: Calendar },
    { path: '/portal/messages', label: 'Messages', icon: MessageSquare },
    { path: '/portal/video-library', label: 'Video Library', icon: Video },
  ];

  const isActive = (path: string) => {
    if (path === '/portal') {
      return location.pathname === '/portal';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-soft-white flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-charcoal-black text-soft-white transform transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-8 border-b border-soft-bronze/20">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image
                src="https://static.wixstatic.com/media/93e866_81ff1c66b9e449bc92b4e3a2a753a5ec~mv2.png"
                alt="Motivasi Logo"
                className="h-8 w-auto"
                width={40}
              />
              <span className="font-heading text-xl font-bold">Motivasi</span>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-8 border-b border-soft-bronze/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-soft-bronze flex items-center justify-center">
                <User size={24} className="text-charcoal-black" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-paragraph font-bold text-sm truncate">
                  {member?.profile?.nickname || member?.contact?.firstName || 'Client'}
                </p>
                <p className="text-warm-grey text-xs truncate">
                  {member?.loginEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              const isRecommended = item.path === '/portal/program' || item.path === '/portal/messages';
              
              return (
                <div key={item.path} className="relative">
                  {isRecommended && !active && (
                    <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-soft-bronze rounded-r-full" />
                  )}
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-soft-bronze text-soft-white'
                        : isRecommended
                        ? 'bg-soft-bronze/10 text-soft-white hover:bg-soft-bronze/20'
                        : 'text-warm-grey hover:bg-soft-white/10'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-paragraph font-medium">{item.label}</span>
                    {isRecommended && !active && (
                      <span className="ml-auto text-xs bg-soft-bronze/30 px-2 py-1 rounded text-soft-white">
                        Recommended
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-8 border-t border-soft-bronze/20">
            <button
              onClick={() => {
                actions.logout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-soft-bronze/20 text-soft-bronze hover:bg-soft-bronze/30 transition-colors px-4 py-3 rounded-lg font-medium"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-charcoal-black text-soft-white px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <Link to="/" className="flex items-center gap-2">
            <Image
              src="https://static.wixstatic.com/media/93e866_81ff1c66b9e449bc92b4e3a2a753a5ec~mv2.png"
              alt="Motivasi Logo"
              className="h-6 w-auto"
              width={30}
            />
            <span className="font-heading font-bold">Motivasi</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-soft-white"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 px-6 lg:px-12 py-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
