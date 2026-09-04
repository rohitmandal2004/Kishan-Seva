import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, addDays, isSameDay } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, CheckCircle2, ChevronLeft, Info } from 'lucide-react';
import { MockAuthService } from '@/services/mockAuth.service';

export default function SlotBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedCentreId = searchParams.get('centre');
  
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('');
  const [crop, setCrop] = useState('');
  
  const profile = MockAuthService.getFarmerProfile();

  // Generate next 7 days
  const availableDates = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i + 1));
  
  // Mock Slots
  const slots = [
    { id: 'slot-1', time: '09:00 AM - 10:00 AM', status: 'AVAILABLE', capacity: 20, booked: 5 },
    { id: 'slot-2', time: '10:00 AM - 11:00 AM', status: 'FAST_FILLING', capacity: 20, booked: 18 },
    { id: 'slot-3', time: '11:00 AM - 12:00 PM', status: 'FULL', capacity: 20, booked: 20 },
    { id: 'slot-4', time: '01:00 PM - 02:00 PM', status: 'AVAILABLE', capacity: 20, booked: 2 },
    { id: 'slot-5', time: '02:00 PM - 03:00 PM', status: 'AVAILABLE', capacity: 20, booked: 0 },
  ];

  const handleConfirm = () => {
    // Navigate to success state or queue page
    navigate('/farmer/queue');
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto w-full pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm border hover:bg-slate-50 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Book Procurement Slot</h1>
          <p className="text-sm text-slate-500">Select when and what you want to sell.</p>
        </div>
      </div>

      {step === 1 ? (
        <div className="space-y-6">
          <Card className="p-5 shadow-sm border-0">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-700" />
              Selected Centre
            </h3>
            <div className="p-4 bg-slate-50 border rounded-xl">
              <p className="font-bold text-slate-800">Krishnapur Procurement Centre</p>
              <p className="text-sm text-slate-500">NH-12, Krishnapur, WB</p>
              <Button variant="link" className="h-auto p-0 mt-2 text-green-700" onClick={() => navigate('/farmer/centres')}>
                Change Centre
              </Button>
            </div>
          </Card>

          <Card className="p-5 shadow-sm border-0">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-green-700" />
              Crop Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crop">Select Crop</Label>
                <Select value={crop} onValueChange={setCrop}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose registered crop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paddy">Paddy (Dhan)</SelectItem>
                    <SelectItem value="wheat">Wheat (Gehu)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Est. Quantity (Quintals)</Label>
                <Input 
                  id="quantity" 
                  type="number" 
                  placeholder="e.g. 15" 
                  value={quantity} 
                  onChange={e => setQuantity(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
          </Card>

          <Card className="p-5 shadow-sm border-0">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-700" />
              Select Date
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 md:mx-0 md:px-0 scrollbar-hide">
              {availableDates.map((date, i) => {
                const isSelected = selectedDate && isSameDay(selectedDate, date);
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 min-w-[70px] shrink-0 transition-colors ${
                      isSelected 
                        ? 'border-green-700 bg-green-50 text-green-700' 
                        : 'border-slate-200 bg-white hover:border-green-300 text-slate-600'
                    }`}
                  >
                    <span className="text-xs uppercase font-medium">{format(date, 'MMM')}</span>
                    <span className="text-2xl font-bold">{format(date, 'dd')}</span>
                    <span className="text-[10px] font-medium uppercase">{format(date, 'EEE')}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          {selectedDate && (
            <Card className="p-5 shadow-sm border-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-700" />
                Select Time Slot
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {slots.map((slot) => {
                  const isSelected = selectedSlot === slot.id;
                  const isFull = slot.status === 'FULL';
                  
                  return (
                    <button
                      key={slot.id}
                      disabled={isFull}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`relative flex items-center justify-between p-4 rounded-xl border-2 text-left transition-colors ${
                        isFull ? 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed' :
                        isSelected ? 'border-green-700 bg-green-50' : 'border-slate-200 bg-white hover:border-green-300'
                      }`}
                    >
                      <div>
                        <p className={`font-bold ${isFull ? 'text-slate-500' : 'text-slate-900'}`}>{slot.time}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {slot.status === 'AVAILABLE' && <span className="text-green-600">Available</span>}
                          {slot.status === 'FAST_FILLING' && <span className="text-orange-500">Fast Filling ({slot.capacity - slot.booked} left)</span>}
                          {slot.status === 'FULL' && <span className="text-red-500">Fully Booked</span>}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-700">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          <div className="pt-4 pb-8">
            <Button 
              className="w-full h-14 text-lg bg-green-700 hover:bg-green-800 rounded-xl"
              disabled={!selectedDate || !selectedSlot || !crop || !quantity}
              onClick={() => setStep(2)}
            >
              Review & Book Slot
            </Button>
          </div>
        </div>
      ) : (
        /* Confirmation Step */
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <Card className="p-6 shadow-sm border-0 bg-white text-center">
            <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Confirm Booking</h2>
            <p className="text-slate-500">Please review your slot details before confirming.</p>
            
            <div className="mt-8 bg-slate-50 rounded-xl p-4 text-left space-y-4">
              <div className="flex justify-between pb-4 border-b border-slate-200">
                <span className="text-slate-500">Farmer</span>
                <span className="font-bold text-slate-900">{profile?.full_name || 'Kishan User'}</span>
              </div>
              <div className="flex justify-between pb-4 border-b border-slate-200">
                <span className="text-slate-500">Centre</span>
                <span className="font-bold text-slate-900 text-right">Krishnapur Procurement Centre</span>
              </div>
              <div className="flex justify-between pb-4 border-b border-slate-200">
                <span className="text-slate-500">Date & Time</span>
                <span className="font-bold text-slate-900 text-right">
                  {selectedDate && format(selectedDate, 'dd MMM yyyy')}<br/>
                  {slots.find(s => s.id === selectedSlot)?.time}
                </span>
              </div>
              <div className="flex justify-between pb-4 border-b border-slate-200">
                <span className="text-slate-500">Crop to sell</span>
                <span className="font-bold text-slate-900 text-right uppercase">{crop}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-slate-500">Quantity (Est.)</span>
                <span className="font-bold text-slate-900 text-right">{quantity} Quintals</span>
              </div>
            </div>

            <div className="flex items-start gap-3 mt-6 p-4 bg-blue-50 text-blue-800 text-sm rounded-lg text-left">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <p>Bring your Aadhaar Card and Land Record documents on the day of procurement. Quality checks will be performed at the centre.</p>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex-1 h-14 text-lg"
              onClick={() => setStep(1)}
            >
              Back
            </Button>
            <Button 
              className="flex-[2] h-14 text-lg bg-green-700 hover:bg-green-800 rounded-xl"
              onClick={handleConfirm}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Quick component patch for the missing Sprout icon above (just alias Leaf)
import { Leaf as Sprout } from 'lucide-react';
