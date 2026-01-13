/**
 * AI Description Generator Service
 * Generates client-friendly program descriptions using AI
 * Features:
 * - Context-aware description generation
 * - 2-3 paragraph format
 * - Client-friendly language
 * - Error handling and fallback
 */

import { safeFetch, handleApiError } from './api-response-handler';

export interface DescriptionGeneratorInput {
  programTitle: string;
  duration: string;
  focusArea: string;
  trainingStyle?: string;
  clientGoals?: string;
  additionalContext?: string;
}

export interface GeneratedDescription {
  description: string;
  paragraphCount: number;
  generatedAt: string;
  success: boolean;
}

/**
 * Generate a program description using AI
 * @param input - Program details for description generation
 * @returns Generated description
 */
export async function generateProgramDescription(
  input: DescriptionGeneratorInput
): Promise<GeneratedDescription> {
  try {
    // Validate input
    if (!input.programTitle || input.programTitle.trim().length === 0) {
      throw new Error('Program title is required');
    }

    if (!input.duration || input.duration.trim().length === 0) {
      throw new Error('Program duration is required');
    }

    if (!input.focusArea || input.focusArea.trim().length === 0) {
      throw new Error('Focus area is required');
    }

    // Call backend API to generate description
    const response = await safeFetch<GeneratedDescription>(
      '/api/generate-program-description',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programTitle: input.programTitle.trim(),
          duration: input.duration.trim(),
          focusArea: input.focusArea.trim(),
          trainingStyle: input.trainingStyle?.trim() || '',
          clientGoals: input.clientGoals?.trim() || '',
          additionalContext: input.additionalContext?.trim() || '',
        }),
      },
      'Program description generation'
    );

    // Validate response
    if (!response.description || response.description.trim().length === 0) {
      throw new Error('Generated description is empty');
    }

    // Ensure description is 2-3 paragraphs
    const paragraphs = response.description
      .split('\n\n')
      .filter(p => p.trim().length > 0);

    if (paragraphs.length < 2) {
      throw new Error('Generated description must have at least 2 paragraphs');
    }

    return {
      description: response.description,
      paragraphCount: paragraphs.length,
      generatedAt: new Date().toISOString(),
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating program description:', error);
    throw new Error(`Failed to generate description: ${errorMessage}`);
  }
}

/**
 * Generate a fallback description if AI generation fails
 * Used as a graceful fallback
 * @param input - Program details
 * @returns Fallback description
 */
export function generateFallbackDescription(
  input: DescriptionGeneratorInput
): GeneratedDescription {
  const focusAreaLower = input.focusArea.toLowerCase();
  const durationLower = input.duration.toLowerCase();

  // Build a client-friendly fallback description
  let description = '';

  // First paragraph: Overview
  description += `This ${durationLower} program is designed to help you achieve your ${focusAreaLower} goals. `;
  description += `Through a structured and progressive approach, you'll build strength, confidence, and sustainable habits `;
  description += `that support your long-term fitness journey.\n\n`;

  // Second paragraph: What to expect
  description += `Throughout this program, you'll follow a carefully designed training plan tailored to your needs and experience level. `;
  description += `Each session is structured to maximize results while prioritizing proper form, recovery, and injury prevention. `;
  description += `You'll receive ongoing support and guidance to help you stay motivated and on track.\n\n`;

  // Third paragraph: Outcomes
  description += `By completing this program, you can expect to see improvements in your fitness, energy levels, and overall wellbeing. `;
  description += `Remember that consistency is key—commit to the process, and you'll be amazed at what you can achieve. `;
  description += `Your trainer is here to support you every step of the way.`;

  const paragraphs = description
    .split('\n\n')
    .filter(p => p.trim().length > 0);

  return {
    description,
    paragraphCount: paragraphs.length,
    generatedAt: new Date().toISOString(),
    success: false, // Indicates this is a fallback
  };
}

/**
 * Validate if a description is suitable
 * @param description - Description to validate
 * @returns Validation result
 */
export function validateDescription(description: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check minimum length
  if (description.trim().length < 100) {
    errors.push('Description must be at least 100 characters');
  }

  // Check paragraph count
  const paragraphs = description
    .split('\n\n')
    .filter(p => p.trim().length > 0);
  if (paragraphs.length < 2) {
    errors.push('Description must have at least 2 paragraphs');
  }

  // Check for client-friendly language
  const dangerousKeywords = ['extreme', 'dangerous', 'unsafe', 'risky'];
  const descLower = description.toLowerCase();
  for (const keyword of dangerousKeywords) {
    if (descLower.includes(keyword)) {
      errors.push(`Description contains potentially unsafe language: "${keyword}"`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format description for display
 * Ensures proper paragraph breaks and formatting
 * @param description - Raw description text
 * @returns Formatted description
 */
export function formatDescription(description: string): string {
  return description
    .split('\n\n')
    .filter(p => p.trim().length > 0)
    .join('\n\n')
    .trim();
}

export default {
  generateProgramDescription,
  generateFallbackDescription,
  validateDescription,
  formatDescription,
};
