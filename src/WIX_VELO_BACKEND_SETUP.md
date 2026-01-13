# Wix Velo Backend Setup - Program Description Generator

## Overview

This document provides complete setup instructions for the Wix Velo HTTP function that generates program descriptions using OpenAI's API.

---

## File Structure

```
src/
├── wix-verticals/
│   └── backend/
│       └── generateProgramDescription.ts    ← Wix Velo HTTP function
└── lib/
    └── ai-description-generator.ts          ← Frontend service (updated)
```

---

## Backend Implementation

### File: `src/wix-verticals/backend/generateProgramDescription.ts`

This is a **Wix Velo HTTP function** that should be deployed to your Wix backend.

**Endpoint:** `POST /_functions/generateProgramDescription`
**Preview Endpoint:** `POST /_functions-dev/generateProgramDescription`

#### Key Features:
- ✅ Input validation (title required, max lengths enforced)
- ✅ OpenAI API integration (GPT-3.5-turbo)
- ✅ Prompt engineering for client-friendly descriptions
- ✅ Output validation (2-3 paragraphs, safety checks)
- ✅ Error handling with detailed messages
- ✅ JSON-only responses

---

## Setup Instructions

### Step 1: Create the Backend Function in Wix

1. **In Wix Editor:**
   - Go to **Develop** → **Backend**
   - Click **+ New** → **Web Module**
   - Name it: `generateProgramDescription.web.js`

2. **Copy the function code:**
   - Copy the entire content from `src/wix-verticals/backend/generateProgramDescription.ts`
   - Paste into the new Wix backend file
   - **Note:** Wix uses `.web.js` files, not TypeScript. You may need to convert the TypeScript to JavaScript or use Wix's TypeScript support.

### Step 2: Configure OpenAI API Key in Wix Secrets

