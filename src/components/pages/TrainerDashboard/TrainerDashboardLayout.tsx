import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { Users, BookOpen, Settings, LogOut, Menu, X, Loader, Sparkles, Video, Apple, MessageSquare, LayoutDashboard, FolderOpen, Dumbbell, TrendingUp, ChevronDown, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRole } from '@/hooks/useRole';
import PortalHeader from '@/components/layout/PortalHeader';
import NotificationsPanel from './NotificationsPanel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TrainerProfiles } from '@/entities';

export default function TrainerDashboardLayout() {
  const { member, actions } = useMember();
  const { isTrainer, isAdmin, isLoading } = useRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trainerProfile, setTrainerProfile] = useState<TrainerProfiles | null>(null);
  const location = useLocation();

  // Allow trainers and admins to access trainer portal
  // Admins can access for management and testing purposes
  if (!isLoading && !isTrainer && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Load trainer profile for avatar
  useEffect(() => {
    const loadTrainerProfile = async () => {
      if (!member?._id) return;
      
      try {
        console.log('[Sidebar] Loading trainer profile for member:', member._id);
        const { items } = await BaseCrudService.getAll<TrainerProfiles>('trainerprofiles');
        const profile = items.find(p => p.memberId === member._id);
        if (profile) {
          console.log('[Sidebar] Found profile:', profile._id);
          console.log('[Sidebar] Profile photo URL:', profile.profilePhoto);
          setTrainerProfile(profile);
        } else {
          console.log('[Sidebar] No profile found for member');
        }
      } catch (error) {
        console.error('[Sidebar] Error loading trainer profile:', error);
      }
    };

    if (member?._id) {
      loadTrainerProfile();
    }

    // Listen for profile updates
    const handleProfileUpdate = () => {
      console.log('[Sidebar] Profile update event received, reloading...');
      loadTrainerProfile();
    };

    window.addEventListener('trainerProfileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('trainerProfileUpdated', handleProfileUpdate);
    };
  }, [member?._id]);

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
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-heading text-2xl font-bold text-soft-white">Trainer Hub</h1>
              <NotificationsPanel />
            </div>
            
            {/* Trainer Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-soft-white/5 transition-colors cursor-pointer group">
                  <Avatar className="w-10 h-10">
                    <AvatarImage 
                      src={trainerProfile?.profilePhoto || member?.profile?.photo?.url} 
                      alt={trainerProfile?.displayName || member?.profile?.nickname || 'Trainer'} 
                    />
                    <AvatarFallback className="bg-soft-bronze text-soft-white font-heading">
                      {(trainerProfile?.displayName || member?.profile?.nickname || member?.loginEmail)?.charAt(0).toUpperCase() || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-soft-white">
                      {trainerProfile?.displayName || member?.profile?.nickname || member?.contact?.firstName || 'Trainer'}
                    </p>
                    <p className="text-xs text-warm-grey">
                      {member?.loginEmail}
                    </p>
                  </div>
                  <ChevronDown size={16} className="text-warm-grey group-hover:text-soft-white transition-colors" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="w-56 bg-charcoal-black border-soft-bronze/20 text-soft-white"
              >
                <DropdownMenuItem asChild>
                  <Link 
                    to="/trainer/profile" 
                    className="flex items-center gap-2 cursor-pointer hover:bg-soft-white/5"
                  >
                    <User size={16} className="text-soft-bronze" />
                    <span className="font-paragraph">Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    to="/trainer/preferences" 
                    className="flex items-center gap-2 cursor-pointer hover:bg-soft-white/5"
                  >
                    <Settings size={16} className="text-soft-bronze" />
                    <span className="font-paragraph">Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-soft-bronze/20" />
                <DropdownMenuItem 
                  onClick={actions.logout}
                  className="flex items-center gap-2 cursor-pointer hover:bg-red-500/10 text-red-400"
                >
                  <LogOut size={16} />
                  <span className="font-paragraph">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          <div className="p-6 border-t border-soft-bronze/20">
            <p className="text-xs text-warm-grey text-center">
              Trainer Hub v1.0
            </p>
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
