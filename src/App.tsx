import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import PlansPage from './pages/PlansPage';
import PlanDetailPage from './pages/PlanDetailPage';
import ChatPage from './pages/ChatPage';
import WorkoutPage from './pages/WorkoutPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

function PlanLayout() {
  return (
    <div className="h-full">
      <Outlet />
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/workout">
      <Routes>
        <Route path="/" element={<PlansPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/plan/:id" element={<PlanLayout />}>
          <Route index element={<PlanDetailPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="workout" element={<WorkoutPage />} />
          <Route path="history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
