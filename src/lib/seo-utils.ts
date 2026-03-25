/**
 * SEO Utilities for Google Guidelines Compliance
 * Provides helpers for structured data, meta tags, and SEO optimization
 */

/**
 * Organization Schema for JSON-LD
 * Helps Google understand your business
 */
export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Motivasi',
  url: 'https://motivasi.com',
  logo: 'https://static.wixstatic.com/media/93e866_81ff1c66b9e449bc92b4e3a2a753a5ec~mv2.png',
  description: 'Online fitness coaching and personal training programs',
  sameAs: [
    'https://www.facebook.com/motivasi',
    'https://www.instagram.com/motivasi',
    'https://www.linkedin.com/company/motivasi',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'support@motivasi.com',
    availableLanguage: ['en', 'es', 'fr'],
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Your Street Address',
    addressLocality: 'Your City',
    addressRegion: 'Your State',
    postalCode: 'Your Zip',
    addressCountry: 'Your Country',
  },
});

/**
 * Service Schema for JSON-LD
 * Describes your fitness coaching services
 */
export const getServiceSchema = (serviceType: 'online-coaching' | 'personal-training' | 'nutrition') => {
  const services = {
    'online-coaching': {
      name: 'Online Fitness Coaching',
      description: 'Personalized online fitness coaching programs tailored to your goals',
      url: 'https://motivasi.com/online-training',
    },
    'personal-training': {
      name: 'Personal Training',
      description: 'One-on-one personal training sessions with certified coaches',
      url: 'https://motivasi.com/about',
    },
    nutrition: {
      name: 'Nutrition Guidance',
      description: 'Personalized nutrition plans and dietary guidance',
      url: 'https://motivasi.com/portal/nutrition',
    },
  };

  const service = services[serviceType];

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    url: service.url,
    provider: {
      '@type': 'Organization',
      name: 'Motivasi',
      url: 'https://motivasi.com',
    },
    areaServed: 'Worldwide',
    availableLanguage: ['en', 'es', 'fr'],
  };
};

/**
 * LocalBusiness Schema for JSON-LD
 * Helps with local search visibility
 */
export const getLocalBusinessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Motivasi',
  image: 'https://static.wixstatic.com/media/93e866_81ff1c66b9e449bc92b4e3a2a753a5ec~mv2.png',
  description: 'Online fitness coaching and personal training',
  url: 'https://motivasi.com',
  telephone: '+1-XXX-XXX-XXXX',
  email: 'support@motivasi.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Your Street Address',
    addressLocality: 'Your City',
    addressRegion: 'Your State',
    postalCode: 'Your Zip',
    addressCountry: 'Your Country',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday', 'Sunday'],
      opens: '10:00',
      closes: '16:00',
    },
  ],
  sameAs: [
    'https://www.facebook.com/motivasi',
    'https://www.instagram.com/motivasi',
  ],
});

/**
 * FAQ Schema for JSON-LD
 * Improves visibility in Google's featured snippets
 */
export const getFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

/**
 * Breadcrumb Schema for JSON-LD
 * Improves navigation in search results
 */
export const getBreadcrumbSchema = (breadcrumbs: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: crumb.url,
  })),
});

/**
 * Article Schema for JSON-LD
 * Use for blog posts
 */
export const getArticleSchema = (article: {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  author: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: article.headline,
  description: article.description,
  image: article.image,
  datePublished: article.datePublished,
  dateModified: article.dateModified,
  author: {
    '@type': 'Person',
    name: article.author,
  },
  url: article.url,
  mainEntity: {
    '@type': 'Article',
    headline: article.headline,
  },
});

/**
 * Product Schema for JSON-LD
 * Use for coaching packages and products
 */
export const getProductSchema = (product: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  rating?: number;
  reviewCount?: number;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.image,
  url: product.url,
  offers: {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: product.currency,
    availability: 'https://schema.org/InStock',
  },
  ...(product.rating && {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 1,
    },
  }),
});

/**
 * Person Schema for JSON-LD
 * Use for trainer profiles
 */
export const getPersonSchema = (person: {
  name: string;
  description: string;
  image: string;
  jobTitle: string;
  url: string;
  email?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: person.name,
  description: person.description,
  image: person.image,
  jobTitle: person.jobTitle,
  url: person.url,
  ...(person.email && { email: person.email }),
});

/**
 * Open Graph Meta Tags
 * Improves social media sharing
 */
export const getOpenGraphTags = (page: {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: 'website' | 'article' | 'profile';
}) => ({
  'og:title': page.title,
  'og:description': page.description,
  'og:image': page.image,
  'og:url': page.url,
  'og:type': page.type || 'website',
  'og:site_name': 'Motivasi',
  'twitter:card': 'summary_large_image',
  'twitter:title': page.title,
  'twitter:description': page.description,
  'twitter:image': page.image,
});

/**
 * Canonical URL Helper
 * Prevents duplicate content issues
 */
export const getCanonicalUrl = (path: string): string => {
  const baseUrl = 'https://motivasi.com';
  return `${baseUrl}${path}`;
};

/**
 * Robots Meta Tags
 * Controls search engine crawling
 */
export const getRobotsMeta = (index: boolean = true, follow: boolean = true): string => {
  const parts = [];
  if (index) parts.push('index');
  else parts.push('noindex');
  if (follow) parts.push('follow');
  else parts.push('nofollow');
  return parts.join(', ');
};

/**
 * Generate Meta Description
 * Optimized for search results (155-160 characters)
 */
export const generateMetaDescription = (text: string, maxLength: number = 160): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Generate Page Title
 * Optimized for search results (50-60 characters)
 */
export const generatePageTitle = (title: string, siteName: string = 'Motivasi'): string => {
  const combined = `${title} | ${siteName}`;
  if (combined.length <= 60) return combined;
  return `${title.substring(0, 40)} | ${siteName}`;
};

/**
 * Structured Data Helper
 * Injects JSON-LD script into page
 */
export const injectStructuredData = (schema: Record<string, any>): void => {
  if (typeof window === 'undefined') return;

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
};

/**
 * Sitemap Entry
 * For XML sitemap generation
 */
export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Generate XML Sitemap
 */
export const generateSitemap = (entries: SitemapEntry[]): string => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    entry => `
  <url>
    <loc>${entry.url}</loc>
    ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
    ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ''}
    ${entry.priority ? `<priority>${entry.priority}</priority>` : ''}
  </url>
`
  )
  .join('')}
</urlset>`;
  return xml;
};

/**
 * Performance Monitoring
 * Tracks Core Web Vitals
 */
export const trackCoreWebVitals = (): void => {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.error('LCP observer error:', e);
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          console.log('FID:', entry.processingDuration);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.error('FID observer error:', e);
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            console.log('CLS:', clsValue);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.error('CLS observer error:', e);
    }
  }
};

/**
 * Accessibility Checker
 * Basic checks for WCAG compliance
 */
export const checkAccessibility = (): { issues: string[] } => {
  const issues: string[] = [];

  // Check for images without alt text
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.alt || img.alt.trim() === '') {
      issues.push(`Image missing alt text: ${img.src}`);
    }
  });

  // Check for form inputs without labels
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (!label && !input.getAttribute('aria-label')) {
      issues.push(`Form input missing label: ${input.id || input.name}`);
    }
  });

  // Check for headings
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headings.length === 0) {
    issues.push('Page has no headings');
  }

  // Check for multiple h1 tags
  const h1s = document.querySelectorAll('h1');
  if (h1s.length > 1) {
    issues.push('Page has multiple h1 tags');
  }

  return { issues };
};
