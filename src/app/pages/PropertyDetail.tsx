import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, MapPin, Users, Calendar, DollarSign, Home, Phone, Mail, User, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { mockProperties } from "../data/mockData";
import { MapView } from "../components/MapView";
import { PaymentDialog } from "../components/PaymentDialog";

export function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  const property = mockProperties.find((p) => p.id === id);

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-gray-600 mb-4">Property not found</p>
        <Button onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    );
  }

  const availableDate = new Date(property.availableFrom).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const handleBookViewing = () => {
    if (!selectedDay || !selectedTime) {
      alert("Please select a viewing date and time");
      return;
    }
    setShowPaymentDialog(true);
  };

  const selectedSchedule = property.availabilitySchedule.find(s => s.day === selectedDay);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Property Details</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Image */}
        <img 
          src={property.image} 
          alt={property.title}
          className="w-full h-64 object-cover"
        />

        <div className="p-4 space-y-4">
          {/* Title and Price */}
          <div>
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-2xl font-bold">{property.title}</h2>
              <Badge className="text-lg px-3 py-1">
                ${property.price}/mo
              </Badge>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.address}, {property.city}</span>
            </div>
          </div>

          {/* Map */}
          <div>
            <h3 className="font-semibold mb-3">Location</h3>
            <MapView 
              lat={property.location.lat} 
              lng={property.location.lng}
              title={property.title}
              city={property.city}
            />
            <p className="text-sm text-gray-600 mt-2">
              {property.address}, {property.city}
            </p>
          </div>

          <Separator />

          {/* Quick Info */}
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Bedrooms</p>
                  <p className="font-semibold">{property.bedrooms}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Housemates</p>
                  <p className="font-semibold">{property.housemates.current}/{property.housemates.total}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Available</p>
                  <p className="font-semibold text-sm">{availableDate.split(',')[0]}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Utilities</p>
                  <p className="font-semibold text-sm">{property.utilities}</p>
                </div>
              </div>
            </div>
          </Card>

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="font-semibold mb-3">Contact Information</h3>
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Owner</p>
                    <p className="font-semibold">{property.contact.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <a href={`tel:${property.contact.phone}`} className="font-semibold text-blue-600">
                      {property.contact.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a href={`mailto:${property.contact.email}`} className="font-semibold text-blue-600">
                      {property.contact.email}
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Separator />

          {/* Availability Schedule */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Schedule a Viewing
            </h3>
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <Label>Select Day</Label>
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Choose a day" />
                    </SelectTrigger>
                    <SelectContent>
                      {property.availabilitySchedule.map((schedule) => (
                        <SelectItem key={schedule.day} value={schedule.day}>
                          {schedule.day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedDay && selectedSchedule && (
                  <div>
                    <Label>Select Time</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Choose a time" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedSchedule.slots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <Separator />

          {/* Payment Options */}
          <div>
            <h3 className="font-semibold mb-3">Accepted Payment Methods</h3>
            <div className="flex flex-wrap gap-2">
              {property.paymentOptions.map((option) => (
                <Badge key={option} variant="outline" className="px-3 py-1">
                  {option}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">About This Place</h3>
            <p className="text-gray-700">{property.description}</p>
          </div>

          <Separator />

          {/* Amenities */}
          <div>
            <h3 className="font-semibold mb-3">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((amenity) => (
                <Badge key={amenity} variant="secondary">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* House Rules */}
          <div>
            <h3 className="font-semibold mb-3">House Rules</h3>
            <ul className="space-y-2">
              {property.rules.map((rule, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Rooms Available */}
          <div>
            <h3 className="font-semibold mb-2">Availability</h3>
            <p className="text-gray-700">
              {property.availableRooms} of {property.totalRooms} rooms available
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Move-in date: {availableDate}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="bg-white border-t p-4">
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleBookViewing}
          disabled={!selectedDay || !selectedTime}
        >
          Book Viewing & Pay
        </Button>
      </div>

      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        property={property}
        selectedDate={selectedDay}
        selectedTime={selectedTime}
      />
    </div>
  );
}