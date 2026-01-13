# AI Program Description Generator - Implementation Guide

## Overview

This document provides a complete implementation guide for the AI Program Description Generator feature in the Trainer Hub. The feature enables trainers to automatically generate client-friendly program descriptions using AI.

---

## Feature Summary

### What's Implemented

✅ **Frontend Components**
- "Generate with AI" button next to Description field
- Button enabled only when Program Title, Duration, and Focus Area are filled
- Loading state with spinner during generation
- Replace prompt modal for existing descriptions
- Error handling with fallback descriptions
- Formatted, client-friendly descriptions (2-3 paragraphs)

✅ **Frontend Services**
- `ai-description-generator.ts` - AI description generation service
- `generateProgramDescription()` - Main generation function
- `generateFallbackDescription()` - Fallback for API failures
- `validateDescription()` - Description validation
- `formatDescription()` - Description formatting

✅ **User Experience**
- Non-blocking generation (doesn't auto-save)
- Replace prompt when description exists
- Clear error messages
- Fallback descriptions if API fails
- Editable textarea for manual adjustments

---

## Backend Implementation Required

### Endpoint: `/api/generate-program-description`

**Method:** POST

**Request Body:**
```json
{
  "programTitle": "12-Week Strength Building",
  "duration": "12 weeks",
  "focusArea": "Strength",
  "trainingStyle": "personalized and progressive",
  "clientGoals": "Strength",
  "additionalContext": ""
}
```

**Response:**
```json
{
  "description": "This 12-week program is designed to help you achieve your strength goals...\n\nThroughout this program...\n\nBy completing this program...",
  "paragraphCount": 3,
  "generatedAt": "2026-01-13T16:49:41.147Z",
  "success": true
}
```

**Error Response:**
```json
{
  "error": "Failed to generate description",
  "message": "API rate limit exceeded",
  "success": false
}
```

---

## Backend Implementation Steps

### Step 1: Create the Endpoint Handler

**File:** `/api/generate-program-description.ts` (or equivalent in your backend)

```typescript
import Anthropic from "@anthropic-ai/sdk";

interface DescriptionRequest {
  programTitle: string;
  duration: string;
  focusArea: string;
  trainingStyle?: string;
  clientGoals?: string;
  additionalContext?: string;
}

interface DescriptionResponse {
  description: string;
  paragraphCount: number;
  generatedAt: string;
  success: boolean;
}

export async function generateProgramDescription(
  req: DescriptionRequest
): Promise<DescriptionResponse> {
  try {
    // Validate input
    if (!req.programTitle?.trim()) {
      throw new Error("Program title is required");
    }
    if (!req.duration?.trim()) {
      throw new Error("Duration is required");
    }
    if (!req.focusArea?.trim()) {
      throw new Error("Focus area is required");
    }

    // Initialize Anthropic client
    const client = new Anthropic();

    // Build the prompt
    const prompt = buildDescriptionPrompt(req);

    // Call Claude API
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract text from response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    if (!responseText) {
      throw new Error("Empty response from AI");
    }

    // Parse and validate response
    const description = responseText.trim();
    const paragraphs = description
      .split("\n\n")
      .filter((p) => p.trim().length > 0);

    if (paragraphs.length < 2) {
      throw new Error("Generated description must have at least 2 paragraphs");
    }

    return {
      description,
      paragraphCount: paragraphs.length,
      generatedAt: new Date().toISOString(),
      success: true,
    };
  } catch (error) {
    console.error("Error generating description:", error);
    throw new Error(
      `Failed to generate description: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

function buildDescriptionPrompt(req: DescriptionRequest): string {
  return `You are a professional fitness coach writing program descriptions for clients.

Generate a 2-3 paragraph, client-friendly description for a fitness program with these details:

Program Title: ${req.programTitle}
Duration: ${req.duration}
Focus Area: ${req.focusArea}
Training Style: ${req.trainingStyle || "personalized and progressive"}
Client Goals: ${req.clientGoals || req.focusArea}
${req.additionalContext ? `Additional Context: ${req.additionalContext}` : ""}

Requirements:
- Write 2-3 paragraphs (separated by blank lines)
- Use client-friendly, motivational language
- Avoid technical jargon
- Focus on benefits and outcomes
- Be encouraging and supportive
- Mention the program duration and focus area
- Explain what the client can expect
- Emphasize support and guidance
- Do NOT include pricing or sales language
- Do NOT use markdown formatting
- Do NOT include bullet points

Write the description now:`;
}
```

### Step 2: Add Error Handling

```typescript
export async function handleDescriptionGenerationError(
  error: unknown
): Promise<{ error: string; message: string; success: false }> {
  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes("rate limit")) {
      return {
        error: "RateLimitError",
        message: "API rate limit exceeded. Please try again in a moment.",
        success: false,
      };
    }

    if (error.message.includes("authentication")) {
      return {
        error: "AuthenticationError",
        message: "Authentication failed. Please check API credentials.",
        success: false,
      };
    }

    if (error.message.includes("timeout")) {
      return {
        error: "TimeoutError",
        message: "Request timed out. Please try again.",
        success: false,
      };
    }

    return {
      error: "GenerationError",
      message: error.message,
      success: false,
    };
  }

  return {
    error: "UnknownError",
    message: "An unknown error occurred",
    success: false,
  };
}
```

### Step 3: Integrate with Your Backend Framework

**For Express.js:**

```typescript
import express from "express";
import { generateProgramDescription, handleDescriptionGenerationError } from "./generate-description";

