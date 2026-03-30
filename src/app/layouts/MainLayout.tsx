import { Outlet } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { LanguageSelector } from "../components/LanguageSelector";

export function MainLayout() {
  return (
    <div className="h-screen flex flex-col max-w-md mx-auto bg-white shadow-lg">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Koloki</h1>
        <LanguageSelector />
      </div>
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