1. **In Wix Editor:**
   - Go to **Develop** → **Secrets Manager**
   - Click **+ Add Secret**
   - **Name:** `openai-api-key`
   - **Value:** Your OpenAI API key (from https://platform.openai.com/api-keys)
   - Click **Save**

2. **Verify the secret is accessible:**
   - The function uses `getSecret('openai-api-key')`
   - Make sure the secret name matches exactly

### Step 3: Update Frontend Service

The frontend service (`src/lib/ai-description-generator.ts`) has been updated to:
- Call the Wix Velo endpoint instead of a custom backend
- Automatically detect Preview vs. Production environment
- Use `/_functions-dev/` for Preview
- Use `/_functions/` for Production

**No additional setup needed** - the frontend will automatically use the correct endpoint.

### Step 4: Test the Endpoint

#### Using Wix Editor:

1. Go to **Develop** → **Backend** → `generateProgramDescription.web.js`
2. Click **Test** (if available in your Wix version)
3. Send a POST request with this body:

```json
{
  "title": "12-Week Strength Building",
  "duration": "12 weeks",
  "focusArea": "Strength",
  "style": "personalized and progressive",
  "equipment": ["dumbbells", "barbell"],
  "level": "intermediate"
}
```

#### Using cURL:

```bash
# Preview environment
curl -X POST https://your-site.wixstudio.com/_functions-dev/generateProgramDescription \
  -H "Content-Type: application/json" \
  -d '{
    "title": "12-Week Strength Building",
    "duration": "12 weeks",
    "focusArea": "Strength"
  }'

# Production environment
curl -X POST https://your-site.com/_functions/generateProgramDescription \
  -H "Content-Type: application/json" \
  -d '{
    "title": "12-Week Strength Building",
    "duration": "12 weeks",
    "focusArea": "Strength"
  }'
```

#### Expected Response:

```json
{
  "success": true,
  "description": "This 12-week program is designed to help you achieve your strength goals..."
}
```

---

## Request/Response Format

### Request Body

```typescript
{
  "title": string,           // REQUIRED: Program title (max 500 chars)
  "duration": string,        // OPTIONAL: Program duration (e.g., "12 weeks")
  "focusArea": string,       // OPTIONAL: Focus area (e.g., "Strength")
  "style": string,           // OPTIONAL: Training style (default: "personalized and progressive")
  "equipment": string[],     // OPTIONAL: Equipment list (max 20 items)
  "level": string            // OPTIONAL: Level ("beginner", "intermediate", "advanced")
}
```

### Success Response

```typescript
{
  "success": true,
  "description": string      // Generated 2-3 paragraph description
}
```

### Error Response

```typescript
{
  "success": false,
  "error": string           // Error message explaining what went wrong
}
```

---

## Error Handling

The function handles various error scenarios:

| Error | Status | Message |
|-------|--------|---------|
| Missing title | 400 | "Title is required and must be a non-empty string" |
| Invalid JSON | 400 | "Invalid JSON in request body" |
| API key missing | 500 | "OpenAI API key not configured" |
| API rate limit | 500 | "OpenAI API error: Rate limit exceeded" |
| Invalid response | 500 | "Invalid response from OpenAI API" |
| Empty description | 400 | "Generated description is empty" |
| Too short | 400 | "Generated description must have at least 2 paragraphs" |

---

## Frontend Integration

### How the Frontend Calls the Endpoint

The frontend service (`ai-description-generator.ts`) automatically:

1. **Detects environment:**
   ```typescript
   const isPreview = window.location.hostname.includes('preview') || 
                    window.location.hostname.includes('localhost');
   ```

2. **Selects correct endpoint:**
   ```typescript
   const endpoint = isPreview ? '/_functions-dev/generateProgramDescription' 
                              : '/_functions/generateProgramDescription';
   ```

3. **Sends request:**
   ```typescript
   const response = await fetch(endpoint, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       title: input.programTitle,
       duration: input.duration,
       focusArea: input.focusArea,
       style: input.trainingStyle,
       equipment: input.equipment,
       level: input.level,
     }),
   });
   ```

4. **Handles response:**
   - Validates JSON
   - Checks `success` flag
   - Validates paragraph count
   - Returns formatted description

### Usage in Components

```typescript
import { generateProgramDescription, generateFallbackDescription } from '@/lib/ai-description-generator';

// In your component
const handleGenerateDescription = async () => {
  try {
    const result = await generateProgramDescription({
      programTitle: formData.programName,
      duration: formData.duration,
      focusArea: formData.focusArea,
      trainingStyle: 'personalized and progressive',
      equipment: ['dumbbells', 'barbell'],
      level: 'intermediate',
    });

    setFormData(prev => ({
      ...prev,
      description: result.description,
    }));
  } catch (error) {
    // Use fallback
    const fallback = generateFallbackDescription({
      programTitle: formData.programName,
      duration: formData.duration,
      focusArea: formData.focusArea,
    });
    setFormData(prev => ({
      ...prev,
      description: fallback.description,
    }));
  }
};
```

---

## Configuration

### OpenAI Model

The function uses **GPT-3.5-turbo** by default:

```typescript
model: 'gpt-3.5-turbo',
temperature: 0.7,
max_tokens: 500,
```

To change the model, edit the `callOpenAI` function:

```typescript
// Change to GPT-4 (more expensive but better quality)
model: 'gpt-4',

// Adjust temperature (0-2, higher = more creative)
temperature: 0.8,

// Adjust max tokens (higher = longer descriptions)
max_tokens: 800,
```

### API Rate Limiting

Wix Velo has built-in rate limiting. For high-traffic sites, consider:

1. **Caching descriptions** in the database
2. **Implementing client-side rate limiting** (max 1 request per 5 seconds)
3. **Using a queue system** for bulk generation

---

## Troubleshooting

### Issue: "OpenAI API key not configured"

**Solution:**
1. Go to **Develop** → **Secrets Manager**
2. Verify secret name is exactly: `openai-api-key`
3. Verify the API key is valid (test at https://platform.openai.com/account/api-keys)
4. Redeploy the site

### Issue: "Invalid response from OpenAI API"

**Solution:**
1. Check OpenAI API status: https://status.openai.com/
2. Verify API key has sufficient credits
3. Check API key permissions (should have "Chat Completions" access)

### Issue: "Generated description is empty"

**Solution:**
1. Check OpenAI API response format
2. Verify the prompt is being sent correctly
3. Try with a simpler title (no special characters)

### Issue: Endpoint returns 404

**Solution:**
1. Verify the function is deployed to Wix backend
2. Check the endpoint URL matches your site domain
3. For Preview: use `/_functions-dev/`
4. For Production: use `/_functions/`

### Issue: CORS errors

**Solution:**
- Wix Velo functions automatically handle CORS for same-origin requests
- If calling from a different domain, ensure CORS headers are configured in Wix

---

## Security Considerations

### API Key Security

✅ **What we do right:**
- API key stored in Wix Secrets Manager (encrypted)
- Key never exposed to frontend
- Key only used server-side

⚠️ **Best practices:**
- Rotate API key regularly
- Monitor API usage in OpenAI dashboard
- Set API key spending limits
- Use separate keys for dev/prod environments

### Input Validation

✅ **Implemented:**
- Title required and max 500 characters
- Duration max 200 characters
- Focus area max 200 characters
- Equipment array max 20 items
- Level must be one of: beginner, intermediate, advanced

### Output Validation

✅ **Implemented:**
- Minimum 100 characters
- Minimum 2 paragraphs
- No dangerous keywords (extreme, dangerous, unsafe, risky)
- No HTML or special formatting

---

## Monitoring & Logging

### View Logs in Wix

1. Go to **Develop** → **Backend**
2. Click on `generateProgramDescription.web.js`
3. Click **Logs** tab
4. View real-time function execution logs

### Log Entries

The function logs errors with context:

```
Error in generateProgramDescription: OpenAI API error: Rate limit exceeded
```

### Monitor API Usage

1. Go to https://platform.openai.com/account/usage/overview
2. Monitor API calls and costs
3. Set spending limits if needed

---

## Performance Optimization

### Response Time

- **Average:** 2-5 seconds (OpenAI API latency)
- **Max:** 30 seconds (function timeout)

### Optimization Tips

1. **Cache descriptions:**
   ```typescript
   // Store generated descriptions in database
   // Check cache before calling OpenAI
   ```

2. **Batch generation:**
   ```typescript
   // Generate multiple descriptions in one request
   // Reduce API calls
   ```

3. **Async processing:**
   ```typescript
   // Generate in background
   // Return immediately, notify user when ready
   ```

---

## Deployment Checklist

- [ ] Created backend function in Wix Editor
- [ ] Added OpenAI API key to Secrets Manager
- [ ] Tested endpoint with cURL or Postman
- [ ] Verified Preview environment works (`/_functions-dev/`)
- [ ] Verified Production environment works (`/_functions/`)
- [ ] Updated frontend service (already done)
- [ ] Tested "Generate with AI" button in CreateProgramPage
- [ ] Verified fallback description works if API fails
- [ ] Monitored API usage and costs
- [ ] Set up error logging/monitoring

---

## Next Steps

1. **Deploy the backend function** to Wix
2. **Configure OpenAI API key** in Secrets Manager
3. **Test the endpoint** with sample requests
4. **Monitor API usage** and costs
5. **Gather user feedback** on generated descriptions
6. **Optimize prompts** based on feedback
7. **Consider caching** for frequently generated descriptions

---

## Support & Resources

### OpenAI Documentation
- API Reference: https://platform.openai.com/docs/api-reference
- Models: https://platform.openai.com/docs/models
- Best Practices: https://platform.openai.com/docs/guides/production-best-practices

### Wix Velo Documentation
- HTTP Functions: https://www.wix.com/velo/reference/wix-http-functions
- Secrets Manager: https://www.wix.com/velo/reference/wix-secrets-backend
- Backend Modules: https://www.wix.com/velo/reference/wix-backend

### Troubleshooting
- OpenAI Status: https://status.openai.com/
- Wix Status: https://www.wix.com/en/status
- Community: https://www.wix.com/velo/forum

---

**Last Updated:** January 2026
**Status:** ✅ Complete - Ready for Deployment
