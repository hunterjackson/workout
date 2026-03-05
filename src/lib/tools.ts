import type Anthropic from '@anthropic-ai/sdk';
import { EXERCISE_TYPES } from './exercise-types';

export const tools: Anthropic.Tool[] = [
  {
    name: 'create_routine',
    description: 'Creates a new routine (workout day template) in the current plan. A routine is a collection of exercises that are done together.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Name of the routine, e.g. "Push Day A" or "Upper Body"' },
        schedule: {
          type: 'array',
          items: { type: 'number' },
          description: 'Days of the week this routine is scheduled. 0=Sunday, 1=Monday, ..., 6=Saturday. e.g. [1,3,5] for Mon/Wed/Fri',
        },
        notes: { type: 'string', description: 'Optional coaching notes for this routine' },
      },
      required: ['name', 'schedule'],
    },
  },
  {
    name: 'update_routine',
    description: 'Updates an existing routine\'s name, schedule, or notes.',
    input_schema: {
      type: 'object' as const,
      properties: {
        routineId: { type: 'string', description: 'The ID of the routine to update' },
        name: { type: 'string', description: 'New name for the routine' },
        schedule: {
          type: 'array',
          items: { type: 'number' },
          description: 'New schedule. 0=Sunday through 6=Saturday',
        },
        notes: { type: 'string', description: 'New coaching notes' },
      },
      required: ['routineId'],
    },
  },
  {
    name: 'delete_routine',
    description: 'Deletes a routine and all its exercises from the plan.',
    input_schema: {
      type: 'object' as const,
      properties: {
        routineId: { type: 'string', description: 'The ID of the routine to delete' },
      },
      required: ['routineId'],
    },
  },
  {
    name: 'add_exercise',
    description: `Adds an exercise to a routine. Set exerciseType to choose the kind of exercise. Available types: ${EXERCISE_TYPES.join(', ')}. Include metric fields appropriate for the chosen type.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        routineId: { type: 'string', description: 'The ID of the routine to add this exercise to' },
        name: { type: 'string', description: 'Exercise name, e.g. "Barbell Bench Press"' },
        sets: { type: 'number', description: 'Number of sets, e.g. 4' },
        exerciseType: {
          type: 'string',
          enum: [...EXERCISE_TYPES],
          description: 'Type of exercise. Determines which metric fields are used. Default: "weight_reps"',
        },
        reps: { type: 'string', description: 'Rep target. For weight_reps, bodyweight_reps, band_reps, machine_reps, reps_duration, weight_reps_tempo, height_reps. Can be "12", "8-10", or "AMRAP"' },
        weight: { type: 'number', description: 'Weight in lbs/kg. For weight_reps, weight_duration, weight_distance, weight_reps_tempo' },
        unit: { type: 'string', enum: ['lbs', 'kg'], description: 'Weight unit. Default: "lbs". For types with weight' },
        durationSeconds: { type: 'number', description: 'Duration in seconds. For duration, distance_time, weight_duration, calories_time, reps_duration, height_reps' },
        distanceMeters: { type: 'number', description: 'Distance in meters. For distance_time, weight_distance, distance' },
        calories: { type: 'number', description: 'Calorie target. For calories_time' },
        bandColor: { type: 'string', description: 'Band color/descriptor. Standard: yellow, red, green, blue, black, silver, gold. Free text also accepted. For band_reps' },
        rpe: { type: 'number', description: 'Rate of perceived exertion (1-10). For rpe' },
        tempo: { type: 'string', description: 'Tempo prescription e.g. "3-1-2-0" (eccentric-pause-concentric-pause). For weight_reps_tempo' },
        machineLevel: { type: 'number', description: 'Machine stack level/setting. For machine_reps' },
        heightCm: { type: 'number', description: 'Height in centimeters. For height_reps (box jumps, etc.)' },
        addedWeight: { type: 'number', description: 'Additional weight for bodyweight exercises. For bodyweight_reps' },
        restSeconds: { type: 'number', description: 'Rest period between sets in seconds, e.g. 90' },
        notes: { type: 'string', description: 'Form cues or coaching notes' },
        videoUrl: { type: 'string', description: 'YouTube URL for exercise demonstration/form video' },
      },
      required: ['routineId', 'name', 'sets'],
    },
  },
  {
    name: 'update_exercise',
    description: 'Updates an existing exercise\'s properties. Only include fields you want to change. To change exercise type, provide exerciseType and all required metrics for the new type.',
    input_schema: {
      type: 'object' as const,
      properties: {
        exerciseId: { type: 'string', description: 'The ID of the exercise to update' },
        name: { type: 'string', description: 'New exercise name' },
        sets: { type: 'number', description: 'New number of sets' },
        exerciseType: {
          type: 'string',
          enum: [...EXERCISE_TYPES],
          description: 'New exercise type',
        },
        reps: { type: 'string', description: 'New rep target' },
        weight: { type: 'number', description: 'New weight' },
        unit: { type: 'string', enum: ['lbs', 'kg'], description: 'New weight unit' },
        durationSeconds: { type: 'number', description: 'New duration in seconds' },
        distanceMeters: { type: 'number', description: 'New distance in meters' },
        calories: { type: 'number', description: 'New calorie target' },
        bandColor: { type: 'string', description: 'New band color' },
        rpe: { type: 'number', description: 'New RPE (1-10)' },
        tempo: { type: 'string', description: 'New tempo' },
        machineLevel: { type: 'number', description: 'New machine level' },
        heightCm: { type: 'number', description: 'New height in cm' },
        addedWeight: { type: 'number', description: 'New added weight for bodyweight exercises' },
        restSeconds: { type: 'number', description: 'New rest period in seconds' },
        notes: { type: 'string', description: 'New coaching notes' },
        videoUrl: { type: 'string', description: 'New YouTube video URL' },
      },
      required: ['exerciseId'],
    },
  },
  {
    name: 'update_plan_context',
    description: 'Updates the plan-level context with important facts to remember about the user, their goals, preferences, injuries, or anything else relevant to future conversations. This context persists across chat sessions and is always available to you. Use this proactively whenever you learn something important about the user. You should update (not replace) the context — merge new facts with existing ones.',
    input_schema: {
      type: 'object' as const,
      properties: {
        context: {
          type: 'string',
          description: 'The full updated context string. Merge new information with any existing context rather than replacing it entirely.',
        },
      },
      required: ['context'],
    },
  },
  {
    name: 'delete_exercise',
    description: 'Removes an exercise from its routine.',
    input_schema: {
      type: 'object' as const,
      properties: {
        exerciseId: { type: 'string', description: 'The ID of the exercise to delete' },
      },
      required: ['exerciseId'],
    },
  },
];
