import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { PrivateVideoLibrary, VideoSubmissionStatus } from '@/entities';
import { Video, Play, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

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

export default function MyVideoSubmissionsPage() {
  const { member } = useMember();
  const [submissions, setSubmissions] = useState<VideoSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!member?._id) return;

      try {
        setLoading(true);
        // Get all videos submitted by this client
        const { items } = await BaseCrudService.getAll<PrivateVideoLibrary>('privatevideolibrary');
        const clientVideos = items.filter(v => v.accessTags === member._id);

        // Get all video submission statuses
        const { items: statusItems } = await BaseCrudService.getAll<VideoSubmissionStatus>('videosubmissionstatus');
        const statusMap = new Map<string, VideoSubmissionStatus>();
        statusItems.forEach(s => {
          if (s.videoId) statusMap.set(s.videoId, s);
        });

        // Enrich videos with status information
        const enrichedSubmissions: VideoSubmission[] = clientVideos.map(v => {
          const status = statusMap.get(v._id);
          return {
            ...v,
            reviewStatus: (status?.status as 'New' | 'In Review' | 'Replied') || 'New',
            feedbackProvidedAt: status?.feedbackProvidedAt ? new Date(status.feedbackProvidedAt) : undefined,
          };
        });

        setSubmissions(enrichedSubmissions.sort((a, b) => {
          const dateA = new Date(a._createdDate || 0).getTime();
          const dateB = new Date(b._createdDate || 0).getTime();
          return dateB - dateA;
        }));
      } catch (error) {
        console.error('Error fetching video submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [member?._id]);

  const filteredSubmissions = submissions.filter(s =>
    filterStatus === 'all' || s.reviewStatus === filterStatus
  );

  const getStatusIcon = (status?: 'New' | 'In Review' | 'Replied') => {
    switch (status) {
      case 'New':
        return <AlertCircle className="w-5 h-5 text-soft-bronze" />;
      case 'In Review':
        return <Loader className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'Replied':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Video className="w-5 h-5 text-warm-grey" />;
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
      <div className="p-8 lg:p-12 flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-soft-bronze" />
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-2">
            My Video Submissions
          </h1>
          <p className="text-lg text-warm-grey mb-8">
            Track the status of your exercise videos and feedback from your trainer
          </p>

          {/* Status Filter */}
          {submissions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-warm-grey font-medium">Filter:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph text-sm"
              >
                <option value="all">All Submissions</option>
                <option value="New">Waiting for Review</option>
                <option value="In Review">Being Reviewed</option>
                <option value="Replied">Feedback Provided</option>
              </select>
            </div>
          )}
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-12 text-center">
            <Video className="mx-auto text-warm-grey mb-4" size={48} />
            <p className="text-warm-grey text-lg mb-6">
              {submissions.length === 0
                ? 'You haven\'t submitted any videos yet.'
                : 'No submissions match your filter.'}
            </p>
            {submissions.length === 0 && (
              <Link
                to="/exercise-video-review"
                className="inline-block bg-soft-bronze text-soft-white px-6 py-3 rounded-lg hover:bg-soft-bronze/90 transition-colors font-medium"
              >
                Submit Your First Video
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission._id}
                className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6 hover:border-soft-bronze transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  {/* Left: Video Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="hidden sm:block w-24 h-24 bg-charcoal-black/10 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <Play className="text-warm-grey" size={32} />
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="font-heading text-xl font-bold text-charcoal-black mb-2">
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
                              <Clock size={16} className="text-warm-grey" />
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
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(submission.reviewStatus)}`}>
                      {getStatusIcon(submission.reviewStatus)}
                      <span>{getStatusLabel(submission.reviewStatus)}</span>
                    </div>

                    {/* Feedback Date */}
                    {submission.feedbackProvidedAt && (
                      <div className="text-xs text-warm-grey">
                        Feedback on {new Date(submission.feedbackProvidedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    )}

                    {/* Watch Button */}
                    <a
                      href={submission.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-charcoal-black text-soft-white px-4 py-2 rounded-lg hover:bg-soft-bronze transition-colors text-sm font-medium"
                    >
                      <Play size={16} />
                      Watch Video
                    </a>
                  </div>
                </div>

                {/* Feedback Received Notice */}
                {submission.reviewStatus === 'Replied' && (
                  <div className="mt-4 pt-4 border-t border-warm-sand-beige">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                      <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                      <div>
                        <p className="font-medium text-green-900 text-sm">
                          Your trainer has provided feedback on this video.
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          Check your Messages section to see the detailed feedback.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        {submissions.length > 0 && (
          <div className="mt-12 bg-soft-bronze/10 border border-soft-bronze/30 rounded-2xl p-8 text-center">
            <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-3">
              Ready to Submit Another Video?
            </h3>
            <p className="text-warm-grey mb-6">
              Get more feedback from your trainer by submitting additional exercise videos.
            </p>
            <Link
              to="/exercise-video-review"
              className="inline-block bg-soft-bronze text-soft-white px-6 py-3 rounded-lg hover:bg-soft-bronze/90 transition-colors font-medium"
            >
              Submit a Video
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
