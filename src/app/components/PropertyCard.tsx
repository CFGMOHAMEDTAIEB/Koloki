import { Heart, MapPin, Users, Calendar, MessageCircle, BookOpen, Star } from "lucide-react";
import { Property } from "../types";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useState } from "react";

interface PropertyCardProps {
  property: Property;
  onSelect: (id: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onMessage?: (propertyId: string) => void;
  onBook?: (propertyId: string) => void;
  onReview?: (propertyId: string) => void;
}

export function PropertyCard({ 
  property, 
  onSelect,
  isFavorite = false,
  onToggleFavorite,
  onMessage,
  onBook,
  onReview
}: PropertyCardProps) {
  const [favorite, setFavorite] = useState(isFavorite);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorite(!favorite);
    onToggleFavorite?.(property.id);
  };

  const handleAction = (e: React.MouseEvent, callback?: (id: string) => void) => {
    e.stopPropagation();
    callback?.(property.id);
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative cursor-pointer" onClick={() => onSelect(property.id)}>
        <img 
          src={property.image} 
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
          onClick={handleFavoriteClick}
        >
          <Heart 
            className={`h-5 w-5 ${favorite ? "fill-red-500 text-red-500" : "text-gray-600"}`}
          />
        </Button>
        <Badge className="absolute bottom-2 left-2 bg-white text-black">
          {property.price} TND/month
        </Badge>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold mb-2 cursor-pointer" onClick={() => onSelect(property.id)}>{property.title}</h3>
        
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{property.city}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{property.housemates.current}/{property.housemates.total}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{new Date(property.availableFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {property.amenities.slice(0, 3).map((amenity) => (
            <Badge key={amenity} variant="secondary" className="text-xs">
              {amenity}
            </Badge>
          ))}
          {property.amenities.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{property.amenities.length - 3}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => handleAction(e, onMessage)}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Message
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={(e) => handleAction(e, onBook)}
          >
            <BookOpen className="h-4 w-4 mr-1" />
            Book
          </Button>
        </div>
      </div>
    </Card>
  );
}
