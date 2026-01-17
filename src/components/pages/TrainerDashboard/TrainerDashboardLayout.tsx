import { useMember } from '@/integrations';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { Users, BookOpen, Settings, LogOut, Menu, X, Loader, Sparkles, Video, Apple, MessageSquare, LayoutDashboard, FolderOpen, Dumbbell, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRole } from '@/hooks/useRole';
import PortalHeader from '@/components/layout/PortalHeader';
import NotificationsPanel from './NotificationsPanel';

export default function TrainerDashboardLayout() {
  const { member, actions } = useMember();
  const { isTrainer, isAdmin, isLoading } = useRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Allow trainers and admins to access trainer portal
  // Admins can access for management and testing purposes
  if (!isLoading && !isTrainer && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-soft-white flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-soft-bronze" />
      </div>
    );
  }

  const navSections = [
    {
      title: 'Core',
      color: 'text-soft-bronze',
      hoverColor: 'hover:text-soft-bronze',
      items: [
        { path: '/trainer', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/trainer/clients', label: 'My Clients', icon: Users },
      ]
    },
    {
      title: 'Programs & Work',
      color: 'text-blue-400',
      hoverColor: 'hover:text-blue-400',
      items: [
        { path: '/trainer/programs', label: 'Create Program', icon: BookOpen },
        { path: '/trainer/programs-created', label: 'My Programs', icon: FolderOpen },
        { path: '/trainer/workout-assignment', label: 'Assign Workouts', icon: Dumbbell },
      ]
    },
    {
      title: 'Content & Media',
      color: 'text-purple-400',
      hoverColor: 'hover:text-purple-400',
      items: [
        { path: '/trainer/video-reviews', label: 'Client Video Reviews', icon: Video },
        { path: '/trainer/video-library', label: 'Video Library', icon: Video },
      ]
    },
    {
      title: 'Insights',
      color: 'text-emerald-400',
      hoverColor: 'hover:text-emerald-400',
      items: [
        { path: '/trainer/workout-feedback', label: 'Client Feedback', icon: MessageSquare },
        { path: '/trainer/progress', label: 'Client Progress', icon: TrendingUp },
        { path: '/trainer/nutrition', label: 'Nutrition', icon: Apple },
      ]
    },
    {
      title: 'Tools',
      color: 'text-amber-400',
      hoverColor: 'hover:text-amber-400',
      items: [
        { path: '/trainer/ai-assistant', label: 'AI Assistant', icon: Sparkles },
      ]
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-soft-white flex flex-col">
      {/* Portal Header - Replaces Global Header */}
      <PortalHeader portalType="trainer" />

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-charcoal-black text-soft-white rounded-lg"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-0 lg:inset-auto w-64 bg-charcoal-black text-soft-white flex flex-col z-40 transform transition-transform lg:translate-x-0 mt-16 lg:mt-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo/Header */}
          <div className="p-6 border-b border-soft-bronze/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading text-2xl font-bold text-soft-white">Trainer Hub</h1>
                <p className="text-sm text-warm-grey mt-2">
                  {member?.profile?.nickname || member?.loginEmail}
                </p>
              </div>
              <NotificationsPanel />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-6 overflow-y-auto">
            {navSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {/* Section Header */}
                <h3 className="text-xs font-semibold text-warm-grey uppercase tracking-wider mb-3 px-4">
                  {section.title}
                </h3>
                
                {/* Section Items */}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative group ${
                          active
                            ? 'bg-soft-bronze/10 text-soft-bronze border-l-4 border-soft-bronze'
                            : 'text-warm-grey hover:bg-soft-white/5 hover:text-soft-white border-l-4 border-transparent'
                        }`}
                      >
                        <Icon 
                          size={20} 
                          className={active ? 'text-soft-bronze' : `${section.color} ${section.hoverColor} transition-colors`} 
                        />
                        <span className="font-paragraph text-sm">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-soft-bronze/20 space-y-3">
            <Link
              to="/trainer/preferences"
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
        <main className="flex-1 w-full lg:w-auto">
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
    </div>
  );
}
