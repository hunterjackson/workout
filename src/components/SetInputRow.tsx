import type { ExerciseType, LoggedMetrics } from '../lib/exercise-types';

interface SetInputRowProps {
  exerciseType: ExerciseType;
  metrics: LoggedMetrics;
  onMetricsChange: (metrics: LoggedMetrics) => void;
}

const inputClass = 'w-full min-w-0 bg-surface-light rounded-lg px-3 py-2 text-sm text-center outline-none focus:ring-2 focus:ring-primary';

function NumberInput({ value, onChange, placeholder }: { value: number; onChange: (v: number) => void; placeholder?: string }) {
  return (
    <input
      type="number"
      value={value || ''}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      placeholder={placeholder}
      className={inputClass}
    />
  );
}

export default function SetInputRow({ exerciseType, metrics, onMetricsChange }: SetInputRowProps) {
  const m = metrics as unknown as Record<string, unknown>;
  const update = (field: string, value: unknown) => {
    onMetricsChange({ ...metrics, [field]: value } as unknown as LoggedMetrics);
  };

  switch (exerciseType) {
    case 'weight_reps':
      return (
        <>
          <NumberInput value={m.reps as number} onChange={(v) => update('reps', v)} placeholder="Reps" />
          <NumberInput value={m.weight as number} onChange={(v) => update('weight', v)} placeholder="Weight" />
        </>
      );
    case 'bodyweight_reps':
      return (
        <NumberInput value={m.reps as number} onChange={(v) => update('reps', v)} placeholder="Reps" />
      );
    case 'duration':
      return (
        <NumberInput value={m.durationSeconds as number} onChange={(v) => update('durationSeconds', v)} placeholder="Seconds" />
      );
    case 'distance_time':
      return (
        <>
          <NumberInput value={m.distanceMeters as number} onChange={(v) => update('distanceMeters', v)} placeholder="Meters" />
          <NumberInput value={m.durationSeconds as number} onChange={(v) => update('durationSeconds', v)} placeholder="Seconds" />
        </>
      );
    case 'weight_duration':
      return (
        <>
          <NumberInput value={m.durationSeconds as number} onChange={(v) => update('durationSeconds', v)} placeholder="Seconds" />
          <NumberInput value={m.weight as number} onChange={(v) => update('weight', v)} placeholder="Weight" />
        </>
      );
    case 'weight_distance':
      return (
        <>
          <NumberInput value={m.distanceMeters as number} onChange={(v) => update('distanceMeters', v)} placeholder="Meters" />
          <NumberInput value={m.weight as number} onChange={(v) => update('weight', v)} placeholder="Weight" />
        </>
      );
    case 'calories_time':
      return (
        <>
          <NumberInput value={m.calories as number} onChange={(v) => update('calories', v)} placeholder="Cal" />
          <NumberInput value={m.durationSeconds as number} onChange={(v) => update('durationSeconds', v)} placeholder="Seconds" />
        </>
      );
    case 'reps_duration':
      return (
        <>
          <NumberInput value={m.reps as number} onChange={(v) => update('reps', v)} placeholder="Reps" />
          <NumberInput value={m.durationSeconds as number} onChange={(v) => update('durationSeconds', v)} placeholder="Seconds" />
        </>
      );
    case 'distance':
      return (
        <NumberInput value={m.distanceMeters as number} onChange={(v) => update('distanceMeters', v)} placeholder="Meters" />
      );
    case 'band_reps':
      return (
        <>
          <NumberInput value={m.reps as number} onChange={(v) => update('reps', v)} placeholder="Reps" />
          <span className="text-xs text-text-muted text-center self-center truncate">{m.bandColor as string}</span>
        </>
      );
    case 'rpe':
      return (
        <NumberInput value={m.rpe as number} onChange={(v) => update('rpe', v)} placeholder="RPE" />
      );
    case 'weight_reps_tempo':
      return (
        <>
          <NumberInput value={m.reps as number} onChange={(v) => update('reps', v)} placeholder="Reps" />
          <NumberInput value={m.weight as number} onChange={(v) => update('weight', v)} placeholder="Weight" />
        </>
      );
    case 'machine_reps':
      return (
        <>
          <NumberInput value={m.reps as number} onChange={(v) => update('reps', v)} placeholder="Reps" />
          <NumberInput value={m.machineLevel as number} onChange={(v) => update('machineLevel', v)} placeholder="Level" />
        </>
      );
    case 'height_reps':
      return (
        <>
          <NumberInput value={m.reps as number} onChange={(v) => update('reps', v)} placeholder="Reps" />
          <NumberInput value={m.heightCm as number} onChange={(v) => update('heightCm', v)} placeholder="cm" />
        </>
      );
  }
}
