const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ScheduleBadges({ schedule }: { schedule: number[] }) {
  return (
    <div className="flex gap-1">
      {dayLabels.map((label, i) => (
        <span
          key={i}
          className={`text-xs px-1.5 py-0.5 rounded ${
            schedule.includes(i)
              ? 'bg-primary/20 text-primary'
              : 'bg-surface-light/50 text-text-muted/50'
          }`}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
