/**
 * Portal Design System - Global UI Standardization
 * 
 * This file defines the three standard section types used across all client and trainer portal pages
 * to ensure consistent visual hierarchy, background contrast, elevation, CTA dominance, and spacing.
 * 
 * NO LOGIC OR FEATURE CHANGES - This is purely visual standardization.
 */

/**
 * PRIMARY HERO SECTION
 * 
 * Purpose: Page title, key metrics, primary CTAs, and most important information
 * Visual Weight: Highest - commands immediate attention
 * 
 * Design Rules:
 * - Background: Gradient (soft-bronze to soft-bronze/80) with high contrast
 * - Text: soft-white for maximum readability
 * - Padding: p-8 (generous spacing)
 * - Border Radius: rounded-2xl
 * - Elevation: No shadow (background contrast provides separation)
 * - CTA Style: bg-soft-white text-soft-bronze (inverted for dominance)
 * - Typography: Largest headings (text-4xl or text-5xl)
 * - Spacing: mb-8 (large gap from next section)
 */
export const PRIMARY_HERO_SECTION = {
  container: "bg-gradient-to-r from-soft-bronze to-soft-bronze/80 rounded-2xl p-8 text-soft-white mb-8",
  heading: "font-heading text-4xl lg:text-5xl font-bold mb-2",
  subheading: "text-soft-white/90 text-base lg:text-lg",
  cta: "bg-soft-white text-soft-bronze px-6 py-3 rounded-lg font-heading text-base font-bold hover:bg-soft-white/90 transition-all duration-300 shadow-md hover:shadow-lg",
  ctaIcon: "text-soft-bronze",
} as const;

/**
 * SECONDARY SECTION
 * 
 * Purpose: Main content blocks, training cards, data displays, interactive elements
 * Visual Weight: Medium - clear separation and card-like appearance
 * 
 * Design Rules:
 * - Background: bg-soft-white (clean, elevated)
 * - Border: border border-warm-sand-beige (subtle definition)
 * - Padding: p-6 lg:p-8
 * - Border Radius: rounded-2xl
 * - Elevation: No shadow by default, shadow-lg when active/interactive
 * - CTA Style: bg-soft-bronze text-soft-white (standard brand CTA)
 * - Typography: text-2xl for section headings
 * - Spacing: mb-6 (medium gap between sections)
 * - Internal Spacing: space-y-6 for content within
 */
export const SECONDARY_SECTION = {
  container: "bg-soft-white border border-warm-sand-beige rounded-2xl p-6 lg:p-8 mb-6",
  containerActive: "bg-soft-white border border-soft-bronze rounded-2xl p-6 lg:p-8 mb-6 shadow-lg",
  heading: "font-heading text-2xl font-bold text-charcoal-black mb-6",
  subheading: "text-base text-warm-grey mb-4",
  cta: "bg-soft-bronze text-soft-white px-6 py-3 rounded-lg font-bold text-base hover:bg-soft-bronze/90 transition-all duration-300",
  ctaIcon: "text-soft-white",
  contentSpacing: "space-y-6",
} as const;

/**
 * TERTIARY / SUPPORTING SECTION
 * 
 * Purpose: Tips, guidance, supplementary information, less critical content
 * Visual Weight: Lowest - subtle, supportive, non-intrusive
 * 
 * Design Rules:
 * - Background: bg-warm-sand-beige/30 (very subtle, blends with page background)
 * - Border: border border-warm-sand-beige (minimal definition)
 * - Padding: p-6 lg:p-8
 * - Border Radius: rounded-2xl
 * - Elevation: None (intentionally flat)
 * - CTA Style: Minimal or text-based (if any)
 * - Typography: text-xl or text-lg for headings
 * - Spacing: mb-6 (consistent with secondary)
 * - Internal Spacing: space-y-4 (slightly tighter than secondary)
 */
export const TERTIARY_SECTION = {
  container: "bg-warm-sand-beige/30 border border-warm-sand-beige rounded-2xl p-6 lg:p-8 mb-6",
  heading: "font-heading text-xl lg:text-2xl font-bold text-charcoal-black mb-6",
  subheading: "text-sm text-warm-grey mb-3",
  contentSpacing: "space-y-4",
  tipItem: "mb-4 last:mb-0",
  tipHeading: "font-paragraph font-bold text-charcoal-black mb-2",
  tipText: "text-warm-grey text-sm leading-relaxed",
} as const;

