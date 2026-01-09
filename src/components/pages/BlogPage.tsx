import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { BaseCrudService } from '@/integrations';
import { BlogPosts } from '@/entities';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPosts[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { items } = await BaseCrudService.getAll<BlogPosts>('blogposts');
      setPosts(items.sort((a, b) => {
        const dateA = a.publishDate ? new Date(a.publishDate).getTime() : 0;
        const dateB = b.publishDate ? new Date(b.publishDate).getTime() : 0;
        return dateB - dateA;
      }));
    };
    fetchPosts();
  }, []);

  return (
    <div className="bg-soft-white">
      {/* Hero Section */}
      <section className="py-24 px-8 lg:px-20 bg-warm-sand-beige">
        <div className="max-w-[100rem] mx-auto text-center">
          <h1 className="font-heading text-6xl font-bold text-charcoal-black mb-6">
            Strength & Wellness Blog
          </h1>
          <p className="font-paragraph text-xl text-charcoal-black max-w-3xl mx-auto">
            Expert insights on strength training, nutrition, and sustainable fat loss for busy women.
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-24 px-8 lg:px-20">
        <div className="max-w-[100rem] mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-paragraph text-xl text-warm-grey">
                No blog posts available yet. Check back soon for expert insights!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  to={`/blog/${post.slug || post._id}`}
                  className="group bg-soft-white border border-warm-sand-beige rounded-2xl overflow-hidden hover:border-soft-bronze transition-colors"
                >
                  {post.featuredImage && (
                    <div className="aspect-video w-full overflow-hidden">
                      <Image
                        src={post.featuredImage}
                        alt={post.title || 'Blog post image'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        width={600}
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4 text-sm text-warm-grey">
                      {post.publishDate && (
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span className="font-paragraph">
                            {new Date(post.publishDate).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                      {post.author && (
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          <span className="font-paragraph">{post.author}</span>
                        </div>
                      )}
                    </div>
                    <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-3 group-hover:text-soft-bronze transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="font-paragraph text-base text-warm-grey mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-soft-bronze font-paragraph text-base">
                      Read More
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8 lg:px-20 bg-charcoal-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-5xl font-bold text-soft-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="font-paragraph text-xl text-warm-grey mb-8">
            Transform your knowledge into action with personalized coaching.
          </p>
          <Link
            to="/store"
            className="inline-flex items-center gap-2 bg-soft-bronze text-soft-white px-8 py-4 rounded-lg font-paragraph text-lg hover:bg-opacity-90 transition-colors"
          >
            Book Your Package Now
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
