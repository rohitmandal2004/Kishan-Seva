import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, ChevronRight, Leaf, Sprout, FileText, Sun, CloudRain } from 'lucide-react';
import { MockAuthService } from '@/services/mockAuth.service';
import type { FarmerProfile } from '@/types';

export default function FarmerDashboard() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);

  useEffect(() => {
    setProfile(MockAuthService.getFarmerProfile());
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full pb-24 md:pb-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-sm text-slate-500 font-medium mb-1">Good Morning,</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{profile?.full_name || 'Kishan'}</h1>
          <p className="text-xs text-green-700 mt-1">A Prosperous Farmer Builds a Stronger India</p>
        </div>
        
        <div className="bg-white px-3 py-2 rounded-xl shadow-sm border flex items-center gap-3">
          <Sun className="w-8 h-8 text-yellow-500" />
          <div>
            <p className="text-lg font-bold leading-none">28°C</p>
            <p className="text-xs text-slate-500">Partly Cloudy</p>
          </div>
        </div>
      </div>

      {/* Main Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
        {/* Next Slot Booking */}
        <Card className="p-5 shadow-sm border-0 bg-white hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-green-700 group-hover:translate-x-1 transition-all">
            <ChevronRight className="w-6 h-6" />
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-xl flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="pr-6">
              <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase mb-1">Next Slot Booking</p>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Paddy (Dhan)</h3>
              <div className="text-sm text-slate-600 flex items-center gap-2 mb-1">
                <Clock className="w-3 h-3" /> 3 Oct 2026 • 10:00 AM
              </div>
              <div className="text-sm text-slate-600 flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Krishnapur Procurement Centre
              </div>
            </div>
          </div>
        </Card>

        {/* Live Queue Status */}
        <Card className="p-5 shadow-sm border-0 bg-white">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Live Queue Status</p>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 font-medium">● In Queue</Badge>
          </div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Token Number</p>
              <p className="font-bold text-slate-900 tracking-wide">KSP-1042</p>
            </div>
          </div>

          <div className="flex divide-x border-t pt-4">
            <div className="flex-1 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Position</p>
              <p className="text-xl font-bold text-slate-900">7 <span className="text-sm text-slate-400 font-normal">/ 28</span></p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Est. Wait</p>
              <p className="text-xl font-bold text-slate-900">~ 35m</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Quick Actions (Mobile Only, or Desktop specific) */}
          <div className="grid grid-cols-4 gap-2 md:hidden">
            <Link to="/farmer/book" className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2"><Calendar className="w-5 h-5"/></div>
              <span className="text-[10px] font-semibold text-slate-600 text-center">Book Slot</span>
            </Link>
            <Link to="/farmer/queue" className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-2"><Clock className="w-5 h-5"/></div>
              <span className="text-[10px] font-semibold text-slate-600 text-center">Live Queue</span>
            </Link>
            <Link to="/farmer/centres" className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-2"><MapPin className="w-5 h-5"/></div>
              <span className="text-[10px] font-semibold text-slate-600 text-center">Centres</span>
            </Link>
            <Link to="/farmer/crops" className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-2"><Sprout className="w-5 h-5"/></div>
              <span className="text-[10px] font-semibold text-slate-600 text-center">My Crops</span>
            </Link>
          </div>

          {/* My Crops */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-lg font-bold text-slate-900">My Crops</h2>
              <Link to="/farmer/crops" className="text-sm text-green-700 font-medium hover:underline">View All</Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Card className="p-4 bg-white border-0 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 shrink-0">🌾</div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Paddy</p>
                  <p className="text-xs text-slate-500">2.5 Acres</p>
                </div>
              </Card>
              <Card className="p-4 bg-white border-0 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">🌾</div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Wheat</p>
                  <p className="text-xs text-slate-500">1.0 Acres</p>
                </div>
              </Card>
              <Card className="p-4 bg-white border-0 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 shrink-0">🌻</div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Mustard</p>
                  <p className="text-xs text-slate-500">0.8 Acres</p>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Recent Updates */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold text-slate-900">Recent Updates</h2>
            <Link to="/farmer/notifications" className="text-sm text-green-700 font-medium hover:underline">View All</Link>
          </div>
          
          <Card className="bg-white border-0 shadow-sm p-0 overflow-hidden">
            <div className="divide-y divide-slate-100">
              <div className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 mt-1">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <p className="font-semibold text-slate-900 text-sm leading-tight">Slot Confirmed</p>
                    <span className="text-[10px] text-slate-400 shrink-0">2 hours ago</span>
                  </div>
                  <p className="text-xs text-slate-500">Paddy - 3 Oct 2026, 10:00 AM</p>
                </div>
              </div>
              
              <div className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <p className="font-semibold text-slate-900 text-sm leading-tight">Document Verified</p>
                    <span className="text-[10px] text-slate-400 shrink-0">1 day ago</span>
                  </div>
                  <p className="text-xs text-slate-500">Your land records are verified</p>
                </div>
              </div>
              
              <div className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-1">
                  <span className="font-bold text-sm">₹</span>
                </div>
                <div>
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <p className="font-semibold text-slate-900 text-sm leading-tight">Payment Initiated</p>
                    <span className="text-[10px] text-slate-400 shrink-0">2 days ago</span>
                  </div>
                  <p className="text-xs text-slate-500">Amount ₹18,750</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
