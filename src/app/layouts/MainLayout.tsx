import { Outlet } from "react-router";
import { BottomNav } from "../components/BottomNav";

export function MainLayout() {
  return (
    <div className="h-screen flex flex-col max-w-md mx-auto bg-white shadow-lg">
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
