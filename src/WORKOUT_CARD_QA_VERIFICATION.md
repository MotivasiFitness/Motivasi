# Workout Card QA Verification Checklist

## Overview
This document provides a comprehensive QA checklist for testing the enhanced workout card UI across all pages where it appears. Use this to verify behavior, edge cases, and responsive design.

---

## Test Environments

- [ ] **Desktop** (1920px width)
- [ ] **Tablet** (768px width)
- [ ] **Mobile** (375px width - iPhone SE)
- [ ] **Dark Mode** (if applicable)
- [ ] **Light Mode** (default)

---

## 1. Long sessionDescription (Wrapping & Truncation)

### Test Case 1.1: 2-Word Description (Optimal)
**Setup:** sessionDescription = "Lower Body"
**Expected:**
- [ ] Displays on single line on desktop
- [ ] Displays on single line on tablet
- [ ] Displays on single line on mobile
- [ ] No truncation or ellipsis

**Actual Result:** _______________

---

### Test Case 1.2: 4-Word Description (Safe)
**Setup:** sessionDescription = "Full Body Strength Training"
**Expected:**
- [ ] Displays on single line on desktop
- [ ] Displays on single line on tablet
- [ ] May wrap to 2 lines on mobile (acceptable)
- [ ] No truncation

**Actual Result:** _______________

---

### Test Case 1.3: 6-Word Description (Risky)
**Setup:** sessionDescription = "Lower Body Strength and Power Development"
**Expected:**
- [ ] Displays on single line on desktop
- [ ] Wraps to 2 lines on tablet (acceptable)
- [ ] Wraps to 2+ lines on mobile (acceptable)
- [ ] No truncation

**Actual Result:** _______________

---

### Test Case 1.4: Very Long Description (Edge Case)
**Setup:** sessionDescription = "Lower Body Strength and Power Development with Explosive Movements"
**Expected:**
- [ ] Wraps appropriately on all screen sizes
- [ ] Remains readable (no overflow)
- [ ] No truncation or ellipsis

**Actual Result:** _______________

---

## 2. Missing Optional Fields (Clean Fallback UI)

### Test Case 2.1: All Optional Fields Missing
**Setup:**
- sessionDescription = (empty)
- estimatedDuration = (empty)
- exerciseCountLabel = (empty)

**Expected:**
- [ ] Card displays "Training X" as title
- [ ] Shows exercise count with default label (e.g., "5 focused movements")
- [ ] No duration shown
- [ ] Card is not broken or malformed
- [ ] Layout is clean and balanced

**Actual Result:** _______________

---

### Test Case 2.2: Only sessionDescription Missing
**Setup:**
- sessionDescription = (empty)
- estimatedDuration = "~30–40 min"
- exerciseCountLabel = (empty)

**Expected:**
- [ ] Card displays "Training X" as title
- [ ] Shows "5 focused movements • ⏱ ~30–40 min"
- [ ] No sessionDescription line shown
- [ ] Layout is balanced

**Actual Result:** _______________

---

### Test Case 2.3: Only estimatedDuration Missing
**Setup:**
- sessionDescription = "Lower Body Strength"
- estimatedDuration = (empty)
- exerciseCountLabel = (empty)

**Expected:**
- [ ] Card displays "Training X" with sessionDescription
- [ ] Shows "5 focused movements" (no duration)
- [ ] Layout is balanced

**Actual Result:** _______________

---

### Test Case 2.4: Only exerciseCountLabel Missing
**Setup:**
- sessionDescription = "Lower Body Strength"
- estimatedDuration = "~30–40 min"
- exerciseCountLabel = (empty)

**Expected:**
- [ ] Card displays all info with default label
- [ ] Shows "5 focused movements • ⏱ ~30–40 min"
- [ ] Layout is balanced

**Actual Result:** _______________

---

## 3. Exercise Counts (Natural Labels)

### Test Case 3.1: Single Exercise (1)
**Setup:** 1 exercise in session
**Expected:**
- [ ] Default label: "1 focused movement" (singular)
- [ ] Or custom label if set
- [ ] Grammatically correct

**Actual Result:** _______________

---

### Test Case 3.2: Two Exercises (2)
**Setup:** 2 exercises in session
**Expected:**
- [ ] Default label: "2 focused movements" (plural)
- [ ] Or custom label if set
- [ ] Grammatically correct

**Actual Result:** _______________

---

### Test Case 3.3: Three Exercises (3)
**Setup:** 3 exercises in session
**Expected:**
- [ ] Default label: "3 focused movements"
- [ ] Or custom label if set
- [ ] Grammatically correct

**Actual Result:** _______________

---

### Test Case 3.4: Five Exercises (5)
**Setup:** 5 exercises in session
**Expected:**
- [ ] Default label: "5 compound exercises"
- [ ] Or custom label if set
- [ ] Grammatically correct

**Actual Result:** _______________

---

### Test Case 3.5: Six+ Exercises (6+)
**Setup:** 6+ exercises in session
**Expected:**
- [ ] Default label: "6+ comprehensive session"
- [ ] Or custom label if set
- [ ] Grammatically correct

