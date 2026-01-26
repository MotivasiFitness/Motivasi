# Workout Card CMS Guidance for Coaches

## Overview
The enhanced workout card system displays session-level metadata (description, duration, exercise count) alongside individual exercises. This guide helps coaches use optional CMS fields effectively to create clear, engaging workout cards.

---

## Field Reference

### 1. **sessionDescription** (Optional Text Field)
**Purpose:** Brief, motivating description of the workout's focus and intensity

**Where it appears:**
- Client portal: Under "Training X" title in My Program page
- Workout history: Displayed in completed workout cards
- Trainer preview: Shows in program editor

**Recommended Format:**
- **Length:** 2-6 words (fits on mobile without wrapping)
- **Style:** Action-oriented, specific to focus area
- **Examples:**
  - "Lower Body Strength"
  - "Full Body + Core"
  - "Upper Body Power"
  - "Mobility & Recovery"
  - "Explosive Conditioning"

**Best Practices:**
- ✅ Use clear, familiar terms (clients understand "Lower Body" better than "Posterior Chain")
- ✅ Include intensity hint if relevant ("Power", "Strength", "Endurance", "Recovery")
- ✅ Keep it consistent across similar workouts
- ❌ Don't use jargon or overly technical names
- ❌ Don't exceed 6 words (will truncate on mobile)

**Fallback:** If not provided, the card shows only "Training X" with exercise count

---

### 2. **estimatedDuration** (Optional Text Field)
**Purpose:** Expected time to complete the workout

**Where it appears:**
- Client portal: Next to exercise count in My Program page
- Workout history: Displayed with week stats
- Trainer preview: Shows in program editor

**Recommended Format:**
- **Style:** Use tilde (~) for approximate times
- **Examples:**
  - "~20–30 min"
  - "~45 min"
  - "~60–75 min"
  - "~15 min"

**Best Practices:**
- ✅ Use ranges for realistic expectations (e.g., "~30–40 min" accounts for rest variation)
- ✅ Include the tilde (~) to signal it's approximate
- ✅ Use consistent formatting across all workouts
- ✅ Base on: (exercises × 3 min per exercise) + (sets × rest time) + 5 min buffer
- ❌ Don't use exact times (workouts vary by individual)
- ❌ Don't include "minutes" or "mins" (space-saving)

**Fallback:** If not provided, no duration is shown (clients see only exercise count)

---

### 3. **exerciseCountLabel** (Optional Text Field)
**Purpose:** Customized label for the number of exercises in the session

**Where it appears:**
- Client portal: Next to exercise count (e.g., "5 compound exercises")
- Workout history: Shows in week summaries
- Trainer preview: Visible in program editor

**Recommended Format:**
- **Default behavior:** If not set, the system auto-generates based on count:
  - 1 exercise → "focused movement"
  - 2–3 exercises → "focused movements"
  - 4–5 exercises → "compound exercises"
  - 6+ exercises → "comprehensive session"

