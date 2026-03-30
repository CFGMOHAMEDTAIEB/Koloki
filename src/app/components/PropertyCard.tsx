import { Heart, MapPin, Users, Calendar } from "lucide-react";
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
}

export function PropertyCard({ 
  property, 
  onSelect, 
  isFavorite = false,
  onToggleFavorite 
}: PropertyCardProps) {
  const [favorite, setFavorite] = useState(isFavorite);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorite(!favorite);
    onToggleFavorite?.(property.id);
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onSelect(property.id)}
    >
      <div className="relative">
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
          ${property.price}/month
        </Badge>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold mb-2">{property.title}</h3>
        
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{property.city}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{property.housemates.current}/{property.housemates.total} housemates</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{new Date(property.availableFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {property.amenities.slice(0, 3).map((amenity) => (
            <Badge key={amenity} variant="secondary" className="text-xs">
              {amenity}
            </Badge>
          ))}
          {property.amenities.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{property.amenities.length - 3} more
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
