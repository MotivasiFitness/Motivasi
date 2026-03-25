# XML Sitemap Generation Guide

## Overview
XML sitemaps help search engines discover and index all pages on your website. This guide explains how to create and maintain sitemaps for Google compliance.

## Sitemap Structure

### Main Sitemap (sitemap.xml)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://motivasi.com/</loc>
    <lastmod>2026-03-25</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://motivasi.com/about</loc>
    <lastmod>2026-03-25</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://motivasi.com/online-training</loc>
    <lastmod>2026-03-25</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://motivasi.com/blog</loc>
    <lastmod>2026-03-25</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://motivasi.com/privacy</loc>
    <lastmod>2026-03-25</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://motivasi.com/terms</loc>
    <lastmod>2026-03-25</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://motivasi.com/accessibility</loc>
    <lastmod>2026-03-25</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://motivasi.com/disclaimer</loc>
    <lastmod>2026-03-25</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
```

### Blog Sitemap (sitemap-blog.xml)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://motivasi.com/blog/post-slug-1</loc>
    <lastmod>2026-03-20</lastmod>
    <changefreq>never</changefreq>
    <priority>0.7</priority>
    <image:image>
      <image:loc>https://example.com/image1.jpg</image:loc>
      <image:title>Blog Post Image</image:title>
    </image:image>
  </url>
  <url>
    <loc>https://motivasi.com/blog/post-slug-2</loc>
    <lastmod>2026-03-15</lastmod>
    <changefreq>never</changefreq>
    <priority>0.7</priority>
    <image:image>
      <image:loc>https://example.com/image2.jpg</image:loc>
      <image:title>Blog Post Image</image:title>
    </image:image>
  </url>
</urlset>
```

### Sitemap Index (sitemap_index.xml)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://motivasi.com/sitemap.xml</loc>
    <lastmod>2026-03-25</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://motivasi.com/sitemap-blog.xml</loc>
    <lastmod>2026-03-25</lastmod>
  </sitemap>
</sitemapindex>
```

## Implementation Steps

### Step 1: Create Sitemap Files
1. Create `/public/sitemap.xml` with main pages
2. Create `/public/sitemap-blog.xml` with blog posts
3. Create `/public/sitemap_index.xml` that references both

### Step 2: Update robots.txt
Add sitemap references to `/public/robots.txt`:
```
Sitemap: https://motivasi.com/sitemap.xml
Sitemap: https://motivasi.com/sitemap-blog.xml
```

### Step 3: Submit to Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property
3. Go to Sitemaps section
4. Submit `https://motivasi.com/sitemap_index.xml`

### Step 4: Submit to Bing Webmaster Tools
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Select your site
3. Go to Sitemaps
4. Submit `https://motivasi.com/sitemap_index.xml`

## Best Practices

### URL Priority
- **1.0**: Homepage
- **0.9**: Main service pages (online-training)
- **0.8**: Secondary pages (about, blog)
- **0.7**: Blog posts
- **0.5**: Legal pages (privacy, terms)

### Change Frequency
- **daily**: Homepage, blog listing
- **weekly**: Service pages
- **monthly**: About, static pages
- **yearly**: Legal pages
- **never**: Archived content

### Update Schedule
- Update sitemaps weekly
- Update blog sitemap daily when new posts are published
- Update main sitemap when pages are added/removed

## Google Search Console Monitoring

### Key Metrics to Monitor
1. **Coverage**: Ensure all pages are indexed
2. **Enhancements**: Check for structured data issues
3. **Performance**: Monitor search impressions and clicks
4. **Mobile Usability**: Ensure mobile-friendly design
5. **Core Web Vitals**: Monitor performance metrics

### Common Issues
- **Excluded by robots.txt**: Check robots.txt configuration
- **Noindex tag**: Ensure important pages aren't noindexed
- **Redirect chains**: Avoid multiple redirects
- **Duplicate content**: Use canonical tags
- **Soft 404 errors**: Fix pages returning 404

## Automated Sitemap Generation

### Using Node.js
```typescript
import { generateSitemap } from '@/lib/seo-utils';

const entries = [
  { url: 'https://motivasi.com/', changefreq: 'weekly', priority: 1.0 },
  { url: 'https://motivasi.com/about', changefreq: 'monthly', priority: 0.8 },
  // ... more entries
];

const sitemap = generateSitemap(entries);
// Write to file or serve via API
```

### Using Astro Integration
Consider using `astro-sitemap` package for automatic generation:
```bash
npm install astro-sitemap
```

## Verification

### Check Sitemap Validity
1. Visit `https://motivasi.com/sitemap.xml` in browser
2. Verify XML is well-formed
3. Check all URLs are accessible
4. Verify lastmod dates are recent

### Test with Google
1. Use [Google Search Console](https://search.google.com/search-console)
2. Test URL tool to verify indexing
3. Check coverage report for errors

## Resources
- [Google Sitemap Protocol](https://www.sitemaps.org/)
- [Google Search Console Help](https://support.google.com/webmasters)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)

---

**Last Updated**: 2026-03-25
**Status**: Ready for implementation
