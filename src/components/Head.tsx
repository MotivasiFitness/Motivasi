export const Head = () => {
  return (
    <>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=5.0, user-scalable=yes" />
      {/* Mobile Web App Meta Tags */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Motivasi" />
      <meta name="theme-color" content="#1a1a1a" />
      <meta name="mobile-web-app-capable" content="yes" />
      {/* Favicon */}
      <link rel="icon" type="image/png" href="https://static.wixstatic.com/media/93e866_81ff1c66b9e449bc92b4e3a2a753a5ec~mv2.png" />
      <link rel="apple-touch-icon" href="https://static.wixstatic.com/media/93e866_81ff1c66b9e449bc92b4e3a2a753a5ec~mv2.png" />
      {/* Fonts */}
      <link rel="preconnect" href="https://static.parastorage.com" />
      {/* Prevent iOS zoom on input focus */}
      <style>{`
        input[type="text"],
        input[type="email"],
        input[type="password"],
        input[type="number"],
        textarea,
        select {
          font-size: 16px !important;
        }
      `}</style>
    </>
  );
};
