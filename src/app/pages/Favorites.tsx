import { useState } from "react";
import { useNavigate } from "react-router";
import { Heart } from "lucide-react";
import { PropertyCard } from "../components/PropertyCard";
import { mockProperties } from "../data/mockData";
import { useLanguage } from "../context/LanguageContext";

export function Favorites() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["1", "3"])); // Mock some favorites

  const favoriteProperties = mockProperties.filter(p => favorites.has(p.id));

  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4">
          <h1 className="text-2xl font-bold">{t('favorites.title')}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {favoriteProperties.length > 0 ? (
          <>
            <div className="mb-3 text-sm text-gray-600">
              {favoriteProperties.length} {t('property.favorite')}
            </div>
            <div className="grid gap-4">
              {favoriteProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onSelect={(id) => navigate(`/property/${id}`)}
                  isFavorite={true}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="font-semibold text-lg mb-2">{t('favorites.empty')}</h3>
            <p className="text-gray-600 text-sm max-w-sm">
              {t('favorites.emptyDesc')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
