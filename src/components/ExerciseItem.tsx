import type { Exercise } from '../lib/types';
import VideoLink from './VideoLink';

export default function ExerciseItem({ exercise }: { exercise: Exercise }) {
  const weightStr = exercise.unit === 'bodyweight'
    ? 'BW'
    : exercise.weight
      ? `${exercise.weight} ${exercise.unit}`
      : '';

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-bg/50 rounded-lg">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{exercise.name}</span>
          <VideoLink url={exercise.videoUrl} />
        </div>
        {exercise.notes && (
          <p className="text-xs text-text-muted truncate">{exercise.notes}</p>
        )}
      </div>
      <div className="text-xs text-text-muted ml-3 text-right whitespace-nowrap">
        <div>{exercise.sets} × {exercise.reps}</div>
        {weightStr && <div>{weightStr}</div>}
      </div>
    </div>
  );
}
