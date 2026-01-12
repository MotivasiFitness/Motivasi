import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { PrivateVideoLibrary, TrainerClientAssignments } from '@/entities';
import { Video, AlertCircle, MessageSquare, ExternalLink } from 'lucide-react';
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
}

export default function VideoReviewsPage() {
  const { member } = useMember();
  const [videos, setVideos] = useState<VideoSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoSubmission | null>(null);
  const [clientAssignments, setClientAssignments] = useState<Map<string, string>>(new Map());

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
        
        // Filter videos that are tagged for trainer review (category = 'exercise-review' or accessTags contains trainer ID)
        const reviewVideos = items.filter((v) => {
          const isForReview = v.category === 'exercise-review' || v.accessTags?.includes(member._id);
          const isFromAssignedClient = clientMap.has(v.accessTags || '');
          return isForReview || isFromAssignedClient;
        });

        setVideos(reviewVideos.sort((a, b) => {
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
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-2">
            Video Reviews
          </h1>
          <p className="text-lg text-warm-grey">
            Review exercise videos submitted by your clients
          </p>
        </div>

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-12 text-center">
            <Video className="mx-auto text-warm-grey mb-4" size={48} />
            <p className="text-warm-grey text-lg mb-6">
              No video submissions yet. Your clients can upload videos for feedback from the Exercise Video Review page.
            </p>
            <p className="text-sm text-warm-grey/70">
              Videos will appear here once clients submit them for review.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-soft-white border border-warm-sand-beige rounded-2xl overflow-hidden hover:border-soft-bronze transition-colors"
              >
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
                  <h3 className="font-heading text-lg font-bold text-charcoal-black mb-2 line-clamp-2">
                    {video.videoTitle || 'Untitled Video'}
                  </h3>
                  
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
