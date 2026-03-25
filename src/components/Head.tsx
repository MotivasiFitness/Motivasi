export const Head = () => {
  return (
    <>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=5.0, user-scalable=yes" />
      {/* Apple-specific viewport refinements */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Motivasi" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="format-detection" content="email=no" />
      {/* Prevent text size adjustment on landscape orientation */}
      <meta name="text-size-adjust" content="100%" />
      <meta name="apple-touch-fullscreen" content="yes" />
      <meta name="theme-color" content="#c9956f" />
      <meta name="mobile-web-app-capable" content="yes" />
      {/* Web App Manifest for PWA support */}
      <link rel="manifest" href="/manifest.json" />
      {/* Favicon */}
      <link rel="icon" type="image/png" href="https://static.wixstatic.com/media/93e866_81ff1c66b9e449bc92b4e3a2a753a5ec~mv2.png" />
      <link rel="apple-touch-icon" href="https://static.wixstatic.com/media/93e866_81ff1c66b9e449bc92b4e3a2a753a5ec~mv2.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="https://static.wixstatic.com/media/93e866_81ff1c66b9e449bc92b4e3a2a753a5ec~mv2.png" />
      {/* Fonts */}
      <link rel="preconnect" href="https://static.parastorage.com" />
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
