import type Anthropic from '@anthropic-ai/sdk';

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
    description: 'Adds an exercise to a routine. Include a YouTube video URL when you know a good instructional video for the exercise.',
    input_schema: {
      type: 'object' as const,
      properties: {
        routineId: { type: 'string', description: 'The ID of the routine to add this exercise to' },
        name: { type: 'string', description: 'Exercise name, e.g. "Barbell Bench Press"' },
        sets: { type: 'number', description: 'Number of sets, e.g. 4' },
        reps: { type: 'string', description: 'Rep target. Can be a number like "12", a range like "8-10", or "AMRAP"' },
        weight: { type: 'number', description: 'Suggested starting weight (optional)' },
        unit: { type: 'string', enum: ['lbs', 'kg', 'bodyweight'], description: 'Weight unit. Default: "lbs"' },
        restSeconds: { type: 'number', description: 'Rest period between sets in seconds, e.g. 90' },
        notes: { type: 'string', description: 'Form cues or coaching notes' },
        videoUrl: { type: 'string', description: 'YouTube URL for exercise demonstration/form video' },
      },
      required: ['routineId', 'name', 'sets', 'reps'],
    },
  },
  {
    name: 'update_exercise',
    description: 'Updates an existing exercise\'s properties. Only include fields you want to change.',
    input_schema: {
      type: 'object' as const,
      properties: {
        exerciseId: { type: 'string', description: 'The ID of the exercise to update' },
        name: { type: 'string', description: 'New exercise name' },
        sets: { type: 'number', description: 'New number of sets' },
        reps: { type: 'string', description: 'New rep target' },
        weight: { type: 'number', description: 'New weight' },
        unit: { type: 'string', enum: ['lbs', 'kg', 'bodyweight'], description: 'New weight unit' },
        restSeconds: { type: 'number', description: 'New rest period in seconds' },
        notes: { type: 'string', description: 'New coaching notes' },
        videoUrl: { type: 'string', description: 'New YouTube video URL' },
      },
      required: ['exerciseId'],
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
