import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { FitnessPrograms, ParqSubmissions } from '@/entities';
import { Users, BookOpen, MessageSquare, TrendingUp, Video, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import WeeklyRetentionSnapshot from './WeeklyRetentionSnapshot';
import WeeklyCoachNotesPanel from './WeeklyCoachNotesPanel';
import AtRiskClientSurfacing from './AtRiskClientSurfacing';

export default function TrainerDashboardPage() {
  const { member } = useMember();
  const [programs, setPrograms] = useState<FitnessPrograms[]>([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    activePrograms: 0,
    completedPrograms: 0,
    newParqSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!member?._id) return;

      const { items } = await BaseCrudService.getAll<FitnessPrograms>('programs');
      const trainerPrograms = items.filter(p => p.trainerId === member._id);
      
      // Fetch PAR-Q submissions
      const parqResult = await BaseCrudService.getAll<ParqSubmissions>('ParqSubmissions');
      const newParqCount = parqResult.items.filter(sub => sub.status === 'New').length;
      
      setPrograms(trainerPrograms);
      setStats({
        totalClients: new Set(trainerPrograms.map(p => p.clientId)).size,
        activePrograms: trainerPrograms.filter(p => p.status === 'Active').length,
        completedPrograms: trainerPrograms.filter(p => p.status === 'Completed').length,
        newParqSubmissions: newParqCount,
      });
      setLoading(false);
    };

    fetchData();
  }, [member?._id]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <p className="text-warm-grey">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 bg-soft-white min-h-screen">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-charcoal-black mb-3">
            Welcome Back, {member?.profile?.nickname || 'Trainer'}!
          </h1>
          <p className="text-xl text-warm-grey">
            Manage your clients, programs, and coaching sessions
          </p>
        </div>

        {/* Stats Grid - PRIMARY METRICS */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-soft-white border-2 border-warm-sand-beige rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-paragraph text-sm text-warm-grey uppercase tracking-widest font-bold">
                Total Clients
              </h3>
              <Users className="text-soft-bronze" size={28} />
            </div>
            <p className="font-heading text-5xl font-bold text-charcoal-black">
              {stats.totalClients}
            </p>
          </div>

          <div className="bg-soft-white border-2 border-warm-sand-beige rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-paragraph text-sm text-warm-grey uppercase tracking-widest font-bold">
                Active Programs
              </h3>
              <BookOpen className="text-soft-bronze" size={28} />
            </div>
            <p className="font-heading text-5xl font-bold text-charcoal-black">
              {stats.activePrograms}
            </p>
          </div>

          <div className="bg-soft-white border-2 border-warm-sand-beige rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-paragraph text-sm text-warm-grey uppercase tracking-widest font-bold">
                Completed
              </h3>
              <TrendingUp className="text-soft-bronze" size={28} />
            </div>
            <p className="font-heading text-5xl font-bold text-charcoal-black">
              {stats.completedPrograms}
            </p>
          </div>

          <Link
            to="/trainer/parq-submissions"
            className="bg-soft-white border-2 border-warm-sand-beige rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow relative"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-paragraph text-sm text-warm-grey uppercase tracking-widest font-bold">
                PAR-Q Forms
              </h3>
              <ClipboardList className="text-soft-bronze" size={28} />
            </div>
            <p className="font-heading text-5xl font-bold text-charcoal-black">
              {stats.newParqSubmissions}
            </p>
            {stats.newParqSubmissions > 0 && (
              <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                NEW
              </div>
            )}
          </Link>
        </div>

        {/* Quick Actions - PRIMARY HERO CARDS */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            to="/trainer/programs"
            className="bg-charcoal-black text-soft-white p-10 rounded-2xl hover:bg-soft-bronze transition-all duration-300 group shadow-xl"
          >
            <BookOpen className="mb-5 group-hover:scale-110 transition-transform" size={40} />
            <h3 className="font-heading text-3xl font-bold mb-3">Create New Program</h3>
            <p className="text-warm-sand-beige text-base leading-relaxed">Design a personalised fitness programme for your client</p>
          </Link>

          <Link
            to="/trainer/clients"
            className="bg-soft-bronze text-soft-white p-10 rounded-2xl hover:bg-charcoal-black transition-all duration-300 group shadow-xl"
          >
            <Users className="mb-5 group-hover:scale-110 transition-transform" size={40} />
            <h3 className="font-heading text-3xl font-bold mb-3">Manage Clients</h3>
            <p className="text-soft-white/90 text-base leading-relaxed">View and manage all your assigned clients</p>
          </Link>

          <Link
            to="/trainer/video-reviews"
            className="bg-warm-sand-beige text-charcoal-black p-10 rounded-2xl hover:bg-soft-bronze hover:text-soft-white transition-all duration-300 group shadow-xl"
          >
            <Video className="mb-5 group-hover:scale-110 transition-transform" size={40} />
            <h3 className="font-heading text-3xl font-bold mb-3">Video Reviews</h3>
            <p className="text-charcoal-black/80 group-hover:text-soft-white/90 text-base leading-relaxed">Review exercise videos from clients</p>
          </Link>
        </div>

        {/* Weekly Retention Snapshot - SECONDARY SECTION */}
        <div>
          <WeeklyRetentionSnapshot />
        </div>

        {/* At-Risk Client Surfacing - SECONDARY PRIORITY SECTION */}
        <div>
          <AtRiskClientSurfacing />
        </div>

        {/* Weekly Coach Notes Panel - SECONDARY SECTION */}
        <div>
          <WeeklyCoachNotesPanel />
        </div>

        {/* Recent Programs - TERTIARY SECTION */}
        <div className="bg-soft-white border-2 border-warm-sand-beige rounded-xl p-10 shadow-sm">
          <h2 className="font-heading text-3xl font-bold text-charcoal-black mb-8">
            Recent Programs
          </h2>
          {programs.length === 0 ? (
            <p className="text-warm-grey text-center py-10 text-lg">
              No programs yet. <Link to="/trainer/programs" className="text-soft-bronze hover:underline font-bold">Create your first program</Link>
            </p>
          ) : (
            <div className="space-y-4">
              {programs.slice(0, 5).map((program) => (
                <div
                  key={program._id}
                  className="flex items-center justify-between p-6 bg-warm-sand-beige/30 rounded-xl hover:bg-warm-sand-beige/50 transition-colors"
                >
                  <div>
                    <h3 className="font-paragraph font-bold text-charcoal-black text-lg">
                      {program.programName}
                    </h3>
                    <p className="text-base text-warm-grey">
                      {program.focusArea} • {program.duration}
                    </p>
                  </div>
                  <span className={`px-5 py-2 rounded-full text-sm font-bold ${
                    program.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : program.status === 'Completed'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {program.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
