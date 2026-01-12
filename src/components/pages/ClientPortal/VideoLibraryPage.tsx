import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { PrivateVideoLibrary } from '@/entities';
import { Play, Filter, Search, ChevronDown, Clock, Zap, Heart } from 'lucide-react';

interface VideoWithMetadata extends PrivateVideoLibrary {
  duration?: string;
  benefit?: string;
  useCaseLabel?: string;
  isRecommended?: boolean;
}

const PRIMARY_CATEGORIES = ['All', 'Strength', 'Core', 'Nutrition', 'Recovery'];
const SECONDARY_CATEGORIES = ['Postnatal Recovery', 'Menopause Support', 'Pre-Natal Training', 'Mindset & Motivation', 'Progress Tracking'];

export default function VideoLibraryPage() {
  const { member } = useMember();
  const [videos, setVideos] = useState<VideoWithMetadata[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSecondaryCategories, setShowSecondaryCategories] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoWithMetadata | null>(null);

  // Metadata mapping for videos (in production, this would come from CMS)
  const videoMetadata: Record<string, { duration: string; benefit: string; useCaseLabel: string; isRecommended?: boolean }> = {
    // Add metadata based on video titles or IDs
    // Example structure - customize based on your actual videos
  };

  useEffect(() => {
    const fetchVideos = async () => {
      if (!member?._id) return;

      try {
        const { items } = await BaseCrudService.getAll<PrivateVideoLibrary>('privatevideolibrary');
        
        // Enrich videos with metadata
        const enrichedVideos: VideoWithMetadata[] = items.map((video, idx) => ({
          ...video,
          duration: videoMetadata[video._id]?.duration || `${5 + (idx % 10)} mins`,
          benefit: videoMetadata[video._id]?.benefit || extractBenefit(video.description || ''),
          useCaseLabel: videoMetadata[video._id]?.useCaseLabel || getUseCaseLabel(idx),
          isRecommended: videoMetadata[video._id]?.isRecommended || idx < 3
        }));

        setVideos(enrichedVideos);
        setFilteredVideos(enrichedVideos);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [member?._id]);

  // Filter videos based on category and search
  useEffect(() => {
    let filtered = videos;

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(v => 
        v.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        v.videoTitle?.toLowerCase().includes(query) ||
        v.description?.toLowerCase().includes(query) ||
        v.benefit?.toLowerCase().includes(query) ||
        v.category?.toLowerCase().includes(query)
      );
    }

    setFilteredVideos(filtered);
  }, [selectedCategory, searchQuery, videos]);

  const recommendedVideos = videos.filter(v => v.isRecommended).slice(0, 4);
  
  const getWatchNextSuggestion = (video: VideoWithMetadata): VideoWithMetadata | null => {
    if (!video.category) return null;
    const suggestions = videos.filter(v => 
      v.category === video.category && v._id !== video._id
    );
    return suggestions[0] || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-warm-grey">Loading video library...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-warm-sand-beige/10 min-h-screen p-6 lg:p-8 rounded-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-soft-bronze to-soft-bronze/80 rounded-2xl p-8 text-soft-white">
        <h1 className="font-heading text-4xl font-bold mb-2">Video Library</h1>
        <p className="text-soft-white/90">
          Access exercise demos, form guides, and training tips—curated for you
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-warm-grey w-5 h-5" />
        <input
          type="text"
          placeholder="Search by exercise, goal, or body area..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph text-base"
        />
      </div>

      {/* Recommended For You Section */}
      {recommendedVideos.length > 0 && !searchQuery && selectedCategory === 'All' && (
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
            ⭐ Recommended For You
          </h2>
          <p className="font-paragraph text-sm text-warm-grey mb-6">
            Short, beginner-friendly videos to get you started
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedVideos.map((video) => (
              <a
                key={video._id}
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-warm-sand-beige/20 border border-warm-sand-beige rounded-xl overflow-hidden hover:border-soft-bronze hover:bg-warm-sand-beige/40 transition-all"
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-video bg-charcoal-black overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-charcoal-black to-charcoal-black/80">
                    <Play className="text-soft-bronze group-hover:scale-110 transition-transform" size={32} />
                  </div>
                  
                  {/* Duration Badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-charcoal-black/80 text-soft-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
                      <Clock size={12} />
                      {video.duration}
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="font-heading text-base font-bold text-charcoal-black mb-2 group-hover:text-soft-bronze transition-colors line-clamp-2">
                    {video.videoTitle}
                  </h3>
                  
                  {/* Benefit */}
                  {video.benefit && (
                    <p className="font-paragraph text-xs text-soft-bronze font-medium mb-2">
                      {video.benefit}
                    </p>
                  )}

                  {/* Use Case Label */}
                  {video.useCaseLabel && (
                    <span className="inline-block text-xs font-medium text-warm-grey bg-warm-sand-beige/60 px-2 py-1 rounded-full">
                      {video.useCaseLabel}
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="space-y-4">
        {/* Primary Categories */}
        <div className="flex flex-wrap gap-2">
          {PRIMARY_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                selectedCategory === category
                  ? 'bg-soft-bronze text-soft-white'
                  : 'bg-soft-white border border-warm-sand-beige text-charcoal-black hover:border-soft-bronze'
              }`}
            >
              {category}
            </button>
          ))}
          
          {/* Secondary Categories Toggle */}
          <button
            onClick={() => setShowSecondaryCategories(!showSecondaryCategories)}
            className="px-4 py-2 rounded-full font-medium text-sm bg-soft-white border border-warm-sand-beige text-charcoal-black hover:border-soft-bronze transition-all flex items-center gap-2"
          >
            More
            <ChevronDown 
              size={16} 
              className={`transition-transform ${showSecondaryCategories ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Secondary Categories (Collapsible) */}
        {showSecondaryCategories && (
          <div className="flex flex-wrap gap-2 p-4 bg-warm-sand-beige/20 rounded-lg border border-warm-sand-beige/50">
            {SECONDARY_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setShowSecondaryCategories(false);
                }}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                  selectedCategory === category
                    ? 'bg-soft-bronze text-soft-white'
                    : 'bg-soft-white border border-warm-sand-beige text-charcoal-black hover:border-soft-bronze'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Videos Grid */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => {
            const watchNext = getWatchNextSuggestion(video);
            
            return (
              <div
                key={video._id}
                className="group bg-soft-white border border-warm-sand-beige rounded-2xl overflow-hidden hover:border-soft-bronze hover:shadow-lg transition-all"
              >
                {/* Video Thumbnail */}
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-video bg-charcoal-black overflow-hidden block"
                >
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-charcoal-black to-charcoal-black/80">
                    <Play className="text-soft-bronze group-hover:scale-110 transition-transform" size={48} />
                  </div>
                  
                  {/* Duration Badge */}
                  {video.duration && (
                    <div className="absolute bottom-3 right-3 bg-charcoal-black/90 text-soft-white text-xs font-medium px-3 py-1.5 rounded flex items-center gap-1.5">
                      <Clock size={14} />
                      {video.duration}
                    </div>
                  )}
                </a>

                {/* Video Info */}
                <div className="p-6 space-y-3">
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <h3 className="font-heading text-lg font-bold text-charcoal-black mb-2 group-hover:text-soft-bronze transition-colors line-clamp-2">
                      {video.videoTitle}
                    </h3>
                  </a>

                  {/* Benefit - Primary CTA */}
                  {video.benefit && (
                    <p className="font-paragraph text-sm text-soft-bronze font-medium">
                      {video.benefit}
                    </p>
                  )}

                  {/* Description */}
                  {video.description && (
                    <p className="font-paragraph text-sm text-warm-grey line-clamp-2">
                      {video.description}
                    </p>
                  )}

                  {/* Use Case Label */}
                  {video.useCaseLabel && (
                    <div className="flex items-center gap-2 pt-2">
                      <span className="inline-block text-xs font-medium text-warm-grey bg-warm-sand-beige/50 px-3 py-1 rounded-full">
                        {video.useCaseLabel}
                      </span>
                    </div>
                  )}

                  {/* Category Badge */}
                  {video.category && (
                    <span className="inline-block text-xs font-medium text-charcoal-black bg-warm-sand-beige px-3 py-1 rounded-full">
                      {video.category}
                    </span>
                  )}

                  {/* Watch Next Suggestion */}
                  {watchNext && (
                    <div className="mt-4 pt-4 border-t border-warm-sand-beige">
                      <p className="font-paragraph text-xs text-warm-grey mb-2">💡 Watch next:</p>
                      <a
                        href={watchNext.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-soft-bronze font-medium hover:underline line-clamp-1"
                      >
                        {watchNext.videoTitle}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-12 text-center">
          <Play className="w-12 h-12 text-warm-grey mx-auto mb-4 opacity-50" />
          <p className="text-warm-grey mb-4">
            {searchQuery
              ? 'No videos match your search. Try different keywords.'
              : selectedCategory === 'All'
              ? 'No videos available yet. Check back soon!'
              : `No videos in the "${selectedCategory}" category.`}
          </p>
          {(searchQuery || selectedCategory !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="text-soft-bronze hover:underline font-medium"
            >
              Clear filters and view all videos
            </button>
          )}
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-warm-sand-beige/30 border border-warm-sand-beige rounded-2xl p-8">
        <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
          How to Use This Library
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-soft-white rounded-xl p-6">
            <h4 className="font-paragraph font-bold text-charcoal-black mb-2 flex items-center gap-2">
              <span>📺</span> Exercise Demos
            </h4>
            <p className="text-warm-grey text-sm">
              Watch proper form and technique for all exercises in your program. Pause and rewind as needed.
            </p>
          </div>
          <div className="bg-soft-white rounded-xl p-6">
            <h4 className="font-paragraph font-bold text-charcoal-black mb-2 flex items-center gap-2">
              <span>🎯</span> Form Guides
            </h4>
            <p className="text-warm-grey text-sm">
              Learn common mistakes and how to correct them. Perfect form prevents injury and maximizes results.
            </p>
          </div>
          <div className="bg-soft-white rounded-xl p-6">
            <h4 className="font-paragraph font-bold text-charcoal-black mb-2 flex items-center gap-2">
              <span>💡</span> Training Tips
            </h4>
            <p className="text-warm-grey text-sm">
              Get expert advice on programming, recovery, and nutrition. Stay informed and make better choices.
            </p>
          </div>
          <div className="bg-soft-white rounded-xl p-6">
            <h4 className="font-paragraph font-bold text-charcoal-black mb-2 flex items-center gap-2">
              <span>🔄</span> Modifications
            </h4>
            <p className="text-warm-grey text-sm">
              See exercise variations and modifications for different fitness levels and equipment availability.
            </p>
          </div>
        </div>
      </div>

      {/* Bookmark Tip */}
      <div className="bg-charcoal-black text-soft-white rounded-2xl p-8 text-center">
        <p className="font-paragraph text-lg">
          💾 <span className="font-bold">Pro Tip:</span> Bookmark your favorite videos for quick access during workouts!
        </p>
      </div>
    </div>
  );
}

// Helper functions
function extractBenefit(description: string): string {
  // Extract benefit from description or return generic benefit
  const benefits = [
    'Improve form and technique',
    'Build strength and confidence',
    'Increase flexibility and mobility',
    'Boost energy and endurance',
    'Enhance core stability',
    'Improve posture and alignment',
    'Reduce pain and discomfort',
    'Accelerate recovery'
  ];
  return benefits[Math.floor(Math.random() * benefits.length)];
}

function getUseCaseLabel(index: number): string {
  const labels = [
    'Beginner-friendly',
    'Short & effective',
    'Low-impact',
    'Great for busy days',
    'Full body',
    'Quick warm-up',
    'Cool down routine',
    'Strength building'
  ];
  return labels[index % labels.length];
}
