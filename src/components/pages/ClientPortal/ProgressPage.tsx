import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { ProgressCheckins } from '@/entities';
import { Upload, TrendingUp, Calendar, ChevronDown, ChevronUp, Heart, Zap, TrendingUpIcon, MessageSquare } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function ProgressPage() {
  const { member } = useMember();
  const [checkins, setCheckins] = useState<ProgressCheckins[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedCheckins, setExpandedCheckins] = useState<Set<string>>(new Set());
  const [showOlderCheckins, setShowOlderCheckins] = useState(false);
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
        
        // Expand the first 2 most recent check-ins by default
        const defaultExpanded = new Set<string>();
        sorted.slice(0, 2).forEach(checkin => {
          defaultExpanded.add(checkin._id);
        });
        setExpandedCheckins(defaultExpanded);
      } catch (error) {
        console.error('Error fetching progress checkins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckins();
  }, [member?._id]);

  const toggleCheckinExpanded = (id: string) => {
    const newExpanded = new Set(expandedCheckins);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCheckins(newExpanded);
  };

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
    <div className="space-y-6 bg-warm-sand-beige/10 min-h-screen p-6 lg:p-8 rounded-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-soft-bronze to-soft-bronze/80 rounded-2xl p-8 text-soft-white">
        <h1 className="font-heading text-4xl font-bold mb-2">Progress Check-ins</h1>
        <p className="text-soft-white/90">
          Track your transformation with regular check-ins
        </p>
      </div>

      {/* Progress Snapshot Summary Card */}
      {checkins.length > 0 && (
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6 lg:p-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
            📊 Your Progress Snapshot
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Energy Levels Trend */}
            <div className="bg-warm-sand-beige/30 border border-warm-sand-beige rounded-xl p-5 hover:bg-soft-bronze hover:text-soft-white hover:border-soft-bronze transition-all duration-300">
              <div className="flex items-start gap-3 mb-3">
                <Zap size={20} className="flex-shrink-0 mt-0.5" />
                <h3 className="font-paragraph font-bold">Energy Levels Improving</h3>
              </div>
              <p className="font-paragraph text-sm leading-relaxed opacity-90">
                Your energy is trending upward — a sign that recovery and nutrition are on track.
              </p>
            </div>

            {/* Measurements Trend */}
            <div className="bg-warm-sand-beige/30 border border-warm-sand-beige rounded-xl p-5 hover:bg-soft-bronze hover:text-soft-white hover:border-soft-bronze transition-all duration-300">
              <div className="flex items-start gap-3 mb-3">
                <TrendingUpIcon size={20} className="flex-shrink-0 mt-0.5" />
                <h3 className="font-paragraph font-bold">Measurements Trending Right</h3>
              </div>
              <p className="font-paragraph text-sm leading-relaxed opacity-90">
                Your body composition is moving in the right direction — consistency is paying off.
              </p>
            </div>

            {/* Strength & Confidence */}
            <div className="bg-warm-sand-beige/30 border border-warm-sand-beige rounded-xl p-5 hover:bg-soft-bronze hover:text-soft-white hover:border-soft-bronze transition-all duration-300">
              <div className="flex items-start gap-3 mb-3">
                <Heart size={20} className="flex-shrink-0 mt-0.5" />
                <h3 className="font-paragraph font-bold">Strength & Confidence</h3>
              </div>
              <p className="font-paragraph text-sm leading-relaxed opacity-90">
                You're building real strength — progress isn't just weight, how you feel matters most.
              </p>
            </div>
          </div>

          {/* Reassurance Message */}
          <div className="bg-soft-bronze/5 border border-soft-bronze/20 rounded-lg p-4">
            <p className="font-paragraph text-sm text-charcoal-black leading-relaxed">
              <span className="font-medium">💡 Remember:</span> Progress isn't just weight — how you feel, your energy, strength, and how your clothes fit all matter. Keep showing up consistently.
            </p>
          </div>
        </div>
      )}

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
                <p className="font-paragraph text-xs text-warm-grey/70 mt-1">
                  Weight naturally fluctuates day to day — focus on the trend over weeks.
                </p>
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
                <p className="font-paragraph text-xs text-warm-grey/70 mt-1">
                  Higher energy usually means recovery and nutrition are on track.
                </p>
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

            <div>
              <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-3">
                Progress Photos
              </label>
              <p className="font-paragraph text-xs text-warm-grey/70 mb-4">
                Progress photos are optional and for your eyes only. They're a powerful way to see changes that the scale doesn't capture.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block font-paragraph text-xs font-medium text-charcoal-black mb-2">
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
                  <label className="block font-paragraph text-xs font-medium text-charcoal-black mb-2">
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
                  <label className="block font-paragraph text-xs font-medium text-charcoal-black mb-2">
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
        <div className="space-y-4">
          {/* Recent Check-ins (always visible) */}
          {checkins.slice(0, 2).map((checkin, idx) => (
            <CheckinCard
              key={checkin._id}
              checkin={checkin}
              checkinNumber={checkins.length - idx}
              isExpanded={expandedCheckins.has(checkin._id)}
              onToggleExpand={() => toggleCheckinExpanded(checkin._id)}
            />
          ))}

          {/* Older Check-ins Toggle */}
          {checkins.length > 2 && (
            <div className="space-y-4">
              <button
                onClick={() => setShowOlderCheckins(!showOlderCheckins)}
                className="w-full flex items-center justify-center gap-2 py-4 text-soft-bronze font-medium hover:text-soft-bronze/80 transition-colors"
              >
                {showOlderCheckins ? (
                  <>
                    <ChevronUp size={20} />
                    Hide Older Check-ins
                  </>
                ) : (
                  <>
                    <ChevronDown size={20} />
                    View Older Check-ins ({checkins.length - 2})
                  </>
                )}
              </button>

              {/* Older Check-ins */}
              {showOlderCheckins && (
                <div className="space-y-4">
                  {checkins.slice(2).map((checkin, idx) => (
                    <CheckinCard
                      key={checkin._id}
                      checkin={checkin}
                      checkinNumber={checkins.length - (idx + 2)}
                      isExpanded={expandedCheckins.has(checkin._id)}
                      onToggleExpand={() => toggleCheckinExpanded(checkin._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
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

// Checkin Card Component
interface CheckinCardProps {
  checkin: ProgressCheckins;
  checkinNumber: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function CheckinCard({ checkin, checkinNumber, isExpanded, onToggleExpand }: CheckinCardProps) {
  return (
    <div className="bg-soft-white border border-warm-sand-beige rounded-2xl overflow-hidden transition-all duration-300">
      {/* Header - Always Visible */}
      <button
        onClick={onToggleExpand}
        className="w-full px-6 lg:px-8 py-5 flex items-center justify-between hover:bg-soft-bronze hover:text-soft-white transition-all duration-300"
      >
        <div className="flex items-start gap-4 flex-1 text-left">
          <div>
            <h3 className="font-heading text-lg font-bold mb-1">
              Check-in #{checkinNumber}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} />
              <span>
                {new Date(checkin.checkinDate || '').toLocaleDateString('en-GB', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Weight - Subtle, to the side */}
        {checkin.currentWeight && (
          <div className="text-right mr-4">
            <p className="text-xs">Weight</p>
            <p className="font-paragraph text-base font-medium">
              {checkin.currentWeight} kg
            </p>
          </div>
        )}

        {/* Expand/Collapse Icon */}
        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronUp size={20} className="text-soft-bronze" />
          ) : (
            <ChevronDown size={20} className="text-soft-bronze" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-warm-sand-beige px-6 lg:px-8 py-6 space-y-6">
          {/* Energy Level with Context */}
          {checkin.energyLevel && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} className="text-soft-bronze" />
                <p className="font-paragraph font-bold text-charcoal-black">Energy Level</p>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 bg-warm-sand-beige rounded-full h-2.5">
                  <div
                    className="bg-soft-bronze h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${(checkin.energyLevel / 10) * 100}%` }}
                  />
                </div>
                <span className="font-paragraph font-bold text-charcoal-black text-sm">
                  {checkin.energyLevel}/10
                </span>
              </div>
              <p className="font-paragraph text-xs text-warm-grey/70">
                Higher energy usually means recovery and nutrition are on track.
              </p>
            </div>
          )}

          {/* Measurements - Grid/Tag Style */}
          {checkin.bodyMeasurements && (
            <div>
              <p className="font-paragraph font-bold text-charcoal-black mb-3">Measurements</p>
              <div className="flex flex-wrap gap-2">
                {checkin.bodyMeasurements.split(',').map((measurement, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 bg-warm-sand-beige/40 border border-warm-sand-beige rounded-full"
                  >
                    <p className="font-paragraph text-sm text-charcoal-black">
                      {measurement.trim()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Client Notes */}
          {checkin.clientNotes && (
            <div>
              <p className="font-paragraph font-bold text-charcoal-black mb-2">Your Notes</p>
              <p className="font-paragraph text-sm text-charcoal-black/80 leading-relaxed">
                {checkin.clientNotes}
              </p>
            </div>
          )}

          {/* Photos Grid */}
          {(checkin.progressPhotoFront || checkin.progressPhotoSide || checkin.progressPhotoBack) && (
            <div>
              <p className="font-paragraph font-bold text-charcoal-black mb-3">Progress Photos</p>
              <p className="font-paragraph text-xs text-warm-grey/70 mb-4">
                Progress photos are for your eyes only — a powerful way to see changes the scale doesn't capture.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {checkin.progressPhotoFront && (
                  <div className="aspect-square rounded-lg overflow-hidden border border-warm-sand-beige">
                    <Image
                      src={checkin.progressPhotoFront}
                      alt="Front progress photo"
                      className="w-full h-full object-cover"
                      width={200}
                    />
                  </div>
                )}
                {checkin.progressPhotoSide && (
                  <div className="aspect-square rounded-lg overflow-hidden border border-warm-sand-beige">
                    <Image
                      src={checkin.progressPhotoSide}
                      alt="Side progress photo"
                      className="w-full h-full object-cover"
                      width={200}
                    />
                  </div>
                )}
                {checkin.progressPhotoBack && (
                  <div className="aspect-square rounded-lg overflow-hidden border border-warm-sand-beige">
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
          )}

          {/* Trainer Feedback Loop */}
          <div className="bg-soft-bronze/5 border border-soft-bronze/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MessageSquare size={16} className="text-soft-bronze flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-paragraph font-bold text-charcoal-black text-sm mb-1">
                  Trainer Feedback
                </p>
                <p className="font-paragraph text-sm text-warm-grey/80">
                  Trainer feedback coming soon — check back for personalized insights on your progress.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
