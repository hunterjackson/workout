import { useNavigate } from 'react-router-dom';

export default function BackButton({ to = '/' }: { to?: string }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      aria-label="Back"
      className="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    </button>
  );
}