const router = express.Router();

router.post("/api/generate-program-description", async (req, res) => {
  try {
    const result = await generateProgramDescription(req.body);
    res.json(result);
  } catch (error) {
    const errorResponse = await handleDescriptionGenerationError(error);
    res.status(400).json(errorResponse);
  }
});

export default router;
```

**For Wix Velo (Backend):**

```typescript
import { ok, badRequest } from "wix-http-functions";
import Anthropic from "@anthropic-ai/sdk";

export async function post_generateProgramDescription(request) {
  try {
    const body = request.body.json();

    // Validate input
    if (!body.programTitle?.trim()) {
      return badRequest({ error: "Program title is required" });
    }

    // Initialize Anthropic client
    const client = new Anthropic();

    // Build prompt
    const prompt = buildDescriptionPrompt(body);

    // Call Claude API
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    if (!responseText) {
      return badRequest({ error: "Empty response from AI" });
    }

    const description = responseText.trim();
    const paragraphs = description
      .split("\n\n")
      .filter((p) => p.trim().length > 0);

    if (paragraphs.length < 2) {
      return badRequest({
        error: "Generated description must have at least 2 paragraphs",
      });
    }

    return ok({
      description,
      paragraphCount: paragraphs.length,
      generatedAt: new Date().toISOString(),
      success: true,
    });
  } catch (error) {
    console.error("Error:", error);
    return badRequest({
      error: "Failed to generate description",
      message: error.message,
      success: false,
    });
  }
}

function buildDescriptionPrompt(req) {
  return `You are a professional fitness coach writing program descriptions for clients.

Generate a 2-3 paragraph, client-friendly description for a fitness program with these details:

Program Title: ${req.programTitle}
Duration: ${req.duration}
Focus Area: ${req.focusArea}
Training Style: ${req.trainingStyle || "personalized and progressive"}
Client Goals: ${req.clientGoals || req.focusArea}
${req.additionalContext ? `Additional Context: ${req.additionalContext}` : ""}

Requirements:
- Write 2-3 paragraphs (separated by blank lines)
- Use client-friendly, motivational language
- Avoid technical jargon
- Focus on benefits and outcomes
- Be encouraging and supportive
- Mention the program duration and focus area
- Explain what the client can expect
- Emphasize support and guidance
- Do NOT include pricing or sales language
- Do NOT use markdown formatting
- Do NOT include bullet points

Write the description now:`;
}
```

---

## Configuration

### Environment Variables

Add these to your `.env` file:

```
ANTHROPIC_API_KEY=your_api_key_here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### API Rate Limiting (Recommended)

Implement rate limiting to prevent abuse:

```typescript
import rateLimit from "express-rate-limit";

const descriptionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: "Too many description generation requests, please try again later.",
});

router.post(
  "/api/generate-program-description",
  descriptionLimiter,
  async (req, res) => {
    // ... handler code
  }
);
```

---

## Frontend Integration

### How It Works

1. **User clicks "Generate with AI" button**
   - Button is disabled until Program Title, Duration, and Focus Area are filled
   - Shows loading spinner during generation

2. **Frontend sends request to backend**
   ```typescript
   const response = await fetch('/api/generate-program-description', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       programTitle: formData.programName,
       duration: formData.duration,
       focusArea: formData.focusArea,
       trainingStyle: 'personalized and progressive',
       clientGoals: formData.focusArea,
     })
   });
   ```

3. **Backend generates description using Claude API**
   - Validates input
   - Builds context-aware prompt
   - Calls Claude API
   - Returns formatted description

4. **Frontend handles response**
   - If description exists: shows replace prompt
   - If no description: inserts directly into textarea
   - If error: shows fallback description

5. **User can edit or accept**
   - Description is NOT auto-saved
   - User can edit in textarea
   - Saves when clicking "Create Program"

---

## Testing

### Manual Testing Checklist

- [ ] Button is disabled when Program Title is empty
- [ ] Button is disabled when Duration is empty
- [ ] Button is disabled when Focus Area is empty
- [ ] Button is enabled when all three fields are filled
- [ ] Loading spinner shows during generation
- [ ] Description is inserted into textarea
- [ ] Replace prompt appears if description exists
- [ ] Replace prompt works correctly
- [ ] Keep existing description works
- [ ] Error message shows if generation fails
- [ ] Fallback description is used if API fails
- [ ] Description can be edited after generation
- [ ] Description is not auto-saved
- [ ] Program saves with generated description

