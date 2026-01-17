# Portal UI Standardization Implementation Guide

## Overview

This document outlines the global UI standardization system implemented across all client and trainer portal pages. The system defines three standard section types with distinct visual rules for background contrast, elevation, CTA dominance, and spacing to ensure consistent visual hierarchy and priority signaling.

**IMPORTANT:** This is a purely visual standardization. No logic, features, or data changes are included.

## Design System Location

All design tokens and utilities are defined in:
```
/src/lib/portal-design-system.ts
```

## Three Standard Section Types

### 1. PRIMARY HERO SECTION

**Purpose:** Page title, key metrics, primary CTAs, and most important information

**Visual Weight:** Highest - commands immediate attention

**Design Rules:**
- Background: `bg-gradient-to-r from-soft-bronze to-soft-bronze/80`
- Text: `text-soft-white` for maximum readability
- Padding: `p-8` (generous spacing)
- Border Radius: `rounded-2xl`
- Elevation: No shadow (background contrast provides separation)
- CTA Style: `bg-soft-white text-soft-bronze` (inverted for dominance)
- Typography: Largest headings (`text-4xl` or `text-5xl`)
- Spacing: `mb-8` (large gap from next section)

**Usage Example:**
```tsx
import { PRIMARY_HERO_SECTION } from '@/lib/portal-design-system';

<div className={PRIMARY_HERO_SECTION.container}>
  <h1 className={PRIMARY_HERO_SECTION.heading}>My Training Programme</h1>
  <p className={PRIMARY_HERO_SECTION.subheading}>Week 1 • Your personalised plan</p>
  <button className={PRIMARY_HERO_SECTION.cta}>Start Training</button>
</div>
```

### 2. SECONDARY SECTION

**Purpose:** Main content blocks, training cards, data displays, interactive elements

**Visual Weight:** Medium - clear separation and card-like appearance

**Design Rules:**
- Background: `bg-soft-white` (clean, elevated)
- Border: `border border-warm-sand-beige` (subtle definition)
- Padding: `p-6 lg:p-8`
- Border Radius: `rounded-2xl`
- Elevation: No shadow by default, `shadow-lg` when active/interactive
- CTA Style: `bg-soft-bronze text-soft-white` (standard brand CTA)
- Typography: `text-2xl` for section headings
- Spacing: `mb-6` (medium gap between sections)
- Internal Spacing: `space-y-6` for content within

**Usage Example:**
```tsx
import { SECONDARY_SECTION } from '@/lib/portal-design-system';

<div className={SECONDARY_SECTION.container}>
  <h2 className={SECONDARY_SECTION.heading}>Week 1 Trainings</h2>
  <div className={SECONDARY_SECTION.contentSpacing}>
    {/* Training cards content */}
  </div>
</div>
```

### 3. TERTIARY / SUPPORTING SECTION

**Purpose:** Tips, guidance, supplementary information, less critical content

**Visual Weight:** Lowest - subtle, supportive, non-intrusive

**Design Rules:**
- Background: `bg-warm-sand-beige/30` (very subtle, blends with page background)
- Border: `border border-warm-sand-beige` (minimal definition)
- Padding: `p-6 lg:p-8`
- Border Radius: `rounded-2xl`
- Elevation: None (intentionally flat)
- CTA Style: Minimal or text-based (if any)
- Typography: `text-xl` or `text-lg` for headings
- Spacing: `mb-6` (consistent with secondary)
- Internal Spacing: `space-y-4` (slightly tighter than secondary)

**Usage Example:**
```tsx
import { TERTIARY_SECTION } from '@/lib/portal-design-system';

<div className={TERTIARY_SECTION.container}>
  <h3 className={TERTIARY_SECTION.heading}>Programme Tips</h3>
  <div className={TERTIARY_SECTION.contentSpacing}>
    {/* Tips content */}
  </div>
</div>
```

## Supporting Components

### Inline Guidance / Info Blocks

**Purpose:** Contextual help, instructions, reassurance messages

```tsx
import { INLINE_GUIDANCE } from '@/lib/portal-design-system';

<div className={INLINE_GUIDANCE.container}>
  <h3 className={INLINE_GUIDANCE.heading}>How your programme works</h3>
  <div className={INLINE_GUIDANCE.list}>
    <p className={INLINE_GUIDANCE.listItem}>• Instruction text here</p>
  </div>
</div>
```

### Stat / Metric Cards

**Purpose:** Display key metrics, progress indicators, data points

```tsx
import { STAT_CARD } from '@/lib/portal-design-system';

<div className={STAT_CARD.container}>
  <Clock className={STAT_CARD.icon} />
  <p className={STAT_CARD.label}>Training Length</p>
  <p className={STAT_CARD.value}>30-35 min</p>
</div>
```

