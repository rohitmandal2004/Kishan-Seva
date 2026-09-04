import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, Users, Truck, AlertTriangle, TrendingUp, 
  MapPin, Settings, Download, Search, CheckCircle2 
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-300 flex-col hidden md:flex shrink-0 h-screen sticky top-0">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 text-white mb-2">
            <Building2 className="w-8 h-8 text-purple-400" />
            <span className="font-bold text-xl tracking-tight">Kishan Seva</span>
          </div>
          <div className="text-xs text-purple-400/80 font-medium tracking-wider uppercase">State Admin Portal</div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-600 text-white font-medium shadow-md">
            <TrendingUp className="w-5 h-5" /> Overview
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 hover:text-white transition-colors">
            <MapPin className="w-5 h-5" /> Procurement Centres
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 hover:text-white transition-colors">
            <Users className="w-5 h-5" /> Registered Farmers
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 hover:text-white transition-colors">
            <Truck className="w-5 h-5" /> Logistics & Stock
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 hover:text-white transition-colors">
            <Settings className="w-5 h-5" /> System Settings
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b h-16 flex items-center justify-between px-8 shrink-0">
          <div className="relative w-96 hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search centres, farmers, or transactions..." className="pl-9 h-10 bg-slate-50 border-slate-200" />
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="w-4 h-4 mr-2" /> Export Report
            </Button>
            <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">State Procurement Overview</h2>
                <p className="text-slate-500">Live analytics across all procurement centres (West Bengal)</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div> Live
                </Badge>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 border-0 shadow-sm bg-white">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Procured Today</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-4xl font-black text-slate-900">42.5K</h3>
                  <span className="text-slate-500 mb-1 font-medium">Quintals</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-green-600 font-medium">
                  <TrendingUp className="w-4 h-4" /> +12% vs yesterday
                </div>
              </Card>

              <Card className="p-6 border-0 shadow-sm bg-white">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Active Centres</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-4xl font-black text-slate-900">1,240</h3>
                  <span className="text-slate-500 mb-1 font-medium">/ 1,250</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-amber-600 font-medium">
                  <AlertTriangle className="w-4 h-4" /> 10 reporting high capacity
                </div>
              </Card>

              <Card className="p-6 border-0 shadow-sm bg-white">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Farmers Processed</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-4xl font-black text-slate-900">18,204</h3>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-green-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Avg wait time: 32 mins
                </div>
              </Card>

              <Card className="p-6 border-0 shadow-sm bg-purple-600 text-white">
                <p className="text-sm font-semibold text-purple-200 uppercase tracking-wider mb-2">Total Payout Pending</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-4xl font-black text-white">₹9.2</h3>
                  <span className="text-purple-200 mb-1 font-medium text-lg">Crore</span>
                </div>
                <Button className="mt-4 w-full bg-white text-purple-700 hover:bg-slate-50 border-0 h-10">
                  Process Payments
                </Button>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Centre Status */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-sm bg-white overflow-hidden h-full">
                  <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 text-lg">Centre Capacity Alerts</h3>
                    <Button variant="outline" size="sm">View Map</Button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {[
                      { name: 'Barasat Govt. Procurement Yard', capacity: 92, status: 'CRITICAL', queue: 145 },
                      { name: 'Krishnapur Procurement Centre', capacity: 78, status: 'HIGH', queue: 42 },
                      { name: 'Rajarhat Krishi Mandi', capacity: 45, status: 'NORMAL', queue: 12 },
                    ].map((centre, i) => (
                      <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            centre.status === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                            centre.status === 'HIGH' ? 'bg-amber-100 text-amber-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{centre.name}</h4>
                            <p className="text-sm text-slate-500">{centre.queue} farmers currently in queue</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-3 mb-1">
                            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${centre.status === 'CRITICAL' ? 'bg-red-500' : centre.status === 'HIGH' ? 'bg-amber-500' : 'bg-green-500'}`} 
                                style={{ width: `${centre.capacity}%` }}
                              ></div>
                            </div>
                            <span className="font-bold text-sm text-slate-700">{centre.capacity}%</span>
                          </div>
                          {centre.status === 'CRITICAL' && (
                            <span className="text-xs font-semibold text-red-600">Redirecting new bookings</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Action Required */}
              <div>
                <Card className="border-0 shadow-sm bg-white overflow-hidden h-full">
                  <div className="p-6 border-b">
                    <h3 className="font-bold text-slate-900 text-lg">Action Required</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <div className="flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                          <p className="font-bold text-amber-900 text-sm mb-1">Update Minimum Support Price (MSP)</p>
                          <p className="text-xs text-amber-700 mb-3">The new Govt mandate requires updating the Wheat MSP before next week.</p>
                          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">Update Prices</Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex gap-3">
                        <Users className="w-5 h-5 text-slate-600 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900 text-sm mb-1">45 Operator Access Requests</p>
                          <p className="text-xs text-slate-500 mb-3">Pending approvals for new procurement centre staff.</p>
                          <Button size="sm" variant="outline" className="border-slate-300">Review</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
