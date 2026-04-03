import { Home, Heart, User, MessageCircle, Clock } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: t('nav.home'), path: "/" },
    { icon: Heart, label: t('nav.favorites'), path: "/favorites" },
    ...(user ? [{ icon: MessageCircle, label: t('nav.messages'), path: "/messages" }] : []),
    ...(user ? [{ icon: Clock, label: t('nav.history'), path: "/history" }] : []),
    ...(user ? [{ icon: User, label: t('nav.profile'), path: "/profile" }] : []),
  ];

  return (
    <div className="bg-white border-t">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? "text-blue-600" : "text-gray-600"
              }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? "fill-blue-600" : ""}`} />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
