/**
 * AI Snippets Manager
 * Manages reusable training snippets (warm-ups, progressions, cues, finishers)
 * Allows trainers to build a personal library and share with team
 */

import { BaseCrudService } from '@/integrations';
import { TrainerAISnippets } from '@/entities';

export type SnippetType = 'warm-up' | 'progression' | 'coaching-cue' | 'finisher' | 'circuit' | 'cooldown' | 'mobility';
export type SnippetCategory = 'strength' | 'hypertrophy' | 'endurance' | 'mobility' | 'recovery' | 'general';

export interface AISnippet {
  _id: string;
  trainerId: string;
  snippetName: string;
  snippetType: SnippetType;
  content: string;
  category: SnippetCategory;
  usageCount: number;
  isShared: boolean;
  sharedWithTeamIds?: string[];
  tags: string[];
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SnippetLibrary {
  trainerId: string;
  totalSnippets: number;
  byType: Record<SnippetType, number>;
  byCategory: Record<SnippetCategory, number>;
  mostUsed: AISnippet[];
  recentlyAdded: AISnippet[];
}

/**
 * Create a new AI snippet
 */
export async function createSnippet(
  trainerId: string,
  snippet: Omit<AISnippet, '_id' | 'trainerId' | 'usageCount' | 'createdAt' | 'updatedAt'>
): Promise<AISnippet> {
  try {
    const newSnippet: TrainerAISnippets = {
      _id: crypto.randomUUID(),
      trainerId,
      snippetName: snippet.snippetName,
      snippetType: snippet.snippetType,
      content: snippet.content,
      category: snippet.category,
      usageCount: 0,
      isShared: snippet.isShared || false,
      sharedWithTeamIds: snippet.sharedWithTeamIds?.join(',') || '',
      tags: snippet.tags?.join(',') || '',
      description: snippet.description,
    };

    await BaseCrudService.create('traineraisnippets', newSnippet);

    return {
      ...newSnippet,
      sharedWithTeamIds: newSnippet.sharedWithTeamIds?.split(',').filter(Boolean),
      tags: newSnippet.tags?.split(',').filter(Boolean) || [],
      usageCount: newSnippet.usageCount || 0,
    };
  } catch (error) {
    console.error('Error creating snippet:', error);
    throw new Error('Failed to create snippet');
  }
}

/**
 * Get all snippets for a trainer
 */
export async function getTrainerSnippets(trainerId: string): Promise<AISnippet[]> {
  try {
    const { items } = await BaseCrudService.getAll<TrainerAISnippets>('traineraisnippets');
    return items
      .filter(s => s.trainerId === trainerId)
      .map(s => ({
        _id: s._id,
        trainerId: s.trainerId || '',
        snippetName: s.snippetName || '',
        snippetType: (s.snippetType || 'warm-up') as SnippetType,
        content: s.content || '',
        category: (s.category || 'general') as SnippetCategory,
        usageCount: s.usageCount || 0,
        isShared: s.isShared || false,
        sharedWithTeamIds: s.sharedWithTeamIds?.split(',').filter(Boolean),
        tags: s.tags?.split(',').filter(Boolean) || [],
        description: s.description || '',
      }));
  } catch (error) {
    console.error('Error fetching trainer snippets:', error);
    return [];
  }
}

/**
 * Get snippets by type
 */
export async function getSnippetsByType(
  trainerId: string,
  type: SnippetType
): Promise<AISnippet[]> {
  try {
    const snippets = await getTrainerSnippets(trainerId);
    return snippets.filter(s => s.snippetType === type);
  } catch (error) {
    console.error('Error fetching snippets by type:', error);
    return [];
  }
}

/**
 * Get snippets by category
 */
export async function getSnippetsByCategory(
  trainerId: string,
  category: SnippetCategory
): Promise<AISnippet[]> {
  try {
    const snippets = await getTrainerSnippets(trainerId);
    return snippets.filter(s => s.category === category);
  } catch (error) {
    console.error('Error fetching snippets by category:', error);
    return [];
  }
}

/**
 * Search snippets by tag
 */
export async function searchSnippetsByTag(
  trainerId: string,
  tag: string
): Promise<AISnippet[]> {
  try {
    const snippets = await getTrainerSnippets(trainerId);
    return snippets.filter(s => s.tags.includes(tag.toLowerCase()));
  } catch (error) {
    console.error('Error searching snippets:', error);
    return [];
  }
}

/**
 * Update snippet
 */
export async function updateSnippet(
  snippetId: string,
  updates: Partial<AISnippet>
): Promise<void> {
  try {
    const updateData: Partial<TrainerAISnippets> = {
      _id: snippetId,
      ...updates,
      sharedWithTeamIds: updates.sharedWithTeamIds?.join(','),
      tags: updates.tags?.join(','),
    };

    await BaseCrudService.update('traineraisnippets', updateData);
  } catch (error) {
    console.error('Error updating snippet:', error);
    throw new Error('Failed to update snippet');
  }
}

/**
 * Delete snippet
 */
export async function deleteSnippet(snippetId: string): Promise<void> {
  try {
    await BaseCrudService.delete('traineraisnippets', snippetId);
  } catch (error) {
    console.error('Error deleting snippet:', error);
    throw new Error('Failed to delete snippet');
  }
}

/**
 * Increment usage count
 */
export async function incrementUsageCount(snippetId: string): Promise<void> {
  try {
    const { items } = await BaseCrudService.getAll<TrainerAISnippets>('traineraisnippets');
    const snippet = items.find(s => s._id === snippetId);
    
    if (snippet) {
      await BaseCrudService.update('traineraisnippets', {
        _id: snippetId,
        usageCount: (snippet.usageCount || 0) + 1,
      });
    }
  } catch (error) {
    console.error('Error incrementing usage count:', error);
  }
}

/**
 * Share snippet with team
 */
export async function shareSnippetWithTeam(
  snippetId: string,
  teamIds: string[]
): Promise<void> {
  try {
    await BaseCrudService.update('traineraisnippets', {
      _id: snippetId,
      isShared: true,
      sharedWithTeamIds: teamIds.join(','),
    });
  } catch (error) {
    console.error('Error sharing snippet:', error);
    throw new Error('Failed to share snippet');
  }
}

/**
 * Get shared snippets (for team members)
 */
export async function getSharedSnippets(trainerId: string): Promise<AISnippet[]> {
  try {
    const { items } = await BaseCrudService.getAll<TrainerAISnippets>('traineraisnippets');
    return items
      .filter(s => {
        const sharedTeams = s.sharedWithTeamIds?.split(',').filter(Boolean) || [];
        return s.isShared && sharedTeams.includes(trainerId);
      })
      .map(s => ({
        _id: s._id,
        trainerId: s.trainerId || '',
        snippetName: s.snippetName || '',
        snippetType: (s.snippetType || 'warm-up') as SnippetType,
        content: s.content || '',
        category: (s.category || 'general') as SnippetCategory,
        usageCount: s.usageCount || 0,
        isShared: s.isShared || false,
        sharedWithTeamIds: s.sharedWithTeamIds?.split(',').filter(Boolean),
        tags: s.tags?.split(',').filter(Boolean) || [],
        description: s.description || '',
      }));
  } catch (error) {
    console.error('Error fetching shared snippets:', error);
    return [];
  }
}

/**
 * Get snippet library summary
 */
export async function getSnippetLibrarySummary(trainerId: string): Promise<SnippetLibrary> {
  try {
    const snippets = await getTrainerSnippets(trainerId);

    const byType: Record<SnippetType, number> = {
      'warm-up': 0,
      'progression': 0,
      'coaching-cue': 0,
      'finisher': 0,
      'circuit': 0,
      'cooldown': 0,
      'mobility': 0,
    };

    const byCategory: Record<SnippetCategory, number> = {
      'strength': 0,
      'hypertrophy': 0,
      'endurance': 0,
      'mobility': 0,
      'recovery': 0,
      'general': 0,
    };

    snippets.forEach(s => {
      byType[s.snippetType]++;
      byCategory[s.category]++;
    });

    const mostUsed = [...snippets].sort((a, b) => b.usageCount - a.usageCount).slice(0, 5);
    const recentlyAdded = [...snippets].reverse().slice(0, 5);

    return {
      trainerId,
      totalSnippets: snippets.length,
      byType,
      byCategory,
      mostUsed,
      recentlyAdded,
    };
  } catch (error) {
    console.error('Error getting library summary:', error);
    return {
      trainerId,
      totalSnippets: 0,
      byType: {
        'warm-up': 0,
        'progression': 0,
        'coaching-cue': 0,
        'finisher': 0,
        'circuit': 0,
        'cooldown': 0,
        'mobility': 0,
      },
      byCategory: {
        'strength': 0,
        'hypertrophy': 0,
        'endurance': 0,
        'mobility': 0,
        'recovery': 0,
        'general': 0,
      },
      mostUsed: [],
      recentlyAdded: [],
    };
  }
}

/**
 * Duplicate snippet (for creating variations)
 */
export async function duplicateSnippet(
  snippetId: string,
  trainerId: string,
  newName: string
): Promise<AISnippet> {
  try {
    const { items } = await BaseCrudService.getAll<TrainerAISnippets>('traineraisnippets');
    const original = items.find(s => s._id === snippetId);

    if (!original) {
      throw new Error('Snippet not found');
    }

    const duplicate: TrainerAISnippets = {
      _id: crypto.randomUUID(),
      trainerId,
      snippetName: newName,
      snippetType: original.snippetType,
      content: original.content,
      category: original.category,
      usageCount: 0,
      isShared: false,
      sharedWithTeamIds: '',
      tags: original.tags,
      description: `Copy of: ${original.description}`,
    };

    await BaseCrudService.create('traineraisnippets', duplicate);

    return {
      ...duplicate,
      sharedWithTeamIds: [],
      tags: duplicate.tags?.split(',').filter(Boolean) || [],
      usageCount: 0,
    };
  } catch (error) {
    console.error('Error duplicating snippet:', error);
    throw new Error('Failed to duplicate snippet');
  }
}

export default {
  createSnippet,
  getTrainerSnippets,
  getSnippetsByType,
  getSnippetsByCategory,
  searchSnippetsByTag,
  updateSnippet,
  deleteSnippet,
  incrementUsageCount,
  shareSnippetWithTeam,
  getSharedSnippets,
  getSnippetLibrarySummary,
  duplicateSnippet,
};
