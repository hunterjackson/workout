import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [unit, setUnit] = useState<'lbs' | 'kg'>('lbs');
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setApiKey(localStorage.getItem('anthropic_api_key') || '');
    setUnit((localStorage.getItem('preferred_unit') as 'lbs' | 'kg') || 'lbs');
  }, []);

  const save = () => {
    if (apiKey.trim()) {
      localStorage.setItem('anthropic_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('anthropic_api_key');
    }
    localStorage.setItem('preferred_unit', unit);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-full bg-bg p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-surface flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Anthropic API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full bg-surface rounded-xl px-4 py-3 text-text placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-text-muted mt-1">
            Your key stays on this device. Never sent anywhere except Anthropic's API.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Preferred Unit</label>
          <div className="flex gap-2">
            {(['lbs', 'kg'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  unit === u ? 'bg-primary text-white' : 'bg-surface text-text-muted'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={save}
          className="w-full py-3 rounded-xl bg-primary text-white font-medium"
        >
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
