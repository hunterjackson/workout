export function describeProposedToolCall(
  name: string,
  input: Record<string, unknown>,
): string {
  switch (name) {
    case 'create_routine':
      return `Create routine "${input.name}"`;
    case 'update_routine':
      return input.name ? `Update routine "${input.name}"` : 'Update routine';
    case 'delete_routine':
      return 'Delete routine';
    case 'add_exercise': {
      const type = (input.exerciseType as string) || 'weight_reps';
      const detail = input.reps ? `${input.sets} x ${input.reps}` : `${input.sets} sets`;
      return `Add ${type} exercise "${input.name}" (${detail})`;
    }
    case 'update_exercise':
      return input.name ? `Update exercise "${input.name}"` : 'Update exercise';
    case 'delete_exercise':
      return 'Delete exercise';
    case 'update_plan_context':
      return 'Update plan context';
    default:
      return name;
  }
}
