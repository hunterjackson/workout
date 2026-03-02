import { db } from './db';
import { nanoid } from 'nanoid';
import type { Routine, Exercise } from './types';

interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface MutationResult {
  toolUseId: string;
  toolName: string;
  success: boolean;
  result: string;
  description: string; // human-readable description of what happened
}

export async function handleToolCall(planId: string, toolCall: ToolCall): Promise<MutationResult> {
  try {
    switch (toolCall.name) {
      case 'create_routine': {
        const { name, schedule, notes } = toolCall.input as { name: string; schedule: number[]; notes?: string };
        const existing = await db.routines.where('planId').equals(planId).count();
        const routine: Routine = {
          id: nanoid(),
          planId,
          name,
          schedule: schedule || [],
          notes,
          order: existing,
          createdAt: Date.now(),
        };
        await db.routines.add(routine);
        await db.plans.update(planId, { updatedAt: Date.now() });
        return {
          toolUseId: toolCall.id,
          toolName: toolCall.name,
          success: true,
          result: JSON.stringify({ routineId: routine.id, name: routine.name }),
          description: `Created routine "${name}"`,
        };
      }

      case 'update_routine': {
        const { routineId, ...updates } = toolCall.input as { routineId: string; name?: string; schedule?: number[]; notes?: string };
        const existingRoutine = await db.routines.get(routineId);
        if (!existingRoutine) {
          return {
            toolUseId: toolCall.id,
            toolName: toolCall.name,
            success: false,
            result: `Routine not found: ${routineId}`,
            description: `Routine not found`,
          };
        }
        await db.routines.update(routineId, updates);
        await db.plans.update(planId, { updatedAt: Date.now() });
        return {
          toolUseId: toolCall.id,
          toolName: toolCall.name,
          success: true,
          result: JSON.stringify({ routineId, updated: Object.keys(updates) }),
          description: `Updated routine${updates.name ? ` "${updates.name}"` : ''}`,
        };
      }

      case 'delete_routine': {
        const { routineId } = toolCall.input as { routineId: string };
        const routine = await db.routines.get(routineId);
        await db.exercises.where('routineId').equals(routineId).delete();
        await db.routines.delete(routineId);
        await db.plans.update(planId, { updatedAt: Date.now() });
        return {
          toolUseId: toolCall.id,
          toolName: toolCall.name,
          success: true,
          result: JSON.stringify({ deleted: routineId }),
          description: `Deleted routine "${routine?.name || routineId}"`,
        };
      }

      case 'add_exercise': {
        const { routineId, name, sets, reps, weight, unit, restSeconds, notes, videoUrl } = toolCall.input as {
          routineId: string; name: string; sets: number; reps: string;
          weight?: number; unit?: string; restSeconds?: number; notes?: string; videoUrl?: string;
        };
        const existing = await db.exercises.where('routineId').equals(routineId).count();
        const exercise: Exercise = {
          id: nanoid(),
          routineId,
          name,
          sets,
          reps: String(reps),
          weight,
          unit: (unit as Exercise['unit']) || 'lbs',
          restSeconds,
          notes,
          videoUrl,
          order: existing,
        };
        await db.exercises.add(exercise);
        await db.plans.update(planId, { updatedAt: Date.now() });
        return {
          toolUseId: toolCall.id,
          toolName: toolCall.name,
          success: true,
          result: JSON.stringify({ exerciseId: exercise.id, name: exercise.name, routineId }),
          description: `Added "${name}" to routine`,
        };
      }

      case 'update_exercise': {
        const { exerciseId, ...updates } = toolCall.input as { exerciseId: string; [key: string]: unknown };
        const existingExercise = await db.exercises.get(exerciseId);
        if (!existingExercise) {
          return {
            toolUseId: toolCall.id,
            toolName: toolCall.name,
            success: false,
            result: `Exercise not found: ${exerciseId}`,
            description: `Exercise not found`,
          };
        }
        if (updates.reps !== undefined) updates.reps = String(updates.reps);
        await db.exercises.update(exerciseId, updates);
        await db.plans.update(planId, { updatedAt: Date.now() });
        return {
          toolUseId: toolCall.id,
          toolName: toolCall.name,
          success: true,
          result: JSON.stringify({ exerciseId, updated: Object.keys(updates) }),
          description: `Updated exercise${updates.name ? ` "${updates.name}"` : ''}`,
        };
      }

      case 'delete_exercise': {
        const { exerciseId } = toolCall.input as { exerciseId: string };
        const exercise = await db.exercises.get(exerciseId);
        await db.exercises.delete(exerciseId);
        await db.plans.update(planId, { updatedAt: Date.now() });
        return {
          toolUseId: toolCall.id,
          toolName: toolCall.name,
          success: true,
          result: JSON.stringify({ deleted: exerciseId }),
          description: `Deleted exercise "${exercise?.name || exerciseId}"`,
        };
      }

      default:
        return {
          toolUseId: toolCall.id,
          toolName: toolCall.name,
          success: false,
          result: `Unknown tool: ${toolCall.name}`,
          description: `Unknown tool: ${toolCall.name}`,
        };
    }
  } catch (error) {
    return {
      toolUseId: toolCall.id,
      toolName: toolCall.name,
      success: false,
      result: `Error: ${error instanceof Error ? error.message : String(error)}`,
      description: `Error executing ${toolCall.name}`,
    };
  }
}
