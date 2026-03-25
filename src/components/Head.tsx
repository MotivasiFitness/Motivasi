export const Head = () => {
  return (
    <>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=5.0, user-scalable=yes" />
      
      {/* Google Guidelines: SEO Meta Tags */}
      <meta name="description" content="Personalized online fitness coaching and personal training programs. Transform your fitness journey with expert trainers and customized workout plans." />
      <meta name="keywords" content="fitness coaching, personal training, online fitness, workout programs, health coaching" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Motivasi" />
      
      {/* Google Guidelines: Open Graph Tags for Social Sharing */}
      <meta property="og:title" content="Motivasi - Online Fitness Coaching & Personal Training" />
      <meta property="og:description" content="Transform your fitness journey with personalized coaching and expert guidance." />
      <meta property="og:image" content="https://static.wixstatic.com/media/93e866_81ff1c66b9e449bc92b4e3a2a753a5ec~mv2.png" />
      <meta property="og:url" content="https://motivasi.com" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Motivasi" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Motivasi - Online Fitness Coaching" />
      <meta name="twitter:description" content="Transform your fitness journey with personalized coaching." />
      <meta name="twitter:image" content="https://static.wixstatic.com/media/93e866_81ff1c66b9e449bc92b4e3a2a753a5ec~mv2.png" />
      
      {/* Google Guidelines: Canonical URL */}
      <link rel="canonical" href="https://motivasi.com" />
      
      {/* Apple-specific viewport refinements */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Motivasi" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="format-detection" content="email=no" />
      
      {/* Prevent text size adjustment on landscape orientation */}
      <meta name="text-size-adjust" content="100%" />
      <meta name="apple-touch-fullscreen" content="yes" />
      <meta name="theme-color" content="#c9956f" />
      <meta name="mobile-web-app-capable" content="yes" />
      
      {/* Google Guidelines: Security & Trust */}
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      
      {/* Web App Manifest for PWA support */}
      <link rel="manifest" href="/manifest.json" />
      
      {/* Favicon */}
      <link rel="icon" type="image/png" href="https://static.wixstatic.com/media/93e866_81ff1c66b9e449bc92b4e3a2a753a5ec~mv2.png" />
      <link rel="apple-touch-icon" href="https://static.wixstatic.com/media/93e866_81ff1c66b9e449bc92b4e3a2a753a5ec~mv2.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="https://static.wixstatic.com/media/93e866_81ff1c66b9e449bc92b4e3a2a753a5ec~mv2.png" />
      
      {/* Google Guidelines: Preconnect & DNS Prefetch for Performance */}
      <link rel="preconnect" href="https://static.parastorage.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      
      {/* Prevent iOS zoom on input focus and optimize Apple device display */}
      <style>{`
        input[type="text"],
        input[type="email"],
        input[type="password"],
        input[type="number"],
        textarea,
        select {
          font-size: 16px !important;
        }
        
        /* Optimize for notch and safe areas on iPhone X and later */
        @supports (padding: max(0px)) {
          body {
            padding-left: max(12px, env(safe-area-inset-left));
            padding-right: max(12px, env(safe-area-inset-right));
            padding-top: max(12px, env(safe-area-inset-top));
            padding-bottom: max(12px, env(safe-area-inset-bottom));
          }
        }
        
        /* Prevent unwanted text selection on iOS */
        -webkit-user-select: none;
        -webkit-touch-callout: none;
      `}</style>
    </>
  );
};