**Actual Result:** _______________

---

## 4. "Next Up" State

### Test Case 4.1: Next Up - Not Completed
**Setup:**
- isNextRecommended = true
- isCompleted = false
- isActive = false

**Expected:**
- [ ] "Next up" badge visible with star icon
- [ ] Badge styling: soft-bronze background, white text
- [ ] Card has subtle ring/border highlight
- [ ] Card header has light background tint

**Actual Result:** _______________

---

### Test Case 4.2: Next Up - Already Completed
**Setup:**
- isNextRecommended = true
- isCompleted = true
- isActive = false

**Expected:**
- [ ] "Next up" badge NOT shown
- [ ] "Completed" badge shown instead
- [ ] Card styling: green background
- [ ] No ring/border highlight

**Actual Result:** _______________

---

### Test Case 4.3: Next Up - Currently Active
**Setup:**
- isNextRecommended = true
- isCompleted = false
- isActive = true

**Expected:**
- [ ] "Next up" badge NOT shown (active takes precedence)
- [ ] Card header: soft-bronze background
- [ ] Text: white
- [ ] "Start Training" button visible

**Actual Result:** _______________

---

### Test Case 4.4: No Next Up - Pending
**Setup:**
- isNextRecommended = false
- isCompleted = false
- isActive = false

**Expected:**
- [ ] No badge shown
- [ ] Card styling: default (white background, warm-sand-beige border)
- [ ] No ring/border highlight

**Actual Result:** _______________

---

## 5. Mobile Tap Targets & Spacing

### Test Case 5.1: Header Button Tap Target (Mobile)
**Setup:** Mobile view (375px)
**Expected:**
- [ ] Header button height: ≥48px (WCAG AA minimum)
- [ ] Padding around text: ≥4px
- [ ] Clickable area extends full width
- [ ] No accidental overlaps with other elements

**Actual Result:** _______________

---

### Test Case 5.2: "Start Training" Button Tap Target (Mobile)
**Setup:** Mobile view (375px), card not expanded
**Expected:**
- [ ] Button height: ≥48px
- [ ] Button width: full container width
- [ ] Padding: ≥12px horizontal, ≥12px vertical
- [ ] Clear spacing from other elements

**Actual Result:** _______________

---

### Test Case 5.3: Badge Tap Target (Mobile)
**Setup:** Mobile view (375px), "Next up" badge visible
**Expected:**
- [ ] Badge is visible and readable
- [ ] Badge does not interfere with header button
- [ ] Badge text is not truncated

**Actual Result:** _______________

---

### Test Case 5.4: Chevron Icon Tap Target (Mobile)
**Setup:** Mobile view (375px)
**Expected:**
- [ ] Chevron icon size: ≥24px
- [ ] Clickable area around chevron: ≥44px
- [ ] No overlap with other interactive elements

**Actual Result:** _______________

---

### Test Case 5.5: Vertical Spacing Between Cards (Mobile)
**Setup:** Mobile view (375px), multiple cards
**Expected:**
- [ ] Gap between cards: ≥16px
- [ ] No cards touching or overlapping
- [ ] Consistent spacing throughout

**Actual Result:** _______________

---

## 6. Dark Mode (If Applicable)

### Test Case 6.1: Card Background (Dark Mode)
**Setup:** Dark mode enabled
**Expected:**
- [ ] Card background: dark (not white)
- [ ] Border: visible and contrasting
- [ ] Text: light color, readable

**Actual Result:** _______________

---

### Test Case 6.2: Badge Styling (Dark Mode)
**Setup:** Dark mode enabled, "Next up" badge visible
**Expected:**
- [ ] Badge background: contrasting color
- [ ] Badge text: readable
- [ ] Badge border: visible

**Actual Result:** _______________

---

### Test Case 6.3: Hover States (Dark Mode)
**Setup:** Dark mode enabled, hover over header
**Expected:**
- [ ] Hover background: visible and contrasting
- [ ] Text: remains readable
- [ ] Transition: smooth

**Actual Result:** _______________

---

### Test Case 6.4: Active State (Dark Mode)
**Setup:** Dark mode enabled, card is active
**Expected:**
- [ ] Active background: soft-bronze (or adjusted for dark mode)
- [ ] Text: white or light color
- [ ] Contrast: WCAG AA compliant

**Actual Result:** _______________

---

## 7. Responsive Behavior

### Test Case 7.1: Desktop Layout (1920px)
**Setup:** Desktop view
**Expected:**
- [ ] "Start Training" button visible in header
- [ ] All metadata displayed inline
- [ ] No wrapping of text
- [ ] Proper spacing and alignment

**Actual Result:** _______________

---

### Test Case 7.2: Tablet Layout (768px)
**Setup:** Tablet view
**Expected:**
- [ ] "Start Training" button visible in header
- [ ] Metadata may wrap if needed
- [ ] All elements remain readable
- [ ] Proper spacing maintained

**Actual Result:** _______________

---

### Test Case 7.3: Mobile Layout (375px)
**Setup:** Mobile view
**Expected:**
- [ ] "Start Training" button moved below header
- [ ] Metadata stacked vertically
- [ ] All elements readable
- [ ] No horizontal scroll