### Page Wrapper

**Purpose:** Consistent page-level styling and spacing

```tsx
import { PAGE_WRAPPER } from '@/lib/portal-design-system';

<div className={PAGE_WRAPPER.container}>
  {/* All page sections */}
</div>
```

## Implementation Pattern: My Training Programme Page

### Before Standardization:
- Mixed styling approaches
- Inconsistent section hierarchy
- Unclear visual priority
- Varying spacing and elevation

### After Standardization:

**PRIMARY HERO:** Combined page title, program progress ring, and overview metrics
- Gradient background with high contrast
- Integrated progress visualization
- Quick stats in hero context
- Primary CTA (View History) with inverted styling

**SECONDARY SECTIONS:** Training blocks with clear card separation
- Clean white background with subtle borders
- Consistent padding and spacing
- Active state with shadow elevation
- Standard brand CTAs

**TERTIARY SECTION:** Programme Tips
- Subtle background that blends with page
- Lower visual weight
- Supportive, non-intrusive styling

## Pages to Standardize

### Client Portal Pages:
1. ✅ **MyProgramPage.tsx** - IMPLEMENTED
   - Primary Hero: Title + Progress + Stats
   - Secondary: Training blocks
   - Tertiary: Programme tips

2. **DashboardPage.tsx** - TO IMPLEMENT
   - Primary Hero: Welcome + Key metrics
   - Secondary: Upcoming sessions, Recent activity
   - Tertiary: Quick tips

3. **ProgressPage.tsx** - TO IMPLEMENT
   - Primary Hero: Progress overview
   - Secondary: Check-in history, Video submissions
   - Tertiary: Tracking tips

4. **NutritionPage.tsx** - TO IMPLEMENT
   - Primary Hero: Nutrition plan overview
   - Secondary: Meal guidance, Resources
   - Tertiary: Nutrition tips

5. **WorkoutHistoryPage.tsx** - TO IMPLEMENT
   - Primary Hero: History overview + Stats
   - Secondary: Completed workouts list
   - Tertiary: Achievement highlights

### Trainer Portal Pages:
1. **TrainerDashboardPage.tsx** - TO IMPLEMENT
   - Primary Hero: Dashboard overview + Key metrics
   - Secondary: Client activity, Notifications
   - Tertiary: Quick actions

2. **TrainerClientsPage.tsx** - TO IMPLEMENT
   - Primary Hero: Client roster overview
   - Secondary: Client cards/list
   - Tertiary: Management tips

3. **CreateProgramPage.tsx** - TO IMPLEMENT
   - Primary Hero: Program creation header
   - Secondary: Program builder interface
   - Tertiary: Creation tips

## Migration Checklist

For each page:

1. **Import design system:**
   ```tsx
   import { 
     PRIMARY_HERO_SECTION, 
     SECONDARY_SECTION, 
     TERTIARY_SECTION, 
     INLINE_GUIDANCE,
     STAT_CARD,
     PAGE_WRAPPER 
   } from '@/lib/portal-design-system';
   ```

2. **Wrap page in PAGE_WRAPPER:**
   ```tsx
   <div className={PAGE_WRAPPER.container}>
   ```

3. **Identify and restructure sections:**
   - What's the most important information? → PRIMARY HERO
   - What are the main content blocks? → SECONDARY
   - What's supplementary/tips? → TERTIARY

4. **Apply section styles:**
   - Replace custom classes with design system tokens
   - Maintain all existing functionality
   - Preserve all data logic

5. **Test visual hierarchy:**
   - Primary hero should dominate
   - Secondary sections should be clearly separated
   - Tertiary should be subtle but readable

## Design Principles

1. **Consistency Over Customization:** Use standard section types across all pages
2. **Visual Hierarchy:** Primary > Secondary > Tertiary weight must be clear
3. **No Logic Changes:** This is purely visual - all features remain unchanged
4. **Responsive Design:** All sections maintain hierarchy on mobile
5. **Accessibility:** Contrast ratios meet WCAG AA standards

## Benefits

1. **User Experience:**
   - Clear visual priority signaling
   - Consistent navigation patterns
   - Reduced cognitive load

2. **Developer Experience:**
   - Faster page development
   - Consistent styling patterns
   - Easier maintenance

3. **Design Consistency:**
   - Unified visual language
   - Predictable section hierarchy
   - Professional appearance

## Notes

- This system is purely visual - no features, logic, or data are changed
- All existing functionality is preserved
- The system is designed to be applied incrementally across pages
- Each section type has clear, documented rules for consistent application
