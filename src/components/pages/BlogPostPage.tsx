import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { BaseCrudService } from '@/integrations';
import { BlogPosts } from '@/entities';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPosts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      const { items } = await BaseCrudService.getAll<BlogPosts>('blogposts');
      const foundPost = items.find(p => p.slug === slug || p._id === slug);
      setPost(foundPost || null);
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-soft-white min-h-screen flex items-center justify-center">
        <p className="font-paragraph text-xl text-warm-grey">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-soft-white min-h-screen flex items-center justify-center px-8">
        <div className="text-center">
          <h1 className="font-heading text-4xl font-bold text-charcoal-black mb-4">
            Post Not Found
          </h1>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-soft-bronze font-paragraph text-lg hover:underline"
          >
            <ArrowLeft size={20} />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-soft-white">
      {/* Header */}
      <section className="py-12 px-8 lg:px-20 bg-warm-sand-beige">
        <div className="max-w-[100rem] mx-auto">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-soft-bronze font-paragraph text-base hover:underline mb-8"
          >
            <ArrowLeft size={20} />
            Back to Blog
          </Link>
        </div>
      </section>

      {/* Article */}
      <article className="py-16 px-8 lg:px-20">
        <div className="max-w-4xl mx-auto">
          {post.featuredImage && (
            <div className="aspect-video w-full rounded-2xl overflow-hidden mb-8">
              <Image
                src={post.featuredImage}
                alt={post.title || 'Blog post image'}
                className="w-full h-full object-cover"
                width={1200}
              />
            </div>
          )}

          <div className="flex items-center gap-6 mb-6 text-sm text-warm-grey">
            {post.publishDate && (
              <div className="flex items-center gap-2">
                <Calendar size={18} />
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
                <User size={18} />
                <span className="font-paragraph">{post.author}</span>
              </div>
            )}
          </div>

          <h1 className="font-heading text-5xl md:text-6xl font-bold text-charcoal-black mb-8">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="font-paragraph text-xl text-warm-grey mb-12 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {post.content && (
            <div className="prose prose-lg max-w-none">
              <div className="font-paragraph text-lg text-charcoal-black leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* CTA Section */}
      <section className="py-24 px-8 lg:px-20 bg-soft-bronze">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-4xl font-bold text-soft-white mb-6">
            Ready to Apply What You've Learned?
          </h2>
          <p className="font-paragraph text-lg text-soft-white mb-8">
            Get personalised coaching and support to achieve your goals.
          </p>
          <Link
            to="/store"
            className="inline-block bg-soft-white text-soft-bronze px-8 py-4 rounded-lg font-paragraph text-lg hover:bg-opacity-90 transition-colors"
          >
            Book Your Package Now
          </Link>
        </div>
      </section>
    </div>
  );
}