**Actual Result:** _______________

---

### Test Case 7.4: Breakpoint Transitions
**Setup:** Resize from desktop to mobile
**Expected:**
- [ ] Layout transitions smoothly
- [ ] No content jumps or shifts
- [ ] All elements remain visible
- [ ] No broken layout at any width

**Actual Result:** _______________

---

## 8. Expanded State

### Test Case 8.1: Expand Card (Desktop)
**Setup:** Desktop view, click header
**Expected:**
- [ ] Card expands smoothly
- [ ] Chevron rotates 180°
- [ ] Content appears below header
- [ ] No layout shift

**Actual Result:** _______________

---

### Test Case 8.2: Collapse Card (Desktop)
**Setup:** Desktop view, expanded card, click header
**Expected:**
- [ ] Card collapses smoothly
- [ ] Chevron rotates back
- [ ] Content disappears
- [ ] No layout shift

**Actual Result:** _______________

---

### Test Case 8.3: Expand Card (Mobile)
**Setup:** Mobile view, click header
**Expected:**
- [ ] Card expands smoothly
- [ ] "Start Training" button disappears
- [ ] Content appears below header
- [ ] No horizontal scroll

**Actual Result:** _______________

---

## 9. Integration Across Pages

### Test Case 9.1: MyProgramPage - New System
**Setup:** Client with assigned workouts (new system)
**Expected:**
- [ ] Workout cards display with enhanced UI
- [ ] All optional fields render correctly
- [ ] "Next up" badge shows on recommended workout
- [ ] Completed workouts show green badge

**Actual Result:** _______________

---

### Test Case 9.2: WorkoutHistoryPage
**Setup:** View completed workouts
**Expected:**
- [ ] Completed workout cards display
- [ ] Optional fields render correctly
- [ ] No "Next up" badge (all completed)
- [ ] Green "Completed" badge visible

**Actual Result:** _______________

---

### Test Case 9.3: Trainer Dashboard - Program Preview
**Setup:** Trainer viewing program preview
**Expected:**
- [ ] Workout cards display with enhanced UI
- [ ] All optional fields visible
- [ ] Styling matches client view
- [ ] No trainer-specific UI breaks the layout

**Actual Result:** _______________

---

## 10. Accessibility

### Test Case 10.1: Keyboard Navigation
**Setup:** Use Tab key to navigate
**Expected:**
- [ ] All interactive elements are focusable
- [ ] Focus order is logical
- [ ] Focus indicator is visible
- [ ] No keyboard traps

**Actual Result:** _______________

---

### Test Case 10.2: Screen Reader (NVDA/JAWS)
**Setup:** Use screen reader to navigate
**Expected:**
- [ ] Card title announced correctly
- [ ] Badge text announced
- [ ] Button labels announced
- [ ] No duplicate announcements

**Actual Result:** _______________

---

### Test Case 10.3: Color Contrast
**Setup:** Check all text colors
**Expected:**
- [ ] All text meets WCAG AA (4.5:1 for normal text)
- [ ] Badges have sufficient contrast
- [ ] Hover states have sufficient contrast
- [ ] Active states have sufficient contrast

**Actual Result:** _______________

---

## 11. Performance

### Test Case 11.1: Page Load Time
**Setup:** Load MyProgramPage with 10+ workouts
**Expected:**
- [ ] Page loads in <2 seconds
- [ ] Cards render without jank
- [ ] Smooth scrolling

**Actual Result:** _______________

---

### Test Case 11.2: Expand/Collapse Animation
**Setup:** Expand and collapse multiple cards
**Expected:**
- [ ] Animation is smooth (60fps)
- [ ] No lag or stuttering
- [ ] Consistent animation speed

**Actual Result:** _______________

---

## 12. Cross-Browser Testing

### Test Case 12.1: Chrome
**Setup:** Test on Chrome (latest)
**Expected:**
- [ ] All features work correctly
- [ ] Styling renders as expected
- [ ] No console errors

**Actual Result:** _______________

---

### Test Case 12.2: Firefox
**Setup:** Test on Firefox (latest)
**Expected:**
- [ ] All features work correctly
- [ ] Styling renders as expected
- [ ] No console errors

**Actual Result:** _______________

---

### Test Case 12.3: Safari
**Setup:** Test on Safari (latest)
**Expected:**
- [ ] All features work correctly
- [ ] Styling renders as expected
- [ ] No console errors

**Actual Result:** _______________

---

### Test Case 12.4: Mobile Safari (iOS)
**Setup:** Test on iPhone Safari
**Expected:**
- [ ] All features work correctly
- [ ] Touch interactions work
- [ ] No layout issues

**Actual Result:** _______________

---

## Summary

**Total Test Cases:** 50+
**Passed:** _____ / _____
**Failed:** _____ / _____
**Blocked:** _____ / _____

**Overall Status:** ☐ PASS ☐ FAIL ☐ BLOCKED

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Tested By:** _________________ **Date:** _________________

**Sign-Off:** _________________ **Date:** _________________
