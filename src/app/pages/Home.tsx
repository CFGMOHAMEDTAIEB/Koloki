import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Search, LogIn, UserPlus } from "lucide-react";
import { PropertyCard } from "../components/PropertyCard";
import { FilterSheet, FilterOptions } from "../components/FilterSheet";
import { AuthDialog } from "../components/AuthDialog";
import { MessageModal } from "../components/MessageModal";
import { BookingModal } from "../components/BookingModal";
import { ReviewModal } from "../components/ReviewModal";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { mockProperties } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useNotification } from "../context/NotificationContext";

export function Home() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { t } = useLanguage();
  const { addNotification } = useNotification();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterOptions>({
    city: "All Cities",
    priceRange: [500, 2000],
    amenities: [],
    minRooms: 1,
  });

  const selectedProp = selectedProperty 
    ? mockProperties.find(p => p.id === selectedProperty) 
    : null;

  const filteredProperties = useMemo(() => {
    return mockProperties.filter((property) => {
      // Search query
      if (searchQuery && !property.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !property.city.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // City filter
      if (filters.city !== "All Cities" && property.city !== filters.city) {
        return false;
      }

      // Price range
      if (property.price < filters.priceRange[0] || property.price > filters.priceRange[1]) {
        return false;
      }

      // Available rooms
      if (property.availableRooms < filters.minRooms) {
        return false;
      }

      // Amenities
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(amenity =>
          property.amenities.includes(amenity)
        );
        if (!hasAllAmenities) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, filters]);

  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
        addNotification('info', 'Removed', 'Property removed from favorites');
      } else {
        newFavorites.add(id);
        addNotification('success', 'Added', 'Property added to favorites');
      }
      return newFavorites;
    });
  };

  const handleAuthSuccess = (userData: { name: string; email: string }) => {
    login(userData);
    addNotification('success', 'Welcome!', `Happy to see you, ${userData.name}!`);
  };

  const handleMessage = (propertyId: string) => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    setSelectedProperty(propertyId);
    setShowMessageModal(true);
  };

  const handleBook = (propertyId: string) => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    setSelectedProperty(propertyId);
    setShowBookingModal(true);
  };

  const handleSendMessage = (message: string) => {
    addNotification('success', 'Message Sent', 'Your message has been sent to the host');
    setShowMessageModal(false);
  };

  const handleCreateBooking = (booking: any) => {
    addNotification('success', 'Booking Created', 'Your booking contract is ready for signature');
    setShowBookingModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{t('header.subtitle')}</h1>
            {!user ? (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowAuthDialog(true)}>
                  <LogIn className="h-4 w-4 mr-1" />
                  {t('auth.login')}
                </Button>
                <Button size="sm" onClick={() => setShowAuthDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-1" />
                  {t('auth.signup')}
                </Button>
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                Welcome, {user.name}!
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <FilterSheet filters={filters} onFilterChange={setFilters} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-3 text-sm text-gray-600">
          {filteredProperties.length} {t('search.search').toLowerCase()}
        </div>
        <div className="grid gap-4">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={(id) => navigate(`/property/${id}`)}
              isFavorite={favorites.has(property.id)}
              onToggleFavorite={handleToggleFavorite}
              onMessage={handleMessage}
              onBook={handleBook}
            />
          ))}
        </div>
        {filteredProperties.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>{t('common.error')}</p>
            <p className="text-sm mt-2">{t('common.loading')}</p>
          </div>
        )}
      </div>

      <MessageModal
        open={showMessageModal}
        onOpenChange={setShowMessageModal}
        hostName={selectedProp?.contact.name || "Host"}
        propertyTitle={selectedProp?.title || "Property"}
        onSendMessage={handleSendMessage}
      />

      <BookingModal
        open={showBookingModal}
        onOpenChange={setShowBookingModal}
        propertyTitle={selectedProp?.title || "Property"}
        monthlyPrice={selectedProp?.price || 0}
        onBooking={handleCreateBooking}
      />

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}