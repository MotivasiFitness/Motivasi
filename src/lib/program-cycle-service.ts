import { BaseCrudService } from '@/integrations';

export interface ProgramCycle {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  cycleId?: string;
  clientId?: string;
  trainerId?: string;
  cycleNumber?: number;
  cycleStartDate?: Date | string;
  cycleCompletedAt?: Date | string;
  currentWeek?: number;
  weeksCompleted?: number;
  status?: string;
  programTitle?: string;
}

/**
 * Get the active program cycle for a client
 */
export async function getActiveCycle(clientId: string): Promise<ProgramCycle | null> {
  try {
    const { items } = await BaseCrudService.getAll<ProgramCycle>('programcycles');
    const activeCycle = items.find(
      cycle => cycle.clientId === clientId && cycle.status === 'active'
    );
    return activeCycle || null;
  } catch (error) {
    console.error('Error fetching active cycle:', error);
    return null;
  }
}

/**
 * Get all cycles for a client (for history view)
 */
export async function getAllCycles(clientId: string): Promise<ProgramCycle[]> {
  try {
    const { items } = await BaseCrudService.getAll<ProgramCycle>('programcycles');
    return items
      .filter(cycle => cycle.clientId === clientId)
      .sort((a, b) => (b.cycleNumber || 0) - (a.cycleNumber || 0));
  } catch (error) {
    console.error('Error fetching all cycles:', error);
    return [];
  }
}

/**
 * Create a new program cycle for a client
 */
export async function createNewCycle(
  clientId: string,
  trainerId: string,
  programTitle: string
): Promise<ProgramCycle | null> {
  try {
    // Get existing cycles to determine the next cycle number
    const existingCycles = await getAllCycles(clientId);
    const nextCycleNumber = existingCycles.length > 0 
      ? Math.max(...existingCycles.map(c => c.cycleNumber || 0)) + 1 
      : 1;

    const newCycle: ProgramCycle = {
      _id: crypto.randomUUID(),
      cycleId: `cycle-${clientId}-${nextCycleNumber}`,
      clientId,
      trainerId,
      cycleNumber: nextCycleNumber,
      cycleStartDate: new Date().toISOString(),
      currentWeek: 1,
      weeksCompleted: 0,
      status: 'active',
      programTitle,
    };

    await BaseCrudService.create('programcycles', newCycle);
    return newCycle;
  } catch (error) {
    console.error('Error creating new cycle:', error);
    return null;
  }
}

/**
 * Mark a week as completed in the current cycle
 */
export async function completeWeek(
  cycleId: string,
  weekNumber: number
): Promise<boolean> {
  try {
    const cycle = await BaseCrudService.getById<ProgramCycle>('programcycles', cycleId);
    if (!cycle) return false;

    const weeksCompleted = (cycle.weeksCompleted || 0) + 1;
    const currentWeek = Math.min((cycle.currentWeek || 1) + 1, 4);
    
    // Check if cycle is complete (all 4 weeks done)
    const isCycleComplete = weeksCompleted >= 4;

    await BaseCrudService.update<ProgramCycle>('programcycles', {
      _id: cycleId,
      weeksCompleted,
      currentWeek: isCycleComplete ? 4 : currentWeek,
      status: isCycleComplete ? 'completed' : 'active',
      cycleCompletedAt: isCycleComplete ? new Date().toISOString() : undefined,
    });

    return true;
  } catch (error) {
    console.error('Error completing week:', error);
    return false;
  }
}

/**
 * Get completed week numbers as an array
 */
export function getCompletedWeeksArray(weeksCompleted: number): number[] {
  return Array.from({ length: weeksCompleted }, (_, i) => i + 1);
}

/**
 * Check if a cycle should be reset (all 4 weeks completed)
 */
export function shouldResetCycle(cycle: ProgramCycle): boolean {
  return (cycle.weeksCompleted || 0) >= 4;
}

/**
 * Archive a completed cycle and create a new one
 */
export async function archiveAndResetCycle(
  cycleId: string,
  clientId: string,
  trainerId: string,
  programTitle: string
): Promise<ProgramCycle | null> {
  try {
    // Archive the completed cycle
    await BaseCrudService.update<ProgramCycle>('programcycles', {
      _id: cycleId,
      status: 'archived',
    });

    // Create a new cycle
    const newCycle = await createNewCycle(clientId, trainerId, programTitle);
    return newCycle;
  } catch (error) {
    console.error('Error archiving and resetting cycle:', error);
    return null;
  }
}

/**
 * Get the week start date for a specific week in a cycle
 */
export function getWeekStartDateForCycle(
  cycleStartDate: Date | string,
  weekNumber: number
): Date {
  const startDate = typeof cycleStartDate === 'string' 
    ? new Date(cycleStartDate) 
    : cycleStartDate;
  
  const weekStart = new Date(startDate);
  weekStart.setDate(weekStart.getDate() + (weekNumber - 1) * 7);
  return weekStart;
}