/**
 * INLINE GUIDANCE / INFO BLOCKS
 * 
 * Purpose: Contextual help, instructions, reassurance messages
 * Visual Weight: Subtle but noticeable - informative without being intrusive
 * 
 * Design Rules:
 * - Background: bg-soft-white or bg-[color]-50 depending on type
 * - Border: border-l-4 border-soft-bronze (left accent for visual interest)
 * - Padding: p-6
 * - Border Radius: rounded-r-xl (right side only, complements left border)
 * - Elevation: None
 * - Typography: text-base or text-sm
 * - Spacing: mb-6
 */
export const INLINE_GUIDANCE = {
  container: "bg-soft-white border-l-4 border-soft-bronze rounded-r-xl p-6 mb-6",
  heading: "font-heading text-lg font-bold text-charcoal-black mb-3",
  text: "font-paragraph text-charcoal-black leading-relaxed text-sm",
  list: "space-y-2",
  listItem: "text-sm leading-relaxed",
} as const;

/**
 * STAT / METRIC CARDS
 * 
 * Purpose: Display key metrics, progress indicators, data points
 * Visual Weight: Medium - clear but not dominant
 * 
 * Design Rules:
 * - Background: bg-warm-sand-beige/20 (subtle elevation within sections)
 * - Padding: p-4
 * - Border Radius: rounded-xl
 * - Elevation: None
 * - Typography: text-2xl for values, text-sm for labels
 * - Layout: Centered, icon above label above value
 */
export const STAT_CARD = {
  container: "flex flex-col items-center text-center p-4 bg-warm-sand-beige/20 rounded-xl",
  icon: "w-6 h-6 text-soft-bronze mb-2",
  label: "text-sm text-warm-grey mb-1",
  value: "font-heading text-2xl font-bold text-charcoal-black",
} as const;

/**
 * COLLAPSIBLE / EXPANDABLE SECTIONS
 * 
 * Purpose: Additional details, optional information, progressive disclosure
 * Visual Weight: Minimal when collapsed, medium when expanded
 * 
 * Design Rules:
 * - Container: border border-warm-sand-beige rounded-lg
 * - Header: bg-warm-sand-beige/20 hover:bg-warm-sand-beige/30 p-4
 * - Content: bg-warm-sand-beige/10 border-t border-warm-sand-beige p-4
 * - Typography: text-sm font-bold for headers, text-sm for content
 * - Icon: text-soft-bronze size-18
 */
export const COLLAPSIBLE_SECTION = {
  container: "border border-warm-sand-beige rounded-lg overflow-hidden mb-4",
  header: "w-full flex items-center justify-between p-4 bg-warm-sand-beige/20 hover:bg-warm-sand-beige/30 transition-colors",
  headerIcon: "text-soft-bronze flex-shrink-0",
  headerText: "font-bold text-sm text-charcoal-black",
  content: "p-4 bg-warm-sand-beige/10 border-t border-warm-sand-beige",
  contentText: "text-sm text-charcoal-black leading-relaxed",
} as const;

/**
 * PAGE WRAPPER
 * 
 * Purpose: Consistent page-level styling and spacing
 * 
 * Design Rules:
 * - Background: bg-warm-sand-beige/40 (subtle page background)
 * - Padding: p-6 lg:p-8
 * - Border Radius: rounded-2xl
 * - Min Height: min-h-screen
 * - Content Spacing: space-y-8 (consistent gaps between major sections)
 */
export const PAGE_WRAPPER = {
  container: "space-y-8 bg-warm-sand-beige/40 min-h-screen p-6 lg:p-8 rounded-2xl",
} as const;

/**
 * USAGE EXAMPLES:
 * 
 * Primary Hero (Page Title + Key Metrics + Primary CTA):
 * <div className={PRIMARY_HERO_SECTION.container}>
 *   <h1 className={PRIMARY_HERO_SECTION.heading}>My Training Programme</h1>
 *   <p className={PRIMARY_HERO_SECTION.subheading}>Week 1 • Your personalised plan</p>
 *   <button className={PRIMARY_HERO_SECTION.cta}>Start Training</button>
 * </div>
 * 
 * Secondary Section (Training Blocks):
 * <div className={SECONDARY_SECTION.container}>
 *   <h2 className={SECONDARY_SECTION.heading}>Week 1 Trainings</h2>
 *   <div className={SECONDARY_SECTION.contentSpacing}>
 *     {content}
 *   </div>
 * </div>
 * 
 * Tertiary Section (Programme Tips):
 * <div className={TERTIARY_SECTION.container}>
 *   <h3 className={TERTIARY_SECTION.heading}>Programme Tips</h3>
 *   <div className={TERTIARY_SECTION.contentSpacing}>
 *     {tips}
 *   </div>
 * </div>
 */
