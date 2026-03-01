import { useLocation, useNavigate, useParams } from 'react-router-dom';

const tabs = [
  { path: '', label: 'Plan', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { path: '/chat', label: 'Chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { path: '/workout', label: 'Workout', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { path: '/history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  if (!id) return null;

  const basePath = `/plan/${id}`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-surface-light flex justify-around items-center h-16 z-50 pb-[env(safe-area-inset-bottom)]">
      {tabs.map((tab) => {
        const fullPath = `${basePath}${tab.path}`;
        const isActive = tab.path === ''
          ? location.pathname === basePath || location.pathname === `${basePath}/`
          : location.pathname.startsWith(fullPath);

        return (
          <button
            key={tab.path}
            onClick={() => navigate(fullPath)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
              isActive ? 'text-primary' : 'text-text-muted'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
            </svg>
            <span className="text-xs">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
