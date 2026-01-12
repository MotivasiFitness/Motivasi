import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { ProgressCheckins } from '@/entities';
import { Upload, TrendingUp, Calendar } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function ProgressPage() {
  const { member } = useMember();
  const [checkins, setCheckins] = useState<ProgressCheckins[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    weight: '',
    energyLevel: '',
    notes: '',
    photoFront: '',
    photoSide: '',
    photoBack: '',
    measurements: ''
  });

  useEffect(() => {
    const fetchCheckins = async () => {
      if (!member?._id) return;

      try {
        const { items } = await BaseCrudService.getAll<ProgressCheckins>('progresscheckins');
        // Sort by date (most recent first)
        const sorted = items.sort((a, b) => 
          new Date(b.checkinDate || '').getTime() - new Date(a.checkinDate || '').getTime()
        );
        setCheckins(sorted);
      } catch (error) {
        console.error('Error fetching progress checkins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckins();
  }, [member?._id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const newCheckin: ProgressCheckins = {
        _id: crypto.randomUUID(),
        checkinDate: new Date().toISOString(),
        currentWeight: formData.weight ? parseFloat(formData.weight) : undefined,
        energyLevel: formData.energyLevel ? parseInt(formData.energyLevel) : undefined,
        clientNotes: formData.notes,
        progressPhotoFront: formData.photoFront,
        progressPhotoSide: formData.photoSide,
        progressPhotoBack: formData.photoBack,
        bodyMeasurements: formData.measurements
      };

      await BaseCrudService.create('progresscheckins', newCheckin);
      
      // Refresh checkins
      const { items } = await BaseCrudService.getAll<ProgressCheckins>('progresscheckins');
      const sorted = items.sort((a, b) => 
        new Date(b.checkinDate || '').getTime() - new Date(a.checkinDate || '').getTime()
      );
      setCheckins(sorted);

      // Reset form
      setFormData({
        weight: '',
        energyLevel: '',
        notes: '',
        photoFront: '',
        photoSide: '',
        photoBack: '',
        measurements: ''
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting checkin:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-warm-grey">Loading progress data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-charcoal-black/5 min-h-screen p-8 rounded-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-soft-bronze to-soft-bronze/80 rounded-2xl p-8 text-soft-white">
        <h1 className="font-heading text-4xl font-bold mb-2">Progress Check-ins</h1>
        <p className="text-soft-white/90">
          Track your transformation with regular check-ins
        </p>
      </div>

      {/* Submit New Check-in Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full bg-soft-bronze text-soft-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-soft-bronze/90 transition-colors flex items-center justify-center gap-2"
      >
        <Upload size={20} />
        Submit New Check-in
      </button>

      {/* Check-in Form */}
      {showForm && (
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
            New Progress Check-in
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                  placeholder="e.g., 65.5"
                />
              </div>
              <div>
                <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                  Energy Level (1-10)
                </label>
                <input
                  type="number"
                  name="energyLevel"
                  value={formData.energyLevel}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                  placeholder="e.g., 8"
                />
              </div>
            </div>

            <div>
              <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                Body Measurements
              </label>
              <input
                type="text"
                name="measurements"
                value={formData.measurements}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                placeholder="e.g., Chest: 95cm, Waist: 78cm, Hips: 98cm"
              />
            </div>

            <div>
              <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                Your Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph resize-none"
                placeholder="How are you feeling? Any changes you've noticed? Challenges or wins this week?"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                  Front Photo URL
                </label>
                <input
                  type="url"
                  name="photoFront"
                  value={formData.photoFront}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                  Side Photo URL
                </label>
                <input
                  type="url"
                  name="photoSide"
                  value={formData.photoSide}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                  Back Photo URL
                </label>
                <input
                  type="url"
                  name="photoBack"
                  value={formData.photoBack}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-charcoal-black text-soft-white px-8 py-3 rounded-lg font-medium hover:bg-soft-bronze transition-colors"
              >
                Submit Check-in
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

      {/* Check-ins Timeline */}
      {checkins.length > 0 ? (
        <div className="space-y-6">
          {checkins.map((checkin, idx) => (
            <div key={checkin._id} className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-heading text-xl font-bold text-charcoal-black mb-2">
                    Check-in #{checkins.length - idx}
                  </h3>
                  <div className="flex items-center gap-2 text-warm-grey text-sm">
                    <Calendar size={16} />
                    <span>
                      {new Date(checkin.checkinDate || '').toLocaleDateString('en-GB', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                {checkin.currentWeight && (
                  <div className="text-right">
                    <p className="text-warm-grey text-sm">Weight</p>
                    <p className="font-heading text-3xl font-bold text-soft-bronze">
                      {checkin.currentWeight}
                    </p>
                    <p className="text-warm-grey text-xs">kg</p>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  {checkin.energyLevel && (
                    <div>
                      <p className="text-warm-grey text-sm mb-1">Energy Level</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-warm-sand-beige rounded-full h-2">
                          <div
                            className="bg-soft-bronze h-2 rounded-full"
                            style={{ width: `${(checkin.energyLevel / 10) * 100}%` }}
                          />
                        </div>
                        <span className="font-bold text-charcoal-black">{checkin.energyLevel}/10</span>
                      </div>
                    </div>
                  )}

                  {checkin.bodyMeasurements && (
                    <div>
                      <p className="text-warm-grey text-sm mb-1">Measurements</p>
                      <p className="text-charcoal-black">{checkin.bodyMeasurements}</p>
                    </div>
                  )}

                  {checkin.clientNotes && (
                    <div>
                      <p className="text-warm-grey text-sm mb-1">Your Notes</p>
                      <p className="text-charcoal-black">{checkin.clientNotes}</p>
                    </div>
                  )}
                </div>

                {/* Photos Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {checkin.progressPhotoFront && (
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={checkin.progressPhotoFront}
                        alt="Front progress photo"
                        className="w-full h-full object-cover"
                        width={200}
                      />
                    </div>
                  )}
                  {checkin.progressPhotoSide && (
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={checkin.progressPhotoSide}
                        alt="Side progress photo"
                        className="w-full h-full object-cover"
                        width={200}
                      />
                    </div>
                  )}
                  {checkin.progressPhotoBack && (
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={checkin.progressPhotoBack}
                        alt="Back progress photo"
                        className="w-full h-full object-cover"
                        width={200}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-12 text-center">
          <TrendingUp className="w-12 h-12 text-warm-grey mx-auto mb-4 opacity-50" />
          <p className="text-warm-grey mb-4">
            No check-ins yet. Start tracking your progress today!
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-soft-bronze text-soft-white px-6 py-3 rounded-lg font-medium hover:bg-soft-bronze/90 transition-colors"
          >
            <Upload size={16} />
            Submit Your First Check-in
          </button>
        </div>
      )}
    </div>
  );
}
