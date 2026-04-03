import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { User, MapPin, Briefcase, Calendar, DollarSign, LogOut } from "lucide-react";
import { mockUser } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate } from "react-router";
import { useEffect } from "react";

export function Profile() {
  const user = mockUser;
  const { user: authUser, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authUser) {
      navigate("/");
    }
  }, [authUser, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!authUser) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4">
          <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* User Info Card */}
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {authUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{authUser.name}</h2>
              <p className="text-gray-600">{user.age} years old</p>
              <p className="text-sm text-gray-500 mt-1">{authUser.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-700 mb-3">
            <Briefcase className="h-4 w-4" />
            <span>{user.occupation}</span>
          </div>

          <p className="text-gray-700">{user.bio}</p>
        </Card>

        <Separator />

        {/* Preferences Card */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">{t('profile.settings')}</h3>

          <div className="space-y-4">
            {/* Budget */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">{t('search.price')}</span>
              </div>
              <p className="font-semibold">
                ${user.preferences.budget.min} - ${user.preferences.budget.max}/month
              </p>
            </div>

            {/* Move-in Date */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">{t('common.loading')}</span>
              </div>
              <p className="font-semibold">
                {new Date(user.preferences.moveInDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            {/* Preferred Cities */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Preferred Locations</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.preferences.preferredCities.map((city) => (
                  <Badge key={city} variant="secondary">
                    {city}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Lifestyle */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Lifestyle</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.preferences.lifestyle.map((trait) => (
                  <Badge key={trait} variant="outline">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full">
            Edit Profile
          </Button>
          <Button variant="outline" className="w-full">
            Edit Preferences
          </Button>
          <Button variant="outline" className="w-full">
            Settings
          </Button>
          <Button 
            variant="destructive" 
            className="w-full" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}