import { Outlet } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { LanguageSelector } from "../components/LanguageSelector";
import { NotificationBell } from "../components/NotificationBell";
import { useAuth } from "../context/AuthContext";

export function MainLayout() {
  const { user } = useAuth();

  return (
    <div className="h-screen flex flex-col max-w-md mx-auto bg-white shadow-lg">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Koloki</h1>
        <div className="flex items-center gap-2">
          {/* Show notifications only for authenticated users */}
          {user && <NotificationBell />}
          <LanguageSelector />
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
