import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { nanoid } from 'nanoid';
import type { Plan } from '../lib/types';

export default function PlansPage() {
  const plans = useLiveQuery(() => db.plans.orderBy('updatedAt').reverse().toArray());
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const navigate = useNavigate();

  const createPlan = async () => {
    if (!name.trim()) return;
    const plan: Plan = {
      id: nanoid(),
      name: name.trim(),
      goal: goal.trim() || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.plans.add(plan);
    setName('');
    setGoal('');
    setShowCreate(false);
    navigate(`/plan/${plan.id}`);
  };

  return (
    <div className="min-h-full bg-bg p-4 pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Plans</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/settings')}
            className="w-10 h-10 rounded-full bg-surface flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {plans && plans.length === 0 && !showCreate && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">💪</div>
          <h2 className="text-xl font-semibold mb-2">No plans yet</h2>
          <p className="text-text-muted mb-6">Create your first workout plan and let AI help you build it</p>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-primary text-white px-6 py-3 rounded-xl font-medium"
          >
            Create Plan
          </button>
        </div>
      )}

      <div className="space-y-3">
        {plans?.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onClick={() => navigate(`/plan/${plan.id}`)} />
        ))}
      </div>

      {plans && plans.length > 0 && !showCreate && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg text-white text-2xl"
        >
          +
        </button>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-surface w-full rounded-t-2xl p-6 pb-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">New Plan</h2>
            <input
              type="text"
              placeholder="Plan name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-light rounded-xl px-4 py-3 mb-3 text-text placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <input
              type="text"
              placeholder="Goal (optional)"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-surface-light rounded-xl px-4 py-3 mb-4 text-text placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-3 rounded-xl border border-surface-light text-text-muted"
              >
                Cancel
              </button>
              <button
                onClick={createPlan}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlanCard({ plan, onClick }: { plan: Plan; onClick: () => void }) {
  const routineCount = useLiveQuery(
    () => db.routines.where('planId').equals(plan.id).count(),
    [plan.id]
  );

  return (
    <button
      onClick={onClick}
      className="w-full bg-surface rounded-xl p-4 text-left"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{plan.name}</h3>
          {plan.goal && <p className="text-text-muted text-sm mt-0.5">{plan.goal}</p>}
        </div>
        <svg className="w-5 h-5 text-text-muted mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
      <div className="flex gap-3 mt-2 text-xs text-text-muted">
        <span>{routineCount ?? 0} routines</span>
        <span>Updated {new Date(plan.updatedAt).toLocaleDateString()}</span>
      </div>
    </button>
  );
}
