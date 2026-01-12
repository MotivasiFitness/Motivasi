import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { FitnessPrograms } from '@/entities';
import { Users, BookOpen, MessageSquare, TrendingUp, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TrainerDashboardPage() {
  const { member } = useMember();
  const [programs, setPrograms] = useState<FitnessPrograms[]>([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    activePrograms: 0,
    completedPrograms: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!member?._id) return;

      const { items } = await BaseCrudService.getAll<FitnessPrograms>('programs');
      const trainerPrograms = items.filter(p => p.trainerId === member._id);
      
      setPrograms(trainerPrograms);
      setStats({
        totalClients: new Set(trainerPrograms.map(p => p.clientId)).size,
        activePrograms: trainerPrograms.filter(p => p.status === 'Active').length,
        completedPrograms: trainerPrograms.filter(p => p.status === 'Completed').length,
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
    <div className="p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-2">
            Welcome Back, {member?.profile?.nickname || 'Trainer'}!
          </h1>
          <p className="text-lg text-warm-grey">
            Manage your clients, programs, and coaching sessions
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-paragraph text-sm text-warm-grey uppercase tracking-widest">
                Total Clients
              </h3>
              <Users className="text-soft-bronze" size={24} />
            </div>
            <p className="font-heading text-4xl font-bold text-charcoal-black">
              {stats.totalClients}
            </p>
          </div>

          <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-paragraph text-sm text-warm-grey uppercase tracking-widest">
                Active Programs
              </h3>
              <BookOpen className="text-soft-bronze" size={24} />
            </div>
            <p className="font-heading text-4xl font-bold text-charcoal-black">
              {stats.activePrograms}
            </p>
          </div>

          <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-paragraph text-sm text-warm-grey uppercase tracking-widest">
                Completed
              </h3>
              <TrendingUp className="text-soft-bronze" size={24} />
            </div>
            <p className="font-heading text-4xl font-bold text-charcoal-black">
              {stats.completedPrograms}
            </p>
          </div>

          <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-paragraph text-sm text-warm-grey uppercase tracking-widest">
                Messages
              </h3>
              <MessageSquare className="text-soft-bronze" size={24} />
            </div>
            <p className="font-heading text-4xl font-bold text-charcoal-black">
              0
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link
            to="/trainer/programs"
            className="bg-charcoal-black text-soft-white p-8 rounded-2xl hover:bg-soft-bronze transition-all duration-300 group"
          >
            <BookOpen className="mb-4 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="font-heading text-2xl font-bold mb-2">Create New Program</h3>
            <p className="text-warm-grey">Design a personalized fitness program for your client</p>
          </Link>

          <Link
            to="/trainer/clients"
            className="bg-soft-bronze text-soft-white p-8 rounded-2xl hover:bg-charcoal-black transition-all duration-300 group"
          >
            <Users className="mb-4 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="font-heading text-2xl font-bold mb-2">Manage Clients</h3>
            <p className="text-soft-white/80">View and manage all your assigned clients</p>
          </Link>

          <Link
            to="/trainer/video-reviews"
            className="bg-warm-sand-beige text-charcoal-black p-8 rounded-2xl hover:bg-soft-bronze hover:text-soft-white transition-all duration-300 group"
          >
            <Video className="mb-4 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="font-heading text-2xl font-bold mb-2">Video Reviews</h3>
            <p className="text-charcoal-black/70 group-hover:text-soft-white/80">Review exercise videos from clients</p>
          </Link>
        </div>

        {/* Recent Programs */}
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
            Recent Programs
          </h2>
          {programs.length === 0 ? (
            <p className="text-warm-grey text-center py-8">
              No programs yet. <Link to="/trainer/programs" className="text-soft-bronze hover:underline">Create your first program</Link>
            </p>
          ) : (
            <div className="space-y-4">
              {programs.slice(0, 5).map((program) => (
                <div
                  key={program._id}
                  className="flex items-center justify-between p-4 bg-warm-sand-beige/30 rounded-lg hover:bg-warm-sand-beige/50 transition-colors"
                >
                  <div>
                    <h3 className="font-paragraph font-bold text-charcoal-black">
                      {program.programName}
                    </h3>
                    <p className="text-sm text-warm-grey">
                      {program.focusArea} • {program.duration}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
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