### Example Test Cases

**Test 1: Generate description for new program**
```
1. Fill in Program Name: "12-Week Strength Building"
2. Fill in Duration: "12 weeks"
3. Select Focus Area: "Strength"
4. Click "Generate with AI"
5. Verify description is inserted into textarea
6. Verify description has 2-3 paragraphs
7. Verify description is client-friendly
```

**Test 2: Replace existing description**
```
1. Fill in all required fields
2. Manually enter a description
3. Click "Generate with AI"
4. Verify replace prompt appears
5. Click "Replace"
6. Verify new description replaces old one
```

**Test 3: Handle API failure gracefully**
```
1. Disable API or set invalid key
2. Click "Generate with AI"
3. Verify fallback description is used
4. Verify error message is shown
5. Verify user can still edit and save
```

---

## Troubleshooting

### Common Issues

**Issue: Button is disabled when it should be enabled**
- Check that all three fields (Title, Duration, Focus Area) have values
- Check that values are not just whitespace
- Check browser console for errors

**Issue: Generation takes too long**
- Check API rate limits
- Check network connectivity
- Check API key validity
- Increase timeout if needed

**Issue: Generated description is too short**
- Check that API response is valid
- Check that fallback is being used
- Verify prompt is being sent correctly

**Issue: Description has formatting issues**
- Check that description is being formatted correctly
- Verify paragraph breaks are preserved
- Check for extra whitespace

---

## Performance Optimization

### Caching (Optional)

Cache generated descriptions to reduce API calls:

```typescript
const descriptionCache = new Map<string, string>();

function getCacheKey(req: DescriptionRequest): string {
  return `${req.programTitle}|${req.duration}|${req.focusArea}`;
}

export async function generateProgramDescription(
  req: DescriptionRequest
): Promise<DescriptionResponse> {
  const cacheKey = getCacheKey(req);

  // Check cache
  if (descriptionCache.has(cacheKey)) {
    return {
      description: descriptionCache.get(cacheKey)!,
      paragraphCount: 3,
      generatedAt: new Date().toISOString(),
      success: true,
      cached: true,
    };
  }

  // Generate and cache
  const result = await generateWithAI(req);
  descriptionCache.set(cacheKey, result.description);
  return result;
}
```

---

## Security Considerations

### Input Validation

Always validate and sanitize input:

```typescript
function validateInput(req: DescriptionRequest): void {
  const maxLength = 500;

  if (req.programTitle.length > maxLength) {
    throw new Error("Program title is too long");
  }

  if (req.duration.length > maxLength) {
    throw new Error("Duration is too long");
  }

  // Check for injection attempts
  const dangerousPatterns = [
    /javascript:/i,
    /<script/i,
    /onclick/i,
    /onerror/i,
  ];

  for (const field of [
    req.programTitle,
    req.duration,
    req.focusArea,
  ]) {
    for (const pattern of dangerousPatterns) {
      if (pattern.test(field)) {
        throw new Error("Invalid input detected");
      }
    }
  }
}
```

### API Key Security

- Never expose API keys in frontend code
- Use environment variables
- Rotate keys regularly
- Monitor API usage

---

## Monitoring & Logging

### Log Generation Requests

```typescript
function logGenerationRequest(req: DescriptionRequest, success: boolean): void {
  console.log({
    timestamp: new Date().toISOString(),
    action: "generate_description",
    programTitle: req.programTitle,
    focusArea: req.focusArea,
    success,
  });
}
```

### Monitor API Usage

```typescript
let apiCallCount = 0;
let apiErrorCount = 0;

export async function generateProgramDescription(
  req: DescriptionRequest
): Promise<DescriptionResponse> {
  apiCallCount++;

  try {
    const result = await generateWithAI(req);
    logGenerationRequest(req, true);
    return result;
  } catch (error) {
    apiErrorCount++;
    logGenerationRequest(req, false);
    throw error;
  }
}
```

---

## Future Enhancements

### Potential Improvements

1. **Caching** - Cache generated descriptions to reduce API calls
2. **Customization** - Allow trainers to customize tone and style
3. **Templates** - Save and reuse description templates
4. **Batch Generation** - Generate descriptions for multiple programs
5. **A/B Testing** - Test different description styles
6. **Analytics** - Track which descriptions perform best
7. **Multi-language** - Generate descriptions in different languages
8. **Personalization** - Include client-specific details in descriptions

---

## Support & Troubleshooting

### Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Check the backend logs
3. Verify API key is valid
4. Check API rate limits
5. Verify network connectivity
6. Review this documentation

### Contact

For issues or questions, contact the development team.

---

**Last Updated:** January 2026
**Status:** ✅ Frontend Complete, ⚠️ Backend Implementation Required
**Next Steps:** Implement backend endpoint and test integration