**When to Customize:**
- Use defaults for most workouts (they're sensible and consistent)
- Customize only when you want to emphasize a specific quality:
  - "circuit training" (for timed rounds)
  - "strength focus" (for heavy compound lifts)
  - "mobility work" (for flexibility/recovery sessions)
  - "EMOM session" (for every-minute-on-the-minute format)

**Examples:**
- "5 compound exercises" (custom)
- "3 focused movements" (default for 3 exercises)
- "EMOM circuit" (custom for special format)

**Best Practices:**
- ✅ Leave blank for standard workouts (defaults are optimized)
- ✅ Customize only when the format is non-standard
- ✅ Keep custom labels short (2–3 words max)
- ❌ Don't override defaults for standard workouts (creates inconsistency)

---

## Complete Example: Setting Up a Workout

### Scenario: "Lower Body Strength" workout with 5 exercises, ~40 min

**CMS Fields to Fill:**
```
sessionDescription:    "Lower Body Strength"
estimatedDuration:     "~35–45 min"
exerciseCountLabel:    [Leave blank - defaults to "compound exercises"]
```

**How it displays:**
```
┌─────────────────────────────────────────┐
│ Training 1                        [Next up]
│ Lower Body Strength
│ 5 compound exercises • ⏱ ~35–45 min
└─────────────────────────────────────────┘
```

---

## QA Checklist for Coaches

Before assigning a program to clients, verify:

- [ ] **sessionDescription** is 2–6 words and clearly describes the focus
- [ ] **estimatedDuration** uses "~" format and realistic time range
- [ ] **exerciseCountLabel** is left blank unless the format is non-standard
- [ ] All three fields are consistent across similar workouts in the program
- [ ] Mobile preview shows no text wrapping or truncation
- [ ] "Next up" badge appears correctly on the recommended next workout
- [ ] Completed workouts show green checkmark badge
- [ ] Exercise counts match the actual number of exercises in the session

---

## Edge Cases & Fallbacks

### Missing Optional Fields
If coaches don't fill in optional fields, here's what clients see:

| Field | Missing | Fallback |
|-------|---------|----------|
| sessionDescription | Yes | Only "Training X" title shown |
| estimatedDuration | Yes | No duration displayed |
| exerciseCountLabel | Yes | Auto-generated label based on count |

**Example with all fields missing:**
```
┌─────────────────────────────────────────┐
│ Training 1
│ 5 focused movements
└─────────────────────────────────────────┘
```

### Long sessionDescription
If description exceeds 6 words, it may wrap on mobile. Examples:
- ❌ "Lower Body Strength and Power Development" (6 words, risky)
- ✅ "Lower Body Strength" (3 words, safe)

### Non-Standard Formats
For special workout formats, customize the label:
- EMOM (Every Minute on the Minute): `exerciseCountLabel = "EMOM circuit"`
- AMRAP (As Many Rounds As Possible): `exerciseCountLabel = "AMRAP session"`
- Superset blocks: `exerciseCountLabel = "superset pairs"`

---

## Mobile Responsiveness

The workout card is fully responsive:

**Desktop (1024px+):**
- Full layout with "Start Training" button visible
- All metadata displayed inline

**Tablet (768px–1023px):**
- Compact layout, "Start Training" button still visible
- Metadata wraps if needed

**Mobile (<768px):**
- Stacked layout
- "Start Training" button moves below header
- Metadata may wrap to multiple lines
- Badges remain visible

**Testing tip:** Use Chrome DevTools to test at 375px width (iPhone SE size)

---

## Dark Mode & Accessibility

The workout card system includes:
- ✅ Full dark mode support (if enabled)
- ✅ WCAG AA color contrast for all text
- ✅ Clear visual hierarchy with badges
- ✅ Keyboard navigation support
- ✅ Screen reader friendly labels

---

## Common Mistakes to Avoid

| Mistake | Impact | Fix |
|---------|--------|-----|
| sessionDescription too long | Text wraps on mobile, looks cluttered | Keep to 2–6 words |
| estimatedDuration without "~" | Looks like exact time | Add "~" prefix |
| Inconsistent duration format | Confuses clients | Use "~X–Y min" consistently |
| Overusing custom exerciseCountLabel | Breaks visual consistency | Use defaults for 80% of workouts |
| Missing all optional fields | Card looks bare | Fill at least sessionDescription |

---

## Integration with Trainer Dashboard

When creating programs in the trainer dashboard:

1. **Program Editor:** All optional fields are editable
2. **Program Preview:** Shows how the card will appear to clients
3. **Bulk Edit:** Update multiple workouts' metadata at once
4. **Templates:** Save programs with pre-filled metadata for reuse

---

## Questions & Support

For questions about these fields:
- Check the **Workout Card CMS Guidance** (this document)
- Review examples in the **Program Templates** section
- Contact support if fields aren't displaying correctly

---

## Version History

- **v1.0** (Jan 2026): Initial guidance for enhanced workout cards
  - sessionDescription, estimatedDuration, exerciseCountLabel
  - Mobile responsiveness & accessibility notes
  - QA checklist for coaches
