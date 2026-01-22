import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { ClientBookings, ClientProfiles } from '@/entities';
import { Calendar, Clock, Video, MapPin, Plus, Trash2, Lightbulb, ArrowRight } from 'lucide-react';
import { getClientFullName } from '@/lib/client-name-service';

export default function BookingsPage() {
  const { member } = useMember();
  const [bookings, setBookings] = useState<ClientBookings[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [clientProfile, setClientProfile] = useState<ClientProfiles | null>(null);
  const [formData, setFormData] = useState({
    serviceType: 'weekly-checkin',
    appointmentDate: '',
    appointmentTime: '',
    notes: ''
  });
  const [showAdditionalNotice, setShowAdditionalNotice] = useState(false);

  const ADDITIONAL_SESSION_PRICE = '50'; // Agreed additional session price in £
  const REVIEW_SESSION_PRICE = '30'; // Form Review & Progress Review pricing in £

  useEffect(() => {
    const fetchBookings = async () => {
      if (!member?.loginEmail) return;

      try {
        // Fetch client profile
        const { items: profiles } = await BaseCrudService.getAll<ClientProfiles>('clientprofiles');
        const profile = profiles.find(p => p.memberId === member.loginEmail);
        setClientProfile(profile || null);

        const { items } = await BaseCrudService.getAll<ClientBookings>('clientbookings');
        // Filter to only show future bookings
        const now = new Date();
        const futureBookings = items.filter(b => new Date(b.appointmentDate || '') > now);
        // Sort by date (upcoming first)
        const sorted = futureBookings.sort((a, b) => 
          new Date(a.appointmentDate || '').getTime() - new Date(b.appointmentDate || '').getTime()
        );
        setBookings(sorted);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [member?.loginEmail]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Show notice if "Additional" service is selected
    if (name === 'serviceType') {
      const isAdditional = ['training', 'nutrition', 'form-review', 'progress-review'].includes(value);
      setShowAdditionalNotice(isAdditional);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!member?.loginEmail) return;

    try {
      const clientName = getClientFullName(clientProfile, member.loginEmail);
      
      const newBooking: ClientBookings = {
        _id: crypto.randomUUID(),
        clientName,
        serviceType: formData.serviceType,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        status: 'pending',
        trainerNotes: formData.notes
      };

      await BaseCrudService.create('clientbookings', newBooking);

      // Refresh bookings - only future bookings
      const { items } = await BaseCrudService.getAll<ClientBookings>('clientbookings');
      const now = new Date();
      const futureBookings = items.filter(b => new Date(b.appointmentDate || '') > now);
      const sorted = futureBookings.sort((a, b) => 
        new Date(a.appointmentDate || '').getTime() - new Date(b.appointmentDate || '').getTime()
      );
      setBookings(sorted);

      // Reset form
      setFormData({
        serviceType: 'weekly-checkin',
        appointmentDate: '',
        appointmentTime: '',
        notes: ''
      });
      setShowAdditionalNotice(false);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await BaseCrudService.delete('clientbookings', bookingId);
      setBookings(bookings.filter(b => b._id !== bookingId));
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-warm-grey">Loading bookings...</p>
      </div>
    );
  }

  // All bookings are already filtered to be future bookings only
  const upcomingBookings = bookings;

  return (
    <div className="space-y-8 bg-warm-sand-beige/20 min-h-screen p-6 lg:p-8 rounded-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-soft-bronze to-soft-bronze/80 rounded-2xl p-8 text-soft-white">
        <h1 className="font-heading text-4xl font-bold mb-2">Bookings & Consultations</h1>
        <p className="text-soft-white/90">
          Schedule and manage your coaching sessions
        </p>
      </div>

      {/* Primary CTA - Schedule New Session */}
      <div className="space-y-3">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full bg-soft-bronze text-soft-white px-8 py-6 lg:py-7 rounded-xl font-bold text-lg lg:text-xl hover:bg-soft-bronze/90 transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
        >
          <Plus size={24} />
          Schedule New Session
          <ArrowRight size={20} className="ml-auto" />
        </button>
        <p className="text-center text-sm text-warm-grey font-medium">
          Takes under 30 seconds · Fits around family life
        </p>
      </div>

      {/* Booking Context Info Block */}
      <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6 lg:p-8 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Recommended Frequency */}
          <div className="flex flex-col items-center text-center p-4 bg-warm-sand-beige/20 rounded-xl">
            <p className="text-xs lg:text-sm text-warm-grey mb-1 uppercase tracking-wide font-medium">
              Recommended
            </p>
            <p className="font-heading text-2xl lg:text-3xl font-bold text-charcoal-black">
              1x/week
            </p>
            <p className="text-xs text-warm-grey mt-1">for best results</p>
          </div>

          {/* Upcoming Sessions Count */}
          <div className="flex flex-col items-center text-center p-4 bg-warm-sand-beige/20 rounded-xl">
            <p className="text-xs lg:text-sm text-warm-grey mb-1 uppercase tracking-wide font-medium">
              Upcoming
            </p>
            <p className="font-heading text-2xl lg:text-3xl font-bold text-soft-bronze">
              {upcomingBookings.length}
            </p>
            <p className="text-xs text-warm-grey mt-1">sessions booked</p>
          </div>
        </div>

        {/* Supportive Message */}
        {upcomingBookings.length === 0 && (
          <div className="pt-4 border-t border-warm-sand-beige">
            <p className="text-center text-sm text-charcoal-black leading-relaxed">
              <span className="font-medium">Booking ahead helps you stay consistent around family life.</span> When sessions are in the diary, you're more likely to show up for yourself.
            </p>
          </div>
        )}
      </div>

      {/* Booking Form */}
      {showForm && (
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
            Request a Session
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                Service Type
              </label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
              >
                <option value="initial-consultation">Initial Consultation (Included – one time)</option>
                <option value="weekly-checkin">Weekly Check-In Call (Included)</option>
                <option value="training">Training Session (Additional – £{ADDITIONAL_SESSION_PRICE})</option>
                <option value="nutrition">Nutrition Consultation (Additional – £{ADDITIONAL_SESSION_PRICE})</option>
                <option value="form-review">Form Review Session (Additional – £{REVIEW_SESSION_PRICE})</option>
                <option value="progress-review">Progress Review Call (Additional – £{REVIEW_SESSION_PRICE})</option>
              </select>
              
              {/* Helper Text */}
              <p className="text-xs text-warm-grey mt-2 leading-relaxed">
                Your programme includes one weekly check-in call. Additional sessions are charged separately and confirmed before booking.
              </p>
            </div>

            {/* Conditional Notice for Additional Sessions */}
            {showAdditionalNotice && (
              <div className="bg-warm-sand-beige/30 border border-warm-sand-beige rounded-lg p-4">
                <p className="text-sm text-charcoal-black leading-relaxed">
                  <span className="font-medium">ℹ️ This session is not included in your current package.</span> We'll confirm availability and pricing before finalising the booking.
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                />
              </div>
              <div>
                <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                  Preferred Time
                </label>
                <input
                  type="time"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                />
              </div>
            </div>

            <div>
              <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph resize-none"
                placeholder="Any specific topics you'd like to discuss?"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-charcoal-black text-soft-white px-8 py-3 rounded-lg font-medium hover:bg-soft-bronze transition-colors"
              >
                Request Booking
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setShowAdditionalNotice(false);
                }}
                className="flex-1 border border-warm-sand-beige text-charcoal-black px-8 py-3 rounded-lg font-medium hover:bg-warm-sand-beige/30 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upcoming Sessions */}
      <div>
        <h2 className="font-heading text-2xl lg:text-3xl font-bold text-charcoal-black mb-8">
          Upcoming Sessions
        </h2>
        {upcomingBookings.length > 0 ? (
          <div className="space-y-6">
            {upcomingBookings.map((booking) => (
              <div key={booking._id} className="bg-soft-white border border-soft-bronze/30 rounded-2xl p-6 lg:p-8 hover:border-soft-bronze hover:shadow-md transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-6 mb-5">
                  <div className="flex-1">
                    {/* Session Title */}
                    <h3 className="font-heading text-2xl lg:text-3xl font-bold text-charcoal-black mb-2">
                      {booking.serviceType === 'initial-consultation' && 'Initial Consultation'}
                      {booking.serviceType === 'weekly-checkin' && 'Weekly Check-In Call'}
                      {booking.serviceType === 'training' && 'Training Session'}
                      {booking.serviceType === 'nutrition' && 'Nutrition Consultation'}
                      {booking.serviceType === 'form-review' && 'Form Review Session'}
                      {booking.serviceType === 'progress-review' && 'Progress Review Call'}
                      {booking.serviceType === 'consultation' && 'Initial Consultation'}
                      {booking.serviceType === 'check-in' && 'Progress Check-in Call'}
                    </h3>

                    {/* Context Line */}
                    <p className="text-sm text-warm-grey font-medium mb-4">
                      {booking.serviceType === 'initial-consultation' && 'Get to know each other & plan your journey'}
                      {booking.serviceType === 'weekly-checkin' && 'Weekly accountability & progress review'}
                      {booking.serviceType === 'training' && 'Personalised workout with form guidance'}
                      {booking.serviceType === 'nutrition' && 'Nutrition guidance tailored to you'}
                      {booking.serviceType === 'form-review' && 'Technique analysis & improvement tips'}
                      {booking.serviceType === 'progress-review' && 'Progress tracking & programme adjustments'}
                      {booking.serviceType === 'consultation' && 'Get to know each other & plan your journey'}
                      {booking.serviceType === 'check-in' && 'Weekly accountability & progress review'}
                    </p>

                    {/* Date & Time */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-charcoal-black">
                        <Calendar size={18} className="text-soft-bronze flex-shrink-0" />
                        <span className="font-medium">
                          {new Date(booking.appointmentDate || '').toLocaleDateString('en-GB', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-charcoal-black">
                        <Clock size={18} className="text-soft-bronze flex-shrink-0" />
                        <span className="font-medium">{booking.appointmentTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Status & Actions */}
                  <div className="flex flex-col items-start lg:items-end gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {booking.status === 'confirmed' && '✓ Confirmed'}
                      {booking.status === 'pending' && '⏳ Pending'}
                      {!booking.status && 'Scheduled'}
                    </span>
                    {booking.videoCallLink && (
                      <a
                        href={booking.videoCallLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-soft-bronze hover:text-soft-bronze/80 transition-colors text-sm font-medium"
                      >
                        <Video size={16} />
                        Join Call
                      </a>
                    )}
                  </div>
                </div>

                {booking.trainerNotes && (
                  <div className="mb-5 p-4 bg-warm-sand-beige/30 rounded-lg border border-warm-sand-beige/50">
                    <p className="text-sm text-charcoal-black">
                      <span className="font-bold">Notes:</span> {booking.trainerNotes}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => handleDelete(booking._id)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors text-sm font-medium"
                >
                  <Trash2 size={16} />
                  Cancel Booking
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-12 text-center">
            <Calendar className="w-12 h-12 text-warm-grey mx-auto mb-4 opacity-50" />
            <p className="text-charcoal-black font-medium mb-2">
              No sessions booked yet — let's get one in the diary.
            </p>
            <p className="text-warm-grey text-sm mb-6">
              Booking ahead helps you stay consistent around family life.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-soft-bronze text-soft-white px-8 py-3 rounded-lg font-medium hover:bg-soft-bronze/90 transition-colors"
            >
              <Plus size={18} />
              Schedule a Session
            </button>
          </div>
        )}
      </div>

      {/* Supportive Nudge */}
      {upcomingBookings.length > 0 && (
        <div className="bg-soft-bronze/5 border border-soft-bronze/20 rounded-2xl p-6 flex gap-4 items-start">
          <Lightbulb size={20} className="text-soft-bronze flex-shrink-0 mt-0.5" />
          <p className="text-sm text-charcoal-black leading-relaxed">
            <span className="font-bold">💡 Clients who book ahead are more likely to stay consistent.</span> Having sessions in your calendar makes it easier to prioritize your health alongside family commitments.
          </p>
        </div>
      )}
    </div>
  );
}
