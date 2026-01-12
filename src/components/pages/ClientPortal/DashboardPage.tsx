import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { ClientBookings, ProgressCheckins, NutritionGuidance } from '@/entities';
import { Calendar, CheckCircle, TrendingUp, Zap, Heart, ArrowRight } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { member } = useMember();
  const [upcomingBookings, setUpcomingBookings] = useState<ClientBookings[]>([]);
  const [latestCheckIn, setLatestCheckIn] = useState<ProgressCheckins | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!member?._id) return;

      try {
        // Fetch upcoming bookings
        const { items: bookings } = await BaseCrudService.getAll<ClientBookings>('clientbookings');
        const upcomingFiltered = bookings
          .filter(b => {
            const appointmentDate = new Date(b.appointmentDate || '');
            return appointmentDate > new Date();
          })
          .sort((a, b) => new Date(a.appointmentDate || '').getTime() - new Date(b.appointmentDate || '').getTime())
          .slice(0, 3);
        setUpcomingBookings(upcomingFiltered);

        // Fetch latest check-in
        const { items: checkins } = await BaseCrudService.getAll<ProgressCheckins>('progresscheckins');
        if (checkins.length > 0) {
          const sorted = checkins.sort((a, b) => 
            new Date(b.checkinDate || '').getTime() - new Date(a.checkinDate || '').getTime()
          );
          setLatestCheckIn(sorted[0]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [member?._id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-warm-grey">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-warm-sand-beige/40 min-h-screen p-8 rounded-2xl">
      {/* Welcome Section with Primary CTA */}
      <div className="bg-gradient-to-r from-soft-bronze to-soft-bronze/80 rounded-2xl p-8 text-soft-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="font-heading text-4xl font-bold mb-2">
              Welcome back, {member?.profile?.nickname || member?.contact?.firstName}!
            </h1>
            <p className="text-soft-white/90">
              You're making great progress. Keep up the momentum!
            </p>
          </div>
          <Link
            to="/portal/bookings"
            className="inline-flex items-center gap-2 bg-soft-white text-soft-bronze px-10 py-5 rounded-lg font-bold text-lg hover:bg-soft-white/90 transition-colors whitespace-nowrap shadow-lg"
          >
            Book Your Next Session
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-charcoal-black">Progress Tracked</h3>
            <TrendingUp className="text-soft-bronze" size={24} />
          </div>
          <p className="font-heading text-4xl font-bold text-charcoal-black">
            {latestCheckIn ? '✓' : '0'}
          </p>
          <p className="text-warm-grey text-sm mt-2">
            {latestCheckIn ? 'Last check-in completed' : 'No check-ins yet'}
          </p>
        </div>

        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-charcoal-black">Consistency</h3>
            <Zap className="text-soft-bronze" size={24} />
          </div>
          <p className="font-heading text-4xl font-bold text-charcoal-black">
            100%
          </p>
          <p className="text-warm-grey text-sm mt-2">
            🔥 You stayed consistent this week. That's how real results are built.
          </p>
        </div>

        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-charcoal-black">Upcoming Sessions</h3>
            <Calendar className="text-soft-bronze" size={24} />
          </div>
          <p className="font-heading text-4xl font-bold text-charcoal-black">
            {upcomingBookings.length}
          </p>
          <p className="text-warm-grey text-sm mt-2">
            {upcomingBookings.length > 0 ? 'scheduled this month' : 'No sessions booked yet'}
          </p>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-2xl font-bold text-charcoal-black">Upcoming Sessions</h2>
          <Link to="/portal/bookings" className="text-soft-bronze hover:underline text-sm font-medium">
            View all
          </Link>
        </div>

        {upcomingBookings.length > 0 ? (
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <div key={booking._id} className="flex items-center justify-between p-4 bg-warm-sand-beige/30 rounded-lg">
                <div>
                  <h3 className="font-paragraph font-bold text-charcoal-black">
                    {booking.serviceType}
                  </h3>
                  <p className="text-warm-grey text-sm">
                    {new Date(booking.appointmentDate || '').toLocaleDateString('en-GB', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  booking.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-warm-sand-beige/20 border border-warm-sand-beige rounded-lg p-6 text-center">
            <p className="text-charcoal-black font-medium mb-2">
              No sessions booked yet
            </p>
            <p className="text-warm-grey text-sm mb-6">
              Clients who book ahead stay more consistent around family life.
            </p>
            <Link 
              to="/portal/bookings" 
              className="inline-flex items-center gap-2 bg-soft-bronze text-soft-white hover:bg-soft-bronze/90 transition-colors font-bold px-6 py-3 rounded-lg"
            >
              Schedule in 30 seconds
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>

      {/* Latest Check-in */}
      {latestCheckIn && (
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-bold text-charcoal-black">Latest Progress Check-in</h2>
            <Link to="/portal/progress" className="text-soft-bronze hover:underline text-sm font-medium">
              View all
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="space-y-4">
                <div>
                  <p className="text-warm-grey text-sm mb-1">Check-in Date</p>
                  <p className="font-paragraph font-bold text-charcoal-black">
                    {new Date(latestCheckIn.checkinDate || '').toLocaleDateString('en-GB', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                {latestCheckIn.currentWeight && (
                  <div>
                    <p className="text-warm-grey text-sm mb-1">Current Weight</p>
                    <p className="font-heading text-3xl font-bold text-soft-bronze">
                      {latestCheckIn.currentWeight} kg
                    </p>
                  </div>
                )}
                {latestCheckIn.energyLevel && (
                  <div>
                    <p className="text-warm-grey text-sm mb-1">Energy Level</p>
                    <p className="font-paragraph font-bold text-charcoal-black">
                      {latestCheckIn.energyLevel}/10
                    </p>
                  </div>
                )}
                {latestCheckIn.clientNotes && (
                  <div>
                    <p className="text-warm-grey text-sm mb-1">Your Notes</p>
                    <p className="font-paragraph text-charcoal-black">
                      {latestCheckIn.clientNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {latestCheckIn.progressPhotoFront && (
              <div className="aspect-square rounded-xl overflow-hidden">
                <Image
                  src={latestCheckIn.progressPhotoFront}
                  alt="Progress photo"
                  className="w-full h-full object-cover"
                  width={400}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Coach Support Block */}
      <div className="bg-gradient-to-r from-soft-bronze/10 to-soft-bronze/5 border border-soft-bronze/30 rounded-2xl p-8">
        <div className="flex items-start gap-4">
          <Heart className="text-soft-bronze flex-shrink-0 mt-1" size={28} />
          <div>
            <h3 className="font-heading text-xl font-bold text-charcoal-black mb-2">
              You're not doing this alone
            </h3>
            <p className="text-warm-grey">
              Your coach is reviewing your progress and is always here if you need support. Don't hesitate to reach out with questions or if you need adjustments to your program.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link
          to="/portal/program"
          className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8 hover:border-soft-bronze transition-colors group"
        >
          <h3 className="font-heading text-xl font-bold text-charcoal-black mb-2 group-hover:text-soft-bronze transition-colors">
            My Program
          </h3>
          <p className="text-warm-grey">View your personalized workout plan</p>
        </Link>

        <Link
          to="/portal/nutrition"
          className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8 hover:border-soft-bronze transition-colors group"
        >
          <h3 className="font-heading text-xl font-bold text-charcoal-black mb-2 group-hover:text-soft-bronze transition-colors">
            Nutrition Guidance
          </h3>
          <p className="text-warm-grey">Check your meal plans and nutrition tips</p>
        </Link>

        <Link
          to="/portal/messages"
          className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8 hover:border-soft-bronze transition-colors group"
        >
          <h3 className="font-heading text-xl font-bold text-charcoal-black mb-2 group-hover:text-soft-bronze transition-colors">
            Messages
          </h3>
          <p className="text-warm-grey">Chat with your trainer</p>
        </Link>

        <Link
          to="/portal/video-library"
          className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8 hover:border-soft-bronze transition-colors group"
        >
          <h3 className="font-heading text-xl font-bold text-charcoal-black mb-2 group-hover:text-soft-bronze transition-colors">
            Video Library
          </h3>
          <p className="text-warm-grey">Access exercise demos and guidance videos</p>
        </Link>
      </div>
    </div>
  );
}
