import { useMember } from '@/integrations';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { MessageSquare, Users, BookOpen, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function TrainerDashboardLayout() {
  const { member, actions } = useMember();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/trainer', label: 'Dashboard', icon: Users },
    { path: '/trainer/clients', label: 'My Clients', icon: Users },
    { path: '/trainer/programs', label: 'Programs', icon: BookOpen },
    { path: '/trainer/messages', label: 'Messages', icon: MessageSquare },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-soft-white flex flex-col lg:flex-row">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-charcoal-black text-soft-white rounded-lg"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-0 lg:inset-auto w-64 bg-charcoal-black text-soft-white flex flex-col z-40 transform transition-transform lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-soft-bronze/20">
          <h1 className="font-heading text-2xl font-bold text-soft-white">Trainer Hub</h1>
          <p className="text-sm text-warm-grey mt-2">
            {member?.profile?.nickname || member?.loginEmail}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-soft-bronze text-soft-white'
                    : 'text-warm-grey hover:bg-soft-bronze/10'
                }`}
              >
                <Icon size={20} />
                <span className="font-paragraph">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-soft-bronze/20 space-y-3">
          <Link
            to="/trainer/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-warm-grey hover:bg-soft-bronze/10 transition-colors"
          >
            <Settings size={20} />
            <span className="font-paragraph">Settings</span>
          </Link>
          <button
            onClick={actions.logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-warm-grey hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-paragraph">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full lg:w-auto pt-16 lg:pt-0">
        <Outlet />
      </main>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
