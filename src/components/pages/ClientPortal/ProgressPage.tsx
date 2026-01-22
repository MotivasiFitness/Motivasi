import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { ProgressCheckins, PrivateVideoLibrary } from '@/entities';
import { Upload, TrendingUp, Calendar, ChevronDown, ChevronUp, Heart, Zap, TrendingUpIcon, MessageSquare, Video, Play, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VideoSubmission {
  _id: string;
  videoTitle?: string;
  description?: string;
  videoUrl?: string;
  category?: string;
  _createdDate?: Date;
  reviewStatus?: 'New' | 'In Review' | 'Replied';
  feedbackProvidedAt?: Date;
}

export default function ProgressPage() {
  const { member } = useMember();
  const [checkins, setCheckins] = useState<ProgressCheckins[]>([]);
  const [videoSubmissions, setVideoSubmissions] = useState<VideoSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
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
    chest: '',
    waist: '',
    hips: ''
  });
  const [photoPreview, setPhotoPreview] = useState({
    front: '',
    side: '',
    back: ''
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

  // Fetch video submissions
  useEffect(() => {
    const fetchVideoSubmissions = async () => {
      if (!member?._id) return;

      try {
        setVideosLoading(true);
        const { items } = await BaseCrudService.getAll<PrivateVideoLibrary>('privatevideolibrary');
        const clientVideos = items.filter(v => v.accessTags === member._id);

        const enrichedSubmissions: VideoSubmission[] = clientVideos.map(v => ({
          ...v,
          reviewStatus: 'New',
        }));

        setVideoSubmissions(enrichedSubmissions.sort((a, b) => {
          const dateA = new Date(a._createdDate || 0).getTime();
          const dateB = new Date(b._createdDate || 0).getTime();
          return dateB - dateA;
        }));
      } catch (error) {
        console.error('Error fetching video submissions:', error);
      } finally {
        setVideosLoading(false);
      }
    };

    fetchVideoSubmissions();
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, photoType: 'front' | 'side' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPhotoPreview(prev => ({
        ...prev,
        [photoType]: base64String
      }));
      
      // Store the base64 string in formData
      const photoFieldMap = {
        front: 'photoFront',
        side: 'photoSide',
        back: 'photoBack'
      };
      setFormData(prev => ({
        ...prev,
        [photoFieldMap[photoType]]: base64String
      }));
    };
    reader.readAsDataURL(file);
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
        bodyMeasurements: `Chest: ${formData.chest}cm, Waist: ${formData.waist}cm, Hips: ${formData.hips}cm`
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
        chest: '',
        waist: '',
        hips: ''
      });
      setPhotoPreview({
        front: '',
        side: '',
        back: ''
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting checkin:', error);
    }
  };

  const getStatusIcon = (status?: 'New' | 'In Review' | 'Replied') => {
    switch (status) {
      case 'New':
        return <AlertCircle className="w-4 h-4 text-soft-bronze" />;
      case 'In Review':
        return <Loader className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'Replied':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Video className="w-4 h-4 text-warm-grey" />;
    }
  };

  const getStatusLabel = (status?: 'New' | 'In Review' | 'Replied') => {
    switch (status) {
      case 'New':
        return 'Waiting for Review';
      case 'In Review':
        return 'Being Reviewed';
      case 'Replied':
        return 'Feedback Provided';
      default:
        return 'Submitted';
    }
  };

  const getStatusColor = (status?: 'New' | 'In Review' | 'Replied') => {
    switch (status) {
      case 'New':
        return 'bg-soft-bronze/10 text-soft-bronze border border-soft-bronze/30';
      case 'In Review':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Replied':
        return 'bg-green-50 text-green-700 border border-green-200';
      default:
        return 'bg-warm-sand-beige text-charcoal-black';
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
        <h1 className="font-heading text-4xl font-bold mb-2">Progress & Video Submissions</h1>
        <p className="text-soft-white/90">
          Track your transformation with check-ins and video feedback
        </p>
      </div>

      {/* Tabs for Check-ins and Video Submissions */}
      <Tabs defaultValue="checkins" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-soft-white border border-warm-sand-beige rounded-lg p-1">
          <TabsTrigger value="checkins" className="data-[state=active]:bg-soft-bronze data-[state=active]:text-soft-white">
            Progress Check-ins
          </TabsTrigger>
          <TabsTrigger value="videos" className="data-[state=active]:bg-soft-bronze data-[state=active]:text-soft-white">
            Video Submissions {videoSubmissions.length > 0 && `(${videoSubmissions.length})`}
          </TabsTrigger>
        </TabsList>

        {/* Progress Check-ins Tab */}
        <TabsContent value="checkins" className="space-y-6 mt-6">

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
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-paragraph text-xs font-medium text-charcoal-black mb-2">
                    Chest (cm)
                  </label>
                  <input
                    type="number"
                    name="chest"
                    value={formData.chest}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                    placeholder="e.g., 95"
                  />
                </div>
                <div>
                  <label className="block font-paragraph text-xs font-medium text-charcoal-black mb-2">
                    Waist (cm)
                  </label>
                  <input
                    type="number"
                    name="waist"
                    value={formData.waist}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                    placeholder="e.g., 78"
                  />
                </div>
                <div>
                  <label className="block font-paragraph text-xs font-medium text-charcoal-black mb-2">
                    Hips (cm)
                  </label>
                  <input
                    type="number"
                    name="hips"
                    value={formData.hips}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                    placeholder="e.g., 98"
                  />
                </div>
              </div>
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
                    Front Photo
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'front')}
                      className="hidden"
                      id="photo-front"
                    />
                    <label
                      htmlFor="photo-front"
                      className="flex items-center justify-center w-full px-4 py-8 rounded-lg border-2 border-dashed border-warm-sand-beige hover:border-soft-bronze hover:bg-soft-bronze/5 transition-all cursor-pointer"
                    >
                      {photoPreview.front ? (
                        <div className="w-full h-32 rounded overflow-hidden">
                          <Image src={photoPreview.front} alt="Front preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload size={24} className="mx-auto mb-2 text-warm-grey" />
                          <p className="font-paragraph text-xs text-warm-grey">Click to upload</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block font-paragraph text-xs font-medium text-charcoal-black mb-2">
                    Side Photo
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'side')}
                      className="hidden"
                      id="photo-side"
                    />
                    <label
                      htmlFor="photo-side"
                      className="flex items-center justify-center w-full px-4 py-8 rounded-lg border-2 border-dashed border-warm-sand-beige hover:border-soft-bronze hover:bg-soft-bronze/5 transition-all cursor-pointer"
                    >
                      {photoPreview.side ? (
                        <div className="w-full h-32 rounded overflow-hidden">
                          <Image src={photoPreview.side} alt="Side preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload size={24} className="mx-auto mb-2 text-warm-grey" />
                          <p className="font-paragraph text-xs text-warm-grey">Click to upload</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block font-paragraph text-xs font-medium text-charcoal-black mb-2">
                    Back Photo
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'back')}
                      className="hidden"
                      id="photo-back"
                    />
                    <label
                      htmlFor="photo-back"
                      className="flex items-center justify-center w-full px-4 py-8 rounded-lg border-2 border-dashed border-warm-sand-beige hover:border-soft-bronze hover:bg-soft-bronze/5 transition-all cursor-pointer"
                    >
                      {photoPreview.back ? (
                        <div className="w-full h-32 rounded overflow-hidden">
                          <Image src={photoPreview.back} alt="Back preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload size={24} className="mx-auto mb-2 text-warm-grey" />
                          <p className="font-paragraph text-xs text-warm-grey">Click to upload</p>
                        </div>
                      )}
                    </label>
                  </div>
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
          {checkins.slice(0, 2).map((checkin, idx) => {
            const previousCheckin = idx < checkins.length - 1 ? checkins[idx + 1] : undefined;
            return (
              <CheckinCard
                key={checkin._id}
                checkin={checkin}
                checkinNumber={checkins.length - idx}
                isExpanded={expandedCheckins.has(checkin._id)}
                onToggleExpand={() => toggleCheckinExpanded(checkin._id)}
                previousCheckin={previousCheckin}
              />
            );
          })}

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
                  {checkins.slice(2).map((checkin, idx) => {
                    const currentIndex = idx + 2;
                    const previousCheckin = currentIndex < checkins.length - 1 ? checkins[currentIndex + 1] : undefined;
                    return (
                      <CheckinCard
                        key={checkin._id}
                        checkin={checkin}
                        checkinNumber={checkins.length - currentIndex}
                        isExpanded={expandedCheckins.has(checkin._id)}
                        onToggleExpand={() => toggleCheckinExpanded(checkin._id)}
                        previousCheckin={previousCheckin}
                      />
                    );
                  })}
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
        </TabsContent>

        {/* Video Submissions Tab */}
        <TabsContent value="videos" className="space-y-6 mt-6">
          {videosLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-soft-bronze" />
            </div>
          ) : videoSubmissions.length === 0 ? (
            <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-12 text-center">
              <Video className="mx-auto text-warm-grey mb-4" size={48} />
              <p className="text-warm-grey text-lg mb-6">
                You haven't submitted any videos yet.
              </p>
              <Link
                to="/exercise-video-review"
                className="inline-block bg-soft-bronze text-soft-white px-6 py-3 rounded-lg hover:bg-soft-bronze/90 transition-colors font-medium"
              >
                Submit Your First Video
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {videoSubmissions.map((submission) => (
                <div
                  key={submission._id}
                  className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6 hover:border-soft-bronze transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    {/* Left: Video Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {/* Thumbnail */}
                        <div className="hidden sm:block w-20 h-20 bg-charcoal-black/10 rounded-lg flex-shrink-0 flex items-center justify-center">
                          <Play className="text-warm-grey" size={28} />
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <h3 className="font-heading text-lg font-bold text-charcoal-black mb-2">
                            {submission.videoTitle || 'Untitled Video'}
                          </h3>

                          {submission.description && (
                            <p className="text-sm text-warm-grey mb-3 line-clamp-2">
                              {submission.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm">
                            {submission.category && (
                              <div className="flex items-center gap-2">
                                <span className="text-warm-grey">Category:</span>
                                <span className="font-medium text-charcoal-black">{submission.category}</span>
                              </div>
                            )}

                            {submission._createdDate && (
                              <div className="flex items-center gap-2">
                                <Clock size={14} className="text-warm-grey" />
                                <span className="text-warm-grey">
                                  Submitted {new Date(submission._createdDate).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status & Actions */}
                    <div className="flex flex-col items-start md:items-end gap-4">
                      {/* Status Badge */}
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(submission.reviewStatus)}`}>
                        {getStatusIcon(submission.reviewStatus)}
                        <span>{getStatusLabel(submission.reviewStatus)}</span>
                      </div>

                      {/* Watch Button */}
                      {submission.videoUrl && (
                        <a
                          href={submission.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-charcoal-black text-soft-white px-4 py-2 rounded-lg hover:bg-soft-bronze transition-colors text-sm font-medium"
                        >
                          <Play size={14} />
                          Watch Video
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* CTA to submit more videos */}
              <div className="mt-8 bg-soft-bronze/10 border border-soft-bronze/30 rounded-2xl p-6 text-center">
                <h3 className="font-heading text-xl font-bold text-charcoal-black mb-2">
                  Ready to Submit Another Video?
                </h3>
                <p className="text-warm-grey mb-4 text-sm">
                  Get more feedback from your trainer by submitting additional exercise videos.
                </p>
                <Link
                  to="/exercise-video-review"
                  className="inline-block bg-soft-bronze text-soft-white px-6 py-3 rounded-lg hover:bg-soft-bronze/90 transition-colors font-medium"
                >
                  Submit a Video
                </Link>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Checkin Card Component
interface CheckinCardProps {
  checkin: ProgressCheckins;
  checkinNumber: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  previousCheckin?: ProgressCheckins;
}

// Helper function to calculate energy trend
function getEnergyTrend(current: number, previous?: number): string {
  if (!previous) return '';
  if (current > previous) return `Up from last week (${previous}/10)`;
  if (current < previous) return `Slightly lower than last week (${previous}/10)`;
  return 'Stable week to week';
}

// Helper function to calculate weight change
function getWeightContext(current: number, previous?: number): { text: string; change: number } {
  if (!previous) return { text: 'First check-in', change: 0 };
  const change = current - previous;
  if (Math.abs(change) < 0.5) {
    return { text: 'No significant change since last check-in', change: 0 };
  }
  if (change < 0) {
    return { text: `Down ${Math.abs(change).toFixed(1)}kg since last check-in`, change };
  }
  return { text: `Up ${change.toFixed(1)}kg since last check-in`, change };
}

function CheckinCard({ checkin, checkinNumber, isExpanded, onToggleExpand, previousCheckin }: CheckinCardProps) {
  const energyTrend = checkin.energyLevel ? getEnergyTrend(checkin.energyLevel, previousCheckin?.energyLevel) : '';
  const weightContext = checkin.currentWeight ? getWeightContext(checkin.currentWeight, previousCheckin?.currentWeight) : null;

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
          {/* Weight with Context */}
          {checkin.currentWeight && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Heart size={16} className="text-soft-bronze" />
                <p className="font-paragraph font-bold text-charcoal-black">Weight</p>
              </div>
              <p className="font-paragraph text-base font-medium text-charcoal-black mb-1">
                {checkin.currentWeight} kg
              </p>
              {weightContext && (
                <p className="font-paragraph text-xs text-warm-grey">
                  {weightContext.text}
                </p>
              )}
            </div>
          )}

          {/* Energy Level with Trend Context */}
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
              {energyTrend && (
                <p className="font-paragraph text-xs text-warm-grey mb-2">
                  {energyTrend}
                </p>
              )}
              <p className="font-paragraph text-xs text-warm-grey/70">
                Higher energy usually means recovery and nutrition are on track.
              </p>
            </div>
          )}

          {/* Body Measurements - Grid/Tag Style */}
          {checkin.bodyMeasurements && (
            <div>
              <p className="font-paragraph font-bold text-charcoal-black mb-3">Body Measurements (cm)</p>
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

          {/* Trainer Feedback Status */}
          <div className="bg-soft-bronze/5 border border-soft-bronze/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MessageSquare size={16} className="text-soft-bronze flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-paragraph font-bold text-charcoal-black text-sm mb-1">
                  Trainer Feedback
                </p>
                <p className="font-paragraph text-sm text-warm-grey/80">
                  Awaiting coach review — you'll be notified when personalised feedback is added.
                </p>
              </div>
            </div>
          </div>

          {/* This Week's Focus */}
          <div className="bg-soft-bronze/10 border border-soft-bronze/30 rounded-lg p-4">
            <p className="font-paragraph text-xs font-bold text-soft-bronze uppercase tracking-wide mb-2">
              This week's focus
            </p>
            <p className="font-paragraph text-sm text-charcoal-black leading-relaxed">
              Prioritise sleep and keep training intensity moderate. Your energy levels suggest recovery is important right now.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
