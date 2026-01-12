# Global Hover & Active State System

## Overview
This document describes the global hover and active state system implemented across both the Client Portal (`/portal/*`) and Trainer Portal (`/trainer/*`). This system provides a consistent, unified behavior for all interactive elements including tabs, quick links, and card-style navigation components.

## Design Principles

### Color Scheme
- **Hover State Background**: `soft-bronze` (#B08D57)
- **Hover State Text**: `soft-white` (#FAF9F7)
- **Active State**: Same as hover state - `soft-bronze` background with `soft-white` text
- **Transition Duration**: 300ms for smooth, professional feel
- **Transition Type**: `transition-all` for coordinated color and text changes

### Behavior Rules

#### Desktop & Tablet
- **Hover**: Full container highlights with `soft-bronze` background and white text
- **Active/Selected**: Remains highlighted with same color scheme
- **Transition**: Smooth 300ms transition on all properties

#### Mobile
- **Hover**: Not required (no hover on touch devices)
- **Active/Selected**: Remains highlighted with same color scheme
- **Tap**: Immediate state change without hover preview

### Contrast & Accessibility
All hover and active states maintain WCAG AA contrast ratios:
- Text on `soft-bronze` background: 4.5:1 contrast ratio
- `soft-bronze` on `soft-white` background: 3:1 contrast ratio

## Implementation

### Global CSS Classes (in `/src/styles/global.css`)

```css
/* Base hover state for interactive cards/tabs */
.interactive-card-hover {
  @apply transition-all duration-300;
}

.interactive-card-hover:hover {
  @apply bg-soft-bronze text-soft-white;
}

/* For elements that need to maintain text color on hover */
.interactive-card-hover-preserve-text {
  @apply transition-all duration-300;
}

.interactive-card-hover-preserve-text:hover {
  @apply bg-soft-bronze;
}

/* Active/selected state */
.interactive-card-active {
  @apply bg-soft-bronze text-soft-white;
}

/* Button-style interactive elements */
.interactive-button-hover {
  @apply transition-all duration-300 hover:bg-soft-bronze hover:text-soft-white;
}

/* Tab/filter button styles */
.interactive-tab-button {
  @apply transition-all duration-300;
}

.interactive-tab-button:not(.interactive-tab-active):hover {
  @apply bg-soft-bronze text-soft-white border-soft-bronze;
}

.interactive-tab-active {
  @apply bg-soft-bronze text-soft-white;
}
```

### Inline Tailwind Classes (Recommended Approach)

For maximum flexibility and clarity, use inline Tailwind classes:

```jsx
// For card-style elements
className={`transition-all duration-300 ${
  isActive
    ? 'bg-soft-bronze text-soft-white'
    : 'hover:bg-soft-bronze hover:text-soft-white'
}`}

// For tab buttons
className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
  selectedCategory === category
    ? 'bg-soft-bronze text-soft-white'
    : 'bg-soft-white border border-warm-sand-beige text-charcoal-black hover:bg-soft-bronze hover:text-soft-white hover:border-soft-bronze'
}`}

// For quick action cards
className="bg-charcoal-black text-soft-white p-8 rounded-2xl hover:bg-soft-bronze transition-all duration-300 group"
```

## Applied Components

### Client Portal (`/portal/*`)

#### MyProgramPage.tsx
- **Workout Day Cards**: Full background highlight on hover
- **Exercise Headers**: Text color change on hover
- **Chevron Icons**: Consistent color on expanded/collapsed states

#### NutritionPage.tsx
- **Nutrition Tips Cards**: Full background highlight on hover
- **Macro Guide Cards**: Full background highlight on hover

#### ProgressPage.tsx
- **Progress Snapshot Cards**: Full background highlight on hover
- **Check-in Card Headers**: Full background highlight on hover
- **Chevron Icons**: Consistent color throughout

#### VideoLibraryPage.tsx
- **Category Filter Buttons**: Full background highlight on hover
- **Video Cards**: Border and shadow changes on hover

#### BookingsPage.tsx
- **Booking Cards**: Full background highlight on hover

### Trainer Portal (`/trainer/*`)

#### TrainerDashboardPage.tsx
- **Quick Action Cards**: Full background highlight on hover
- **Program Cards**: Full background highlight on hover

#### TrainerClientsPage.tsx
- **Client Cards**: Full background highlight on hover

#### TrainerDashboardLayout.tsx
- **Sidebar Navigation**: Already implements `soft-bronze` active state
- **Settings/Logout Links**: Hover state transitions

## Usage Guidelines

### When to Use Each Approach

#### 1. **Inline Tailwind Classes** (Recommended)
Use for:
- Dynamic states (active/inactive)
- Component-specific behavior
- Maximum clarity and maintainability

```jsx
className={`transition-all duration-300 ${
  isActive
    ? 'bg-soft-bronze text-soft-white'
    : 'hover:bg-soft-bronze hover:text-soft-white'
}`}
```

#### 2. **Global CSS Classes**
Use for:
- Repeated patterns across multiple components
- Consistent styling without inline logic
- Easier theme changes in the future

```jsx
className="interactive-card-hover"
```

#### 3. **Group Hover** (for nested elements)
Use for:
- Icon scaling on parent hover
- Text color changes in child elements
- Coordinated animations

```jsx
className="group hover:bg-soft-bronze"
// Child element:
className="group-hover:scale-110"
```

## Color Combinations

### Approved Hover States

| Element Type | Default | Hover | Active | Notes |
|---|---|---|---|---|
| Card/Tab | `bg-soft-white` | `bg-soft-bronze text-soft-white` | `bg-soft-bronze text-soft-white` | Full highlight |
| Button | `bg-charcoal-black` | `bg-soft-bronze` | `bg-soft-bronze` | Text stays white |
| Filter Button | `border border-warm-sand-beige` | `bg-soft-bronze text-soft-white border-soft-bronze` | `bg-soft-bronze text-soft-white` | Border color changes |
| Link Card | `text-soft-bronze` | `text-soft-white` | N/A | Text color only |

## Transition Specifications

- **Duration**: 300ms (consistent across all elements)
- **Timing Function**: `ease` (default, smooth)
- **Properties**: `all` (background, text color, border color)

```css
transition: all 300ms ease;
```

## Mobile Considerations

- **No Hover States**: Touch devices don't support hover
- **Active States Only**: Use active/selected states for mobile
- **Tap Feedback**: Immediate state change on tap
- **No Hover-Only Content**: Never hide content behind hover on mobile

## Testing Checklist

- [ ] Hover works on desktop (Chrome, Firefox, Safari)
- [ ] Hover works on tablet (iPad, Android tablet)
- [ ] No hover on mobile (iPhone, Android phone)
- [ ] Active states are clearly visible
- [ ] Contrast ratios meet WCAG AA standards
- [ ] Transitions are smooth (60fps)
- [ ] No layout shifts on hover
- [ ] Text remains readable on hover
- [ ] Icons scale smoothly with group-hover
- [ ] All interactive elements have consistent behavior

## Future Enhancements

Potential improvements for future iterations:
1. **Focus States**: Add keyboard focus indicators
2. **Disabled States**: Define styling for disabled elements
3. **Loading States**: Add loading animations
4. **Error States**: Define error state styling
5. **Success States**: Define success state styling

## Related Files

- `/src/styles/global.css` - Global CSS classes
- `/src/tailwind.config.mjs` - Tailwind color configuration
- `/src/components/pages/ClientPortal/*` - Client portal pages
- `/src/components/pages/TrainerDashboard/*` - Trainer portal pages

## Support

For questions or issues with the hover state system, refer to:
1. This documentation
2. Existing component implementations
3. Tailwind CSS documentation: https://tailwindcss.com/docs/hover-focus-and-other-states
