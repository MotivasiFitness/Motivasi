import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { PrivateVideoLibrary } from '@/entities';
import { Play, Filter } from 'lucide-react';

export default function VideoLibraryPage() {
  const { member } = useMember();
  const [videos, setVideos] = useState<PrivateVideoLibrary[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<PrivateVideoLibrary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!member?._id) return;

      try {
        const { items } = await BaseCrudService.getAll<PrivateVideoLibrary>('privatevideolibrary');
        setVideos(items);

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(items.map(v => v.category).filter(Boolean))
        ) as string[];
        setCategories(uniqueCategories);

        // Set initial filtered videos
        setFilteredVideos(items);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [member?._id]);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredVideos(videos);
    } else {
      setFilteredVideos(videos.filter(v => v.category === selectedCategory));
    }
  }, [selectedCategory, videos]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-warm-grey">Loading video library...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-soft-bronze to-soft-bronze/80 rounded-2xl p-8 text-soft-white">
        <h1 className="font-heading text-4xl font-bold mb-2">Video Library</h1>
        <p className="text-soft-white/90">
          Access exercise demos, form guides, and training tips
        </p>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-soft-bronze text-soft-white'
                : 'bg-soft-white border border-warm-sand-beige text-charcoal-black hover:border-soft-bronze'
            }`}
          >
            <Filter size={18} />
            All Videos
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-colors ${
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

      {/* Videos Grid */}
      {filteredVideos.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <a
              key={video._id}
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-soft-white border border-warm-sand-beige rounded-2xl overflow-hidden hover:border-soft-bronze transition-colors"
            >
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-charcoal-black overflow-hidden">
                {/* Placeholder thumbnail */}
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-charcoal-black to-charcoal-black/80">
                  <Play className="text-soft-bronze group-hover:scale-110 transition-transform" size={48} />
                </div>
              </div>

              {/* Video Info */}
              <div className="p-6">
                <h3 className="font-heading text-lg font-bold text-charcoal-black mb-2 group-hover:text-soft-bronze transition-colors line-clamp-2">
                  {video.videoTitle}
                </h3>
                {video.category && (
                  <span className="inline-block text-xs font-medium text-soft-bronze bg-soft-bronze/10 px-3 py-1 rounded-full mb-3">
                    {video.category}
                  </span>
                )}
                {video.description && (
                  <p className="text-warm-grey text-sm line-clamp-3">
                    {video.description}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-12 text-center">
          <Play className="w-12 h-12 text-warm-grey mx-auto mb-4 opacity-50" />
          <p className="text-warm-grey mb-4">
            {selectedCategory === 'all'
              ? 'No videos available yet. Check back soon!'
              : `No videos in the "${selectedCategory}" category.`}
          </p>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-soft-bronze hover:underline font-medium"
            >
              View all videos
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
            <h4 className="font-paragraph font-bold text-charcoal-black mb-2">📺 Exercise Demos</h4>
            <p className="text-warm-grey text-sm">
              Watch proper form and technique for all exercises in your program. Pause and rewind as needed.
            </p>
          </div>
          <div className="bg-soft-white rounded-xl p-6">
            <h4 className="font-paragraph font-bold text-charcoal-black mb-2">🎯 Form Guides</h4>
            <p className="text-warm-grey text-sm">
              Learn common mistakes and how to correct them. Perfect form prevents injury and maximizes results.
            </p>
          </div>
          <div className="bg-soft-white rounded-xl p-6">
            <h4 className="font-paragraph font-bold text-charcoal-black mb-2">💡 Training Tips</h4>
            <p className="text-warm-grey text-sm">
              Get expert advice on programming, recovery, and nutrition. Stay informed and make better choices.
            </p>
          </div>
          <div className="bg-soft-white rounded-xl p-6">
            <h4 className="font-paragraph font-bold text-charcoal-black mb-2">🔄 Modifications</h4>
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
