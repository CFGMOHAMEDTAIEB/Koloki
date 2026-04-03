import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Search, MapPin, Users, Star, LogIn, UserPlus, ArrowRight, Home as HomeIcon } from "lucide-react";
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
  const { t, language } = useLanguage();
  const { addNotification } = useNotification();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  
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
      if (searchQuery && !property.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !property.city.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      if (filters.city !== "All Cities" && property.city !== filters.city) {
        return false;
      }

      if (property.price < filters.priceRange[0] || property.price > filters.priceRange[1]) {
        return false;
      }

      if (property.availableRooms < filters.minRooms) {
        return false;
      }

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
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    
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

  const handleAuthSuccess = (userData: { name: string; email: string }) => {
    login(userData);
    addNotification('success', t('common.success'), `${t('home.welcome')}, ${userData.name}!`);
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
    addNotification('success', t('common.success'), 'Message sent to host');
    setShowMessageModal(false);
  };

  const handleCreateBooking = (booking: any) => {
    addNotification('success', t('common.success'), 'Booking created successfully');
    setShowBookingModal(false);
  };

  const topLocations = [
    { name: t('home.tunis'), count: 24, gradient: 'from-blue-500 to-blue-600' },
    { name: t('home.sousse'), count: 18, gradient: 'from-purple-500 to-purple-600' },
    { name: t('home.sfax'), count: 12, gradient: 'from-pink-500 to-pink-600' },
    { name: t('home.carthage'), count: 15, gradient: 'from-orange-500 to-orange-600' },
    { name: t('home.laMarsa'), count: 9, gradient: 'from-green-500 to-green-600' },
  ];

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      {/* Header Section - Improved Design */}
      <div className="sticky top-0 z-20 bg-white border-b">
        <div className="p-4 space-y-4">
          {/* Top Bar with Auth */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
                K
              </div>
              <h1 className="text-xl font-bold text-gray-900">{t('header.title')}</h1>
            </div>
            {!user ? (
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAuthDialog(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">{t('auth.login')}</span>
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setShowAuthDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">{t('auth.signup')}</span>
                </Button>
              </div>
            ) : (
              <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-lg">
                {user.name}
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilterSheet(true)}
              className="border-gray-200"
            >
              {t('search.filter')}
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section - Only show if not many search results or empty search */}
      {!searchQuery && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-center border-b">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('home.welcome')}</h2>
          <p className="text-sm text-gray-600 mb-4">{t('home.tagline')}</p>
          <p className="text-xs text-gray-500 max-w-md mx-auto">{t('home.description')}</p>
        </div>
      )}

      {/* Content Section */}
      <div className="flex-1 p-4 space-y-6">
        {/* Search Results */}
        {searchQuery ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {filteredProperties.length} {t('home.properties')}
              </h3>
            </div>
            
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isFavorite={favorites.has(property.id)}
                    onToggleFavorite={() => handleToggleFavorite(property.id)}
                    onMessage={() => handleMessage(property.id)}
                    onBook={() => handleBook(property.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <HomeIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">{t('home.noResults')}</p>
                <p className="text-gray-500 text-sm">{t('home.noResultsDesc')}</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Featured Properties */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{t('home.featured')}</h3>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  {t('home.viewAll')} <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {mockProperties.slice(0, 3).map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isFavorite={favorites.has(property.id)}
                    onToggleFavorite={() => handleToggleFavorite(property.id)}
                    onMessage={() => handleMessage(property.id)}
                    onBook={() => handleBook(property.id)}
                  />
                ))}
              </div>
            </div>

            {/* Popular Locations */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('home.topLocations')}</h3>
              <div className="grid grid-cols-2 gap-3">
                {topLocations.map((location) => (
                  <button
                    key={location.name}
                    onClick={() => setSearchQuery(location.name)}
                    className={`p-4 rounded-lg bg-gradient-to-br ${location.gradient} text-white text-center hover:shadow-lg transition-all`}
                  >
                    <div className="font-semibold text-sm">{location.name}</div>
                    <div className="text-xs opacity-90">{location.count} {t('home.properties')}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">500+</div>
                <div className="text-xs text-gray-600">{t('home.properties')}</div>
              </div>
              <div className="text-center border-l border-r border-gray-200">
                <div className="text-2xl font-bold text-blue-600">2K+</div>
                <div className="text-xs text-gray-600">{t('home.joined')}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                  <Star className="h-4 w-4 fill-blue-600" />
                  <span className="font-bold">4.8</span>
                </div>
                <div className="text-xs text-gray-600">{t('home.rating')}</div>
              </div>
            </div>

            {/* All Properties */}
            {mockProperties.length > 3 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('home.latestListings')}</h3>
                <div className="grid grid-cols-1 gap-4">
                  {mockProperties.slice(3).map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      isFavorite={favorites.has(property.id)}
                      onToggleFavorite={() => handleToggleFavorite(property.id)}
                      onMessage={() => handleMessage(property.id)}
                      onBook={() => handleBook(property.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onAuthSuccess={handleAuthSuccess}
      />
      <FilterSheet
        open={showFilterSheet}
        onOpenChange={setShowFilterSheet}
        filters={filters}
        onFiltersChange={setFilters}
      />
      {selectedProp && (
        <>
          <MessageModal
            open={showMessageModal}
            onOpenChange={setShowMessageModal}
            hostName={selectedProp.contact.name}
            propertyTitle={selectedProp.title}
            onSendMessage={handleSendMessage}
          />
          <BookingModal
            open={showBookingModal}
            onOpenChange={setShowBookingModal}
            propertyTitle={selectedProp.title}
            monthlyPrice={selectedProp.price}
            onBooking={handleCreateBooking}
          />
        </>
      )}
    </div>
  );
}