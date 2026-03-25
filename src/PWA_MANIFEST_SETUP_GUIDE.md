# Web App Manifest & iOS Integration Setup Guide

## Overview
This guide documents the Web App Manifest implementation for improved iOS integration and Progressive Web App (PWA) support. The manifest enables features like "Add to Home Screen" with custom icons, splash screens, and app shortcuts on Apple devices.

## Files Created/Modified

### 1. **Web App Manifest** (`/src/pages/manifest.json`)
The manifest file defines how your app appears when installed on user devices.

**Key Features:**
- **App Identity**: Name, short name, and description
- **Display Mode**: `standalone` - runs like a native app without browser UI
- **Theme Colors**: 
  - `theme_color`: #c9956f (warm bronze - primary brand color)
  - `background_color`: #ffffff (white)
- **Icons**: Multiple sizes for different contexts (192x192, 512x512, 180x180)
- **Screenshots**: Splash screens for narrow (540x720) and wide (1280x720) displays
- **Shortcuts**: Quick access to key features (Program, History, Progress)
- **Share Target**: Enables share functionality from other apps

### 2. **Head Component** (`/src/components/Head.tsx`)
Updated with PWA meta tags and manifest link.

**Changes:**
- Added `<link rel="manifest" href="/manifest.json" />`
- Updated `theme-color` from #1a1a1a to #c9956f (brand color)
- Maintains existing Apple-specific meta tags for iOS compatibility

## iOS-Specific Features

### Add to Home Screen
Users can add the app to their home screen on iOS:
1. Open Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app will appear with the custom icon and splash screen

### Splash Screens
When launching from home screen, iOS displays:
- **Portrait (540x720)**: For phones in portrait orientation
- **Landscape (1280x720)**: For tablets or landscape mode

### App Shortcuts
Long-press the app icon to access quick shortcuts:
- **View My Program**: Direct access to training program
- **Workout History**: View completed workouts
- **Progress Tracking**: Track fitness progress

### Status Bar Styling
- `apple-mobile-web-app-status-bar-style`: "black-translucent"
- Status bar blends with app for immersive experience
- Safe area insets handled for notched devices (iPhone X+)

## Icon Specifications

### Icon Sizes & Purposes
| Size | Purpose | Format |
|------|---------|--------|
| 192x192 | Android, general PWA | PNG |
| 512x512 | Large displays, app stores | PNG |
| 180x180 | iOS home screen (Apple) | PNG |

### Maskable Icons
Maskable icons (purpose: "maskable") allow the system to apply adaptive icon shapes:
- Used on Android with dynamic icon backgrounds
- Ensures icons look good with various shape masks
- Same image used for both regular and maskable purposes

## Browser Support

### Full PWA Support
- ✅ Chrome/Edge (Android & Desktop)
- ✅ Firefox (Desktop & Android)
- ✅ Safari (iOS 15.1+, macOS 12.1+)
- ✅ Samsung Internet

### iOS Limitations
- iOS doesn't fully support Web App Manifest
- Uses fallback meta tags for compatibility:
  - `apple-mobile-web-app-capable`
  - `apple-mobile-web-app-title`
  - `apple-touch-icon`
- Shortcuts and share target not available on iOS

## Installation Instructions

### For Users (iOS)
1. Open the app in Safari
2. Tap the Share icon (box with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Customize the name if desired
5. Tap "Add"

### For Users (Android)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Install app" or "Add to Home Screen"
4. Follow the prompts

## Testing the Manifest

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Application → Manifest
3. Verify all icons and metadata display correctly

### Lighthouse Audit
1. Open DevTools
2. Go to Lighthouse
3. Run "Progressive Web App" audit
4. Check for manifest-related issues

### iOS Testing
1. Add app to home screen
2. Launch from home screen
3. Verify:
   - Splash screen displays
   - App title shows correctly
   - Status bar styling applies
   - Safe area respected on notched devices

## Customization Guide

### Changing App Name
Edit `/src/pages/manifest.json`:
```json
{
  "name": "Your App Name",
  "short_name": "Short Name"
}
```

### Updating Colors
Edit `/src/pages/manifest.json`:
```json
{
  "theme_color": "#c9956f",
  "background_color": "#ffffff"
}
```

Also update in `/src/components/Head.tsx`:
```tsx
<meta name="theme-color" content="#c9956f" />
```

### Adding/Removing Shortcuts
Edit the `shortcuts` array in `/src/pages/manifest.json`:
```json
{
  "name": "Feature Name",
  "short_name": "Short",
  "description": "Description",
  "url": "/path/to/feature",
  "icons": [...]
}
```

### Updating Icons
Replace image URLs in manifest:
```json
{
  "src": "https://your-image-url.png",
  "sizes": "192x192",
  "type": "image/png"
}
```

## Performance Considerations

### Manifest Size
- Current manifest: ~2KB (minimal impact)
- Loaded once on app install
- No performance impact on subsequent launches

### Icon Optimization
- Icons are cached by the browser
- Use CDN-hosted images for fast delivery
- Consider WebP format for smaller file sizes (with PNG fallback)

### Splash Screen Display
- Splash screens shown only on first launch
- Cached locally after first display
- Minimal performance impact

## Troubleshooting

### Icons Not Displaying
- Verify image URLs are accessible
- Check image dimensions match specified sizes
- Ensure CORS headers allow cross-origin access

### Manifest Not Loading
- Verify `/src/pages/manifest.json` exists
- Check manifest link in Head component
- Verify manifest is valid JSON (use JSONLint)

### iOS Issues
- Ensure `apple-mobile-web-app-capable` meta tag present
- Check `apple-touch-icon` URL is accessible
- Test on iOS 15.1+ for best support

### Shortcuts Not Appearing
- Shortcuts only work on Android
- Verify shortcut URLs are valid
- Check icon sizes (96x96 recommended)

## Security Considerations

### CORS & Image Hosting
- All image URLs must be CORS-accessible
- Use trusted CDN for icon hosting
- Verify SSL/TLS for all image URLs

### Manifest Validation
- Manifest must be valid JSON
- All required fields present
- URLs must be absolute or relative to manifest location

## Future Enhancements

### Potential Additions
1. **File Handling**: Allow app to open specific file types
2. **Protocol Handling**: Handle custom URL schemes
3. **Periodic Sync**: Background sync for notifications
4. **Push Notifications**: Web push support
5. **Offline Support**: Service Worker integration

### Recommended Next Steps
1. Implement Service Worker for offline functionality
2. Add push notification support
3. Enable background sync for workouts
4. Create adaptive icon variants for different platforms

## Resources

- [MDN Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [Apple Web App Support](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
- [Manifest Validator](https://manifest-validator.appspot.com/)

## Support

For issues or questions:
1. Check browser console for errors
2. Validate manifest with online validator
3. Test on multiple devices and browsers
4. Review Lighthouse PWA audit results
