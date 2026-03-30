import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Check, Download } from "lucide-react";
import { Property } from "../types";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property;
  selectedDate?: string;
  selectedTime?: string;
}

export function PaymentDialog({
  open,
  onOpenChange,
  property,
  selectedDate,
  selectedTime,
}: PaymentDialogProps) {
  const [selectedPayment, setSelectedPayment] = useState(property.paymentOptions[0]);
  const [showReceipt, setShowReceipt] = useState(false);

  const handlePayment = () => {
    setShowReceipt(true);
  };

  const handleDownloadReceipt = () => {
    // In a real app, this would generate and download a PDF
    alert("Receipt downloaded!");
  };

  const transactionId = `TRX-${Date.now().toString(36).toUpperCase()}`;
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (showReceipt) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>

          <Card className="p-6 bg-gray-50">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg">Payment Successful!</h3>
            </div>

            <Separator className="my-4" />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID</span>
                <span className="font-semibold">{transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time</span>
                <span className="font-semibold">{currentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Property</span>
                <span className="font-semibold">{property.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location</span>
                <span className="font-semibold">{property.city}</span>
              </div>
              {selectedDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Visit Date</span>
                  <span className="font-semibold">{selectedDate}</span>
                </div>
              )}
              {selectedTime && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Visit Time</span>
                  <span className="font-semibold">{selectedTime}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-semibold">{selectedPayment}</span>
              </div>
              
              <Separator className="my-3" />
              
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Booking Fee</span>
                <span className="font-bold">${property.price}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-center text-blue-800">
              Contact: {property.contact.name} - {property.contact.phone}
            </div>
          </Card>

          <div className="space-y-2">
            <Button onClick={handleDownloadReceipt} className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
            <Button
              onClick={() => {
                setShowReceipt(false);
                onOpenChange(false);
              }}
              className="w-full"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Booking</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="p-4 bg-gray-50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Property</span>
                <span className="font-semibold">{property.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Rent</span>
                <span className="font-semibold">${property.price}</span>
              </div>
              {selectedDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Visit Scheduled</span>
                  <span className="font-semibold">
                    {selectedDate} at {selectedTime}
                  </span>
                </div>
              )}
            </div>
          </Card>

          <div>
            <Label className="mb-3 block">Select Payment Method</Label>
            <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
              {property.paymentOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
            <p className="text-yellow-800">
              <strong>Note:</strong> This booking fee secures your viewing appointment. The
              amount will be applied to your first month's rent upon move-in.
            </p>
          </div>

          <Button onClick={handlePayment} className="w-full" size="lg">
            Pay ${property.price}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
