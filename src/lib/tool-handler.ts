import { db } from './db';
import { nanoid } from 'nanoid';
import type { Routine, Exercise } from './types';
import type { ExerciseType } from './exercise-types';
import { buildTemplateMetrics } from './build-metrics';

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
        const input = toolCall.input as Record<string, unknown>;
        const routineId = input.routineId as string;
        const name = input.name as string;
        const sets = input.sets as number;
        const exerciseType = (input.exerciseType as ExerciseType) || 'weight_reps';
        const restSeconds = input.restSeconds as number | undefined;
        const notes = input.notes as string | undefined;
        const videoUrl = input.videoUrl as string | undefined;

        const metrics = buildTemplateMetrics(exerciseType, input);
        const existing = await db.exercises.where('routineId').equals(routineId).count();
        const exercise: Exercise = {
          id: nanoid(),
          routineId,
          name,
          sets,
          exerciseType,
          metrics,
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
        const { exerciseId, ...input } = toolCall.input as { exerciseId: string; [key: string]: unknown };
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

        const updates: Record<string, unknown> = {};
        if (input.name !== undefined) updates.name = input.name;
        if (input.sets !== undefined) updates.sets = input.sets;
        if (input.restSeconds !== undefined) updates.restSeconds = input.restSeconds;
        if (input.notes !== undefined) updates.notes = input.notes;
        if (input.videoUrl !== undefined) updates.videoUrl = input.videoUrl;

        // If exerciseType is changing, rebuild metrics entirely
        if (input.exerciseType !== undefined) {
          updates.exerciseType = input.exerciseType;
          updates.metrics = buildTemplateMetrics(input.exerciseType as ExerciseType, input);
        } else {
          // Update individual metric fields on the existing metrics
          const hasMetricField = ['reps', 'weight', 'unit', 'durationSeconds', 'distanceMeters',
            'calories', 'bandColor', 'rpe', 'tempo', 'machineLevel', 'heightCm', 'addedWeight']
            .some(f => input[f] !== undefined);
          if (hasMetricField) {
            const merged = { ...(existingExercise.metrics as unknown as Record<string, unknown>), ...input };
            updates.metrics = buildTemplateMetrics(existingExercise.exerciseType, merged);
          }
        }

        await db.exercises.update(exerciseId, updates);
        await db.plans.update(planId, { updatedAt: Date.now() });
        return {
          toolUseId: toolCall.id,
          toolName: toolCall.name,
          success: true,
          result: JSON.stringify({ exerciseId, updated: Object.keys(updates) }),
          description: `Updated exercise${input.name ? ` "${input.name}"` : ''}`,
        };
      }

      case 'update_plan_context': {
        const { context } = toolCall.input as { context: string };
        await db.plans.update(planId, { context, updatedAt: Date.now() });
        return {
          toolUseId: toolCall.id,
          toolName: toolCall.name,
          success: true,
          result: JSON.stringify({ planId, contextUpdated: true }),
          description: 'Updated plan context',
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
