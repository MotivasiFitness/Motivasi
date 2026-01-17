import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { ClientProfiles } from '@/entities';
import { Menu, X, LogOut, LayoutDashboard, Dumbbell, Apple, TrendingUp, Calendar, Video, User, Loader, AlertCircle, Archive, MoreHorizontal } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useRole } from '@/hooks/useRole';
import PortalHeader from '@/components/layout/PortalHeader';
import MotivaChat from '@/components/ClientPortal/MotivaChat';
import { getClientDisplayName } from '@/lib/client-name-service';
import { ProfileCompletionGuard } from '@/components/ClientPortal/ProfileCompletionGuard';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export default function ClientPortalLayout() {
  const { member, actions } = useMember();
  const { isClient, isAdmin, isLoading, setupError, debugInfo, role } = useRole();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [clientProfile, setClientProfile] = useState<ClientProfiles | null>(null);
  const location = useLocation();

  // Close drawers on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMoreDrawerOpen(false);
  }, [location.pathname]);

  // Fetch client profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!member?.loginEmail) return;
      
      try {
        const { items: profiles } = await BaseCrudService.getAll<ClientProfiles>('clientprofiles');
        const profile = profiles.find(p => p.memberId === member.loginEmail);
        setClientProfile(profile || null);
      } catch (error) {
        console.error('Error fetching client profile:', error);
      }
    };

    fetchProfile();
  }, [member?.loginEmail]);

  // Determine redirect reason
  let redirectReason = '';
  if (!isLoading && !isClient && !isAdmin && !setupError) {
    redirectReason = 'User is not a client or admin';
  }

  // Show setup error with retry option
  if (setupError && isLoading === false) {
    return (
      <div className="min-h-screen bg-soft-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
              Account Setup Failed
            </h2>
            <p className="font-paragraph text-base text-warm-grey mb-6">
              {setupError}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setRetryCount(retryCount + 1);
                  window.location.reload();
                }}
                className="w-full bg-soft-bronze text-soft-white py-3 rounded-lg font-medium hover:bg-soft-bronze/90 transition-colors"
              >
                Retry Setup (Attempt {retryCount + 1})
              </button>
              <button
                onClick={() => actions.logout()}
                className="w-full bg-charcoal-black text-soft-white py-3 rounded-lg font-medium hover:bg-charcoal-black/90 transition-colors"
              >
                Sign Out
              </button>
            </div>
            <p className="font-paragraph text-xs text-warm-grey mt-6">
              If this problem persists, please contact support at hello@motivasi.co.uk
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect non-clients and non-admins away from client portal
  // Admins can access for management and testing purposes
  if (!isLoading && !isClient && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-soft-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-soft-bronze mx-auto mb-4" />
          <p className="font-paragraph text-lg text-warm-grey">
            Setting up your account…
          </p>
        </div>
      </div>
    );
  }

  // Primary navigation items - Core features (mobile bottom bar + desktop sidebar)
  const primaryNavItems = [
    { path: '/portal', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-400' },
    { path: '/portal/program', label: 'My Program', icon: Dumbbell, color: 'text-emerald-400' },
    { path: '/portal/history', label: 'History', icon: Archive, color: 'text-slate-400' },
    { path: '/portal/progress', label: 'Progress', icon: TrendingUp, color: 'text-orange-400' },
    { path: '/portal/profile', label: 'Profile', icon: User, color: 'text-pink-400' },
  ];

  // Secondary navigation items - Additional features ("More" drawer on mobile + desktop sidebar)
  const secondaryNavItems = [
    { path: '/portal/bookings', label: 'Bookings', icon: Calendar, color: 'text-purple-400' },
    { path: '/portal/nutrition', label: 'Nutrition', icon: Apple, color: 'text-yellow-400' },
    { path: '/portal/video-library', label: 'Video Library', icon: Video, color: 'text-cyan-400' },
  ];

  // All navigation items for desktop sidebar (primary + secondary)
  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  const isActive = (path: string) => {
    if (path === '/portal') {
      return location.pathname === '/portal';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <ProfileCompletionGuard>
      <div className="min-h-screen bg-soft-white flex flex-col pb-20 lg:pb-0">
        {/* Portal Header - Replaces Global Header */}
        <PortalHeader portalType="client" />

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Desktop Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block w-64 bg-charcoal-black text-soft-white">
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
                      {getClientDisplayName(clientProfile, member?.loginEmail)}
                    </p>
                    <p className="text-warm-grey text-xs truncate">
                      {member?.loginEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                {allNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <div key={item.path} className="relative">
                      {active && (
                        <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-soft-bronze rounded-r-full" />
                      )}
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          active
                            ? 'bg-soft-bronze text-soft-white'
                            : 'text-warm-grey hover:bg-soft-white/10'
                        }`}
                      >
                        <Icon size={20} className={item.color} />
                        <span className="font-paragraph font-medium">{item.label}</span>
                      </Link>
                    </div>
                  );
                })}
              </nav>

              {/* Logout Button */}
              <div className="p-8 border-t border-soft-bronze/20">
                <button
                  onClick={() => actions.logout()}
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
            {/* Page Content */}
            <main className="flex-1 px-6 lg:px-12 py-8 overflow-y-auto">
              <Outlet />
            </main>
          </div>
        </div>

        {/* Mobile Bottom Navigation - Only visible on mobile */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-charcoal-black border-t border-soft-bronze/20 z-50">
          <div className="flex items-center justify-around px-2 py-3">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-0 flex-1 ${
                    active ? 'text-soft-bronze' : 'text-warm-grey'
                  }`}
                >
                  <Icon size={22} className={active ? 'text-soft-bronze' : item.color} />
                  <span className="font-paragraph text-xs font-medium truncate w-full text-center">
                    {item.label}
                  </span>
                </Link>
              );
            })}
            
            {/* More Button */}
            <button
              onClick={() => setIsMoreDrawerOpen(true)}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-warm-grey min-w-0 flex-1"
            >
              <MoreHorizontal size={22} className="text-warm-grey" />
              <span className="font-paragraph text-xs font-medium truncate w-full text-center">
                More
              </span>
            </button>
          </div>
        </nav>

        {/* More Drawer - Mobile Only */}
        <Sheet open={isMoreDrawerOpen} onOpenChange={setIsMoreDrawerOpen}>
          <SheetContent side="bottom" className="bg-charcoal-black text-soft-white border-t border-soft-bronze/20 rounded-t-3xl">
            <SheetHeader className="mb-6">
              <SheetTitle className="font-heading text-2xl font-bold text-soft-white">
                More Options
              </SheetTitle>
            </SheetHeader>
            
            <div className="space-y-2 mb-6">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMoreDrawerOpen(false)}
                    className={`flex items-center gap-4 px-4 py-4 rounded-lg transition-colors ${
                      active
                        ? 'bg-soft-bronze text-soft-white'
                        : 'text-warm-grey hover:bg-soft-white/10'
                    }`}
                  >
                    <Icon size={22} className={item.color} />
                    <span className="font-paragraph font-medium text-base">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Info & Logout in More Drawer */}
            <div className="border-t border-soft-bronze/20 pt-6 space-y-4">
              <div className="flex items-center gap-3 px-4">
                <div className="w-12 h-12 rounded-full bg-soft-bronze flex items-center justify-center">
                  <User size={24} className="text-charcoal-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-paragraph font-bold text-sm truncate text-soft-white">
                    {getClientDisplayName(clientProfile, member?.loginEmail)}
                  </p>
                  <p className="text-warm-grey text-xs truncate">
                    {member?.loginEmail}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  actions.logout();
                  setIsMoreDrawerOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-soft-bronze/20 text-soft-bronze hover:bg-soft-bronze/30 transition-colors px-4 py-3 rounded-lg font-medium"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </SheetContent>
        </Sheet>

        {/* MotivaChat - Available on all client portal pages */}
        <MotivaChat />
      </div>
    </ProfileCompletionGuard>
  );
}
