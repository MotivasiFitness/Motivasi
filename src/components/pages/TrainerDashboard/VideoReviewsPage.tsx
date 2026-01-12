import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { PrivateVideoLibrary, TrainerClientAssignments, VideoSubmissionStatus } from '@/entities';
import { Video, AlertCircle, MessageSquare, ExternalLink, Filter, X, Clock, CheckCircle, Loader, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTrainerClients } from '@/lib/role-utils';

interface VideoSubmission {
  _id: string;
  videoTitle?: string;
  description?: string;
  videoUrl?: string;
  category?: string;
  accessTags?: string;
  _createdDate?: Date;
  submittedBy?: string;
  reviewStatus?: 'New' | 'In Review' | 'Replied';
  statusUpdatedAt?: Date;
  feedbackProvidedAt?: Date;
}

export default function VideoReviewsPage() {
  const { member } = useMember();
  const [videos, setVideos] = useState<VideoSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoSubmission | null>(null);
  const [clientAssignments, setClientAssignments] = useState<Map<string, string>>(new Map());
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!member?._id) return;

      try {
        // Get trainer's assigned clients
        const assignments = await getTrainerClients(member._id);
        const clientMap = new Map<string, string>();
        assignments.forEach((a) => {
          clientMap.set(a.clientId || '', a.clientId || '');
        });
        setClientAssignments(clientMap);

        // Get all videos from private video library
        const { items } = await BaseCrudService.getAll<PrivateVideoLibrary>('privatevideolibrary');
        
        // Get all video submission statuses
        const { items: statusItems } = await BaseCrudService.getAll<VideoSubmissionStatus>('videosubmissionstatus');
        const statusMap = new Map<string, VideoSubmissionStatus>();
        statusItems.forEach(s => {
          if (s.videoId) statusMap.set(s.videoId, s);
        });
        
        // Filter videos that are tagged for trainer review (category = 'exercise-review' or accessTags contains trainer ID)
        const reviewVideos = items.filter((v) => {
          const isForReview = v.category === 'exercise-review' || v.accessTags?.includes(member._id);
          const isFromAssignedClient = clientMap.has(v.accessTags || '');
          return isForReview || isFromAssignedClient;
        });

        // Enrich videos with status information
        const enrichedVideos: VideoSubmission[] = reviewVideos.map(v => {
          const status = statusMap.get(v._id);
          return {
            ...v,
            reviewStatus: (status?.status as 'New' | 'In Review' | 'Replied') || 'New',
            statusUpdatedAt: status?.statusUpdatedAt ? new Date(status.statusUpdatedAt) : undefined,
            feedbackProvidedAt: status?.feedbackProvidedAt ? new Date(status.feedbackProvidedAt) : undefined,
          };
        });

        setVideos(enrichedVideos.sort((a, b) => {
          const dateA = new Date(a._createdDate || 0).getTime();
          const dateB = new Date(b._createdDate || 0).getTime();
          return dateB - dateA;
        }));
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [member?._id]);

  // Filter and sort videos
  const filteredVideos = videos
    .filter(v => filterCategory === 'all' || v.category === filterCategory)
    .filter(v => filterStatus === 'all' || v.reviewStatus === filterStatus)
    .sort((a, b) => {
      const dateA = new Date(a._createdDate || 0).getTime();
      const dateB = new Date(b._createdDate || 0).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const categories = Array.from(new Set(videos.map(v => v.category).filter(Boolean)));
  const newVideos = videos.filter(v => v.reviewStatus === 'New').length;
  const inReviewVideos = videos.filter(v => v.reviewStatus === 'In Review').length;

  const updateVideoStatus = async (videoId: string, newStatus: 'New' | 'In Review' | 'Replied') => {
    setUpdatingStatus(videoId);
    try {
      // Check if status record exists
      const { items } = await BaseCrudService.getAll<VideoSubmissionStatus>('videosubmissionstatus');
      const existingStatus = items.find(s => s.videoId === videoId);

      const statusData: VideoSubmissionStatus = {
        _id: existingStatus?._id || crypto.randomUUID(),
        videoId,
        clientId: videos.find(v => v._id === videoId)?.accessTags,
        status: newStatus,
        statusUpdatedAt: new Date(),
        feedbackProvidedAt: newStatus === 'Replied' ? new Date() : existingStatus?.feedbackProvidedAt,
      };

      if (existingStatus) {
        await BaseCrudService.update<VideoSubmissionStatus>('videosubmissionstatus', statusData);
      } else {
        await BaseCrudService.create('videosubmissionstatus', statusData);
      }

      // Update local state
      setVideos(prev => prev.map(v => 
        v._id === videoId 
          ? { ...v, reviewStatus: newStatus, statusUpdatedAt: new Date() }
          : v
      ));
    } catch (error) {
      console.error('Error updating video status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadgeColor = (status: 'New' | 'In Review' | 'Replied' | undefined) => {
    switch (status) {
      case 'New':
        return 'bg-soft-bronze/20 text-soft-bronze border border-soft-bronze/30';
      case 'In Review':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Replied':
        return 'bg-green-50 text-green-700 border border-green-200';
      default:
        return 'bg-warm-sand-beige text-charcoal-black';
    }
  };

  const getTimeWaiting = (createdDate?: Date) => {
    if (!createdDate) return '';
    const now = new Date();
    const created = new Date(createdDate);
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="p-8 lg:p-12 flex items-center justify-center min-h-screen">
        <p className="text-warm-grey">Loading video submissions...</p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header with Status Summary */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-2">
              Video Reviews
            </h1>
            <p className="text-lg text-warm-grey">
              Review exercise videos submitted by your clients
            </p>
          </div>
          <div className="flex gap-4">
            {newVideos > 0 && (
              <div className="bg-soft-bronze/10 border border-soft-bronze/30 rounded-lg p-4">
                <p className="font-paragraph text-sm text-charcoal-black">
                  <span className="font-bold text-soft-bronze">{newVideos}</span> new video{newVideos !== 1 ? 's' : ''}
                </p>
              </div>
            )}
            {inReviewVideos > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-paragraph text-sm text-charcoal-black">
                  <span className="font-bold text-blue-700">{inReviewVideos}</span> in review
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Filters and Sort */}
        {videos.length > 0 && (
          <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center flex-wrap">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-warm-grey" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-warm-grey" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="New">New</option>
                  <option value="In Review">In Review</option>
                  <option value="Replied">Replied</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-warm-grey" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                  className="px-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="ml-auto text-sm text-warm-grey font-paragraph">
                Showing {filteredVideos.length} of {videos.length} video{videos.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        )}

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-12 text-center">
            <Video className="mx-auto text-warm-grey mb-4" size={48} />
            <p className="text-warm-grey text-lg mb-6">
              {videos.length === 0 
                ? 'No video submissions yet. Your clients can upload videos for feedback from the Exercise Video Review page.'
                : 'No videos match your filter criteria.'}
            </p>
            <p className="text-sm text-warm-grey/70">
              {videos.length === 0 && 'Videos will appear here once clients submit them for review.'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => {
              const isNew = video.reviewStatus === 'New';
              return (
                <div
                  key={video._id}
                  className={`bg-soft-white border-2 rounded-2xl overflow-hidden hover:border-soft-bronze transition-all ${
                    isNew 
                      ? 'border-soft-bronze/50 shadow-lg shadow-soft-bronze/10' 
                      : 'border-warm-sand-beige'
                  }`}
                >
                  {/* New Badge */}
                  {isNew && (
                    <div className="bg-soft-bronze text-soft-white px-3 py-1 text-xs font-bold uppercase tracking-widest">
                      🔔 New - {getTimeWaiting(video._createdDate)}
                    </div>
                  )}

                  {/* Video Thumbnail */}
                  <div className="aspect-video bg-charcoal-black/10 flex items-center justify-center relative group">
                    <Video className="text-warm-grey" size={48} />
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-charcoal-black/0 group-hover:bg-charcoal-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <ExternalLink className="text-soft-white" size={32} />
                    </a>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-heading text-lg font-bold text-charcoal-black line-clamp-2 flex-1">
                        {video.videoTitle || 'Untitled Video'}
                      </h3>
                    </div>
                    
                    {video.description && (
                      <p className="text-sm text-warm-grey mb-4 line-clamp-2">
                        {video.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-6">
                      {video.category && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-warm-grey uppercase tracking-widest">Category:</span>
                          <span className="text-sm text-charcoal-black font-medium">{video.category}</span>
                        </div>
                      )}
                      {video._createdDate && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-warm-grey uppercase tracking-widest">Submitted:</span>
                          <span className="text-sm text-charcoal-black">
                            {new Date(video._createdDate).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                      {video.feedbackProvidedAt && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-warm-grey uppercase tracking-widest">Feedback:</span>
                          <span className="text-sm text-charcoal-black">
                            {new Date(video.feedbackProvidedAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="mb-6">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(video.reviewStatus)}`}>
                        {video.reviewStatus || 'New'}
                      </span>
                    </div>

                    {/* Status Update Dropdown */}
                    <div className="mb-6">
                      <label className="block text-xs text-warm-grey uppercase tracking-widest mb-2">
                        Update Status
                      </label>
                      <select
                        value={video.reviewStatus || 'New'}
                        onChange={(e) => updateVideoStatus(video._id, e.target.value as 'New' | 'In Review' | 'Replied')}
                        disabled={updatingStatus === video._id}
                        className="w-full px-3 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph text-sm disabled:opacity-50"
                      >
                        <option value="New">New</option>
                        <option value="In Review">In Review</option>
                        <option value="Replied">Replied</option>
                      </select>
                      {updatingStatus === video._id && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-soft-bronze">
                          <Loader className="w-3 h-3 animate-spin" />
                          Updating...
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <a
                        href={video.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-charcoal-black text-soft-white px-4 py-2 rounded-lg hover:bg-soft-bronze transition-colors text-sm font-medium"
                      >
                        <ExternalLink size={16} />
                        Watch
                      </a>
                      <Link
                        to={`/trainer/messages?client=${video.accessTags}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-warm-sand-beige text-charcoal-black px-4 py-2 rounded-lg hover:bg-soft-bronze hover:text-soft-white transition-colors text-sm font-medium"
                      >
                        <MessageSquare size={16} />
                        Reply
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
