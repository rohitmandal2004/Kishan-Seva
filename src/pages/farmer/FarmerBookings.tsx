import { useState } from 'react';
import { useSupabase } from '@/context/SupabaseContext';
import { useMockStore } from '@/services/useMockStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarClock, MapPin, Ticket, Sprout, ArrowRight, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FarmerBookings() {
  const { farmer, user } = useSupabase();
  const store = useMockStore();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  
  const allBookings = store.getFarmerBookingsForFarmer(farmer, user?.email, user?.id);

  const activeBookings = allBookings.filter(b => !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.status));
  const completedBookings = allBookings.filter(b => ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.status));

  const displayBookings = filter === 'ALL' ? allBookings : (filter === 'ACTIVE' ? activeBookings : completedBookings);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto w-full pb-24 md:pb-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage your procurement slots and view history</p>
        </div>
        <div className="flex gap-2">
          <Link to="/farmer/book">
            <Button className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold gap-2 rounded-xl h-10 shadow-sm">
              <CalendarClock className="w-4 h-4" /> Book New Slot
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="flex items-center gap-1 p-1 border-b border-slate-100 bg-slate-50/50">
          <button 
            onClick={() => setFilter('ALL')}
            className={`flex-1 text-sm font-bold py-2.5 rounded-xl transition-all ${filter === 'ALL' ? 'bg-white text-emerald-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            All Bookings
          </button>
          <button 
            onClick={() => setFilter('ACTIVE')}
            className={`flex-1 text-sm font-bold py-2.5 rounded-xl transition-all ${filter === 'ACTIVE' ? 'bg-white text-emerald-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            Active ({activeBookings.length})
          </button>
          <button 
            onClick={() => setFilter('COMPLETED')}
            className={`flex-1 text-sm font-bold py-2.5 rounded-xl transition-all ${filter === 'COMPLETED' ? 'bg-white text-emerald-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            History ({completedBookings.length})
          </button>
        </div>

        <div className="p-4">
          {displayBookings.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                <Ticket className="w-8 h-8 text-emerald-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No bookings found</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm">You haven't made any slot bookings in this category yet.</p>
              {filter !== 'COMPLETED' && (
                <Link to="/farmer/book">
                  <Button className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl h-10 px-6">
                    Book Your First Slot
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {displayBookings.map((booking) => (
                <Card key={booking.id} className="p-0 border border-slate-200 overflow-hidden rounded-xl group hover:border-emerald-300 transition-colors">
                  <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                    <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                        <Sprout className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 text-base">{booking.crop_name} • {booking.expected_quantity_q} Qtl</h3>
                          <Badge className={`${
                            ['COMPLETED'].includes(booking.status) ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                            ['CANCELLED', 'REJECTED'].includes(booking.status) ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-emerald-100 text-emerald-800 border-emerald-200'
                          } hover:bg-transparent font-bold text-[10px] px-2 py-0.5 rounded-full uppercase`}>
                            {booking.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1"><Ticket className="w-3.5 h-3.5" /> Token: <span className="text-slate-800 font-bold">{booking.token_number}</span></span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {booking.centre_name}</span>
                          <span className="flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5" /> {booking.slot_date} at {booking.slot_time}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4 mt-2 sm:mt-0 w-full sm:w-auto shrink-0 justify-end">
                      {!['COMPLETED', 'CANCELLED', 'REJECTED'].includes(booking.status) && (
                        <Link to="/farmer/queue">
                          <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg h-8 shadow-xs">
                            Live Queue
                          </Button>
                        </Link>
                      )}
                      {booking.status === 'COMPLETED' && (
                        <Button size="sm" variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold rounded-lg h-8 shadow-xs">
                          <Download className="w-3.5 h-3.5 mr-1.5" /> Receipt
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-800 rounded-lg h-8 px-2">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
