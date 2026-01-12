import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { ClientBookings } from '@/entities';
import { Calendar, Clock, Video, MapPin, Plus, Trash2 } from 'lucide-react';

export default function BookingsPage() {
  const { member } = useMember();
  const [bookings, setBookings] = useState<ClientBookings[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: 'consultation',
    appointmentDate: '',
    appointmentTime: '',
    notes: ''
  });

  useEffect(() => {
    const fetchBookings = async () => {
      if (!member?._id) return;

      try {
        const { items } = await BaseCrudService.getAll<ClientBookings>('clientbookings');
        // Sort by date (upcoming first)
        const sorted = items.sort((a, b) => 
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
  }, [member?._id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!member?._id) return;

    try {
      const newBooking: ClientBookings = {
        _id: crypto.randomUUID(),
        clientName: member?.contact?.firstName || member?.profile?.nickname || 'Client',
        serviceType: formData.serviceType,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        status: 'pending',
        trainerNotes: formData.notes
      };

      await BaseCrudService.create('clientbookings', newBooking);

      // Refresh bookings
      const { items } = await BaseCrudService.getAll<ClientBookings>('clientbookings');
      const sorted = items.sort((a, b) => 
        new Date(a.appointmentDate || '').getTime() - new Date(b.appointmentDate || '').getTime()
      );
      setBookings(sorted);

      // Reset form
      setFormData({
        serviceType: 'consultation',
        appointmentDate: '',
        appointmentTime: '',
        notes: ''
      });
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

  const upcomingBookings = bookings.filter(b => new Date(b.appointmentDate || '') > new Date());
  const pastBookings = bookings.filter(b => new Date(b.appointmentDate || '') <= new Date());

  return (
    <div className="space-y-8 bg-warm-grey/10 min-h-screen p-8 rounded-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-soft-bronze to-soft-bronze/80 rounded-2xl p-8 text-soft-white">
        <h1 className="font-heading text-4xl font-bold mb-2">Bookings & Consultations</h1>
        <p className="text-soft-white/90">
          Schedule and manage your coaching sessions
        </p>
      </div>

      {/* New Booking Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full bg-soft-bronze text-soft-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-soft-bronze/90 transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Schedule New Session
      </button>

      {/* Booking Form */}
      {showForm && (
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
            Schedule a Session
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
                <option value="consultation">Initial Consultation</option>
                <option value="training">Training Session</option>
                <option value="check-in">Progress Check-in Call</option>
                <option value="nutrition">Nutrition Consultation</option>
                <option value="form-review">Form Review Session</option>
              </select>
            </div>

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
                onClick={() => setShowForm(false)}
                className="flex-1 border border-warm-sand-beige text-charcoal-black px-8 py-3 rounded-lg font-medium hover:bg-warm-sand-beige/30 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <div>
          <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
            Upcoming Sessions
          </h2>
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <div key={booking._id} className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-heading text-xl font-bold text-charcoal-black mb-2">
                      {booking.serviceType?.replace('-', ' ').toUpperCase()}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-warm-grey">
                        <Calendar size={18} />
                        <span>
                          {new Date(booking.appointmentDate || '').toLocaleDateString('en-GB', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-warm-grey">
                        <Clock size={18} />
                        <span>{booking.appointmentTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status?.toUpperCase()}
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
                  <div className="mb-4 p-4 bg-warm-sand-beige/30 rounded-lg">
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
        </div>
      )}

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div>
          <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
            Past Sessions
          </h2>
          <div className="space-y-4">
            {pastBookings.map((booking) => (
              <div key={booking._id} className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6 opacity-75">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-charcoal-black mb-2">
                      {booking.serviceType?.replace('-', ' ').toUpperCase()}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-warm-grey">
                        <Calendar size={18} />
                        <span>
                          {new Date(booking.appointmentDate || '').toLocaleDateString('en-GB', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-warm-grey">
                        <Clock size={18} />
                        <span>{booking.appointmentTime}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    COMPLETED
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {bookings.length === 0 && !showForm && (
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-12 text-center">
          <Calendar className="w-12 h-12 text-warm-grey mx-auto mb-4 opacity-50" />
          <p className="text-warm-grey mb-4">
            No bookings yet. Schedule your first session!
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-soft-bronze text-soft-white px-6 py-3 rounded-lg font-medium hover:bg-soft-bronze/90 transition-colors"
          >
            <Plus size={16} />
            Schedule a Session
          </button>
        </div>
      )}
    </div>
  );
}
