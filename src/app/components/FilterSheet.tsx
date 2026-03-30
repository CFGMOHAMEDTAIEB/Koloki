import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export interface FilterOptions {
  city: string;
  priceRange: [number, number];
  amenities: string[];
  minRooms: number;
}

interface FilterSheetProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

const cities = ["All Cities", "New York", "San Francisco", "Boston", "Los Angeles", "Chicago", "Seattle"];
const amenitiesList = ["WiFi", "Gym", "Laundry", "Parking", "Pool", "Garden", "Workspace"];

export function FilterSheet({ filters, onFilterChange }: FilterSheetProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const defaultFilters: FilterOptions = {
      city: "All Cities",
      priceRange: [500, 2000],
      amenities: [],
      minRooms: 1,
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const toggleAmenity = (amenity: string) => {
    setLocalFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* City Filter */}
          <div>
            <Label>City</Label>
            <Select
              value={localFilters.city}
              onValueChange={(value) => setLocalFilters({ ...localFilters, city: value })}
            >
              <SelectTrigger className="w-full mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div>
            <Label>Price Range: ${localFilters.priceRange[0]} - ${localFilters.priceRange[1]}</Label>
            <Slider
              value={localFilters.priceRange}
              onValueChange={(value) => setLocalFilters({ ...localFilters, priceRange: value as [number, number] })}
              min={500}
              max={2000}
              step={50}
              className="mt-4"
            />
          </div>

          {/* Minimum Rooms */}
          <div>
            <Label>Available Rooms</Label>
            <Select
              value={localFilters.minRooms.toString()}
              onValueChange={(value) => setLocalFilters({ ...localFilters, minRooms: parseInt(value) })}
            >
              <SelectTrigger className="w-full mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amenities */}
          <div>
            <Label>Amenities</Label>
            <div className="space-y-3 mt-3">
              {amenitiesList.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={localFilters.amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <label
                    htmlFor={amenity}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Reset
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
