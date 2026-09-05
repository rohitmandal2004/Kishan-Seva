import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, Users, Truck, AlertTriangle, TrendingUp, 
  MapPin, Settings, Download, Search, CheckCircle2, 
  ArrowRight, ShieldCheck, Power, RefreshCw, BarChart3, LogOut,
  Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  Legend, LineChart, Line, CartesianGrid
} from 'recharts';
import { Input } from '@/components/ui/input';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useLanguage } from '@/services/i18n';
import { useSupabase } from '@/context/SupabaseContext';
import { useMockStore } from '@/services/useMockStore';
import { LanguageSelector } from '@/components/ui/language-selector';
import { SupabaseStatusBadge } from '@/components/ui/supabase-status-dialog';
import { SupabaseDataService } from '@/services/supabaseData.service';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const store = useMockStore();
  const { user, signOut } = useSupabase();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CENTRES' | 'SLOTS' | 'ANALYTICS' | 'TRANSACTIONS'>('OVERVIEW');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState('All');
  const [exportMessage, setExportMessage] = useState(false);

  // If not logged in as admin, redirect to roles
  // Note: RequireRole wrapper usually handles this, but keeping it as an extra safeguard
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/roles" replace />;
  }

  const centres = store.getCentres();
  const bookings = store.getBookings();
  const stats = store.getStats();

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Token,Farmer Name,Crop,Quantity (Q),Centre,Status,Date\n" + 
      bookings.map(b => `${b.token_number},"${b.farmer_name}","${b.crop_name}",${b.expected_quantity_q},"${b.centre_name}",${b.status},${b.slot_date}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Kishan_Seva_Procurement_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportMessage(true);
    setTimeout(() => setExportMessage(false), 3000);
  };

  const filteredCentres = centres.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        c.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDist = selectedDistrictFilter === 'All' || c.district === selectedDistrictFilter;
    return matchSearch && matchDist;
  });

  // Recharts Chart Data
  const cropProcurementData = [
    { crop: 'Paddy (Grade A)', procured: 450, target: 500, value: 450, color: '#047857' },
    { crop: 'Common Paddy', procured: 320, target: 400, value: 320, color: '#10b981' },
    { crop: 'Wheat', procured: 210, target: 250, value: 210, color: '#f59e0b' },
    { crop: 'Mustard', procured: 140, target: 180, value: 140, color: '#8b5cf6' },
    { crop: 'Maize', procured: 85, target: 120, value: 85, color: '#3b82f6' },
  ];

  const hourlyQueueTrends = [
    { time: '08:00', arrivals: 12, processing: 8, queue: 10 },
    { time: '10:00', arrivals: 28, processing: 20, queue: 22 },
    { time: '12:00', arrivals: 45, processing: 35, queue: 32 },
    { time: '14:00', arrivals: 30, processing: 28, queue: 24 },
    { time: '16:00', arrivals: 18, processing: 22, queue: 14 },
    { time: '18:00', arrivals: 5, processing: 10, queue: 4 },
  ];

  const districtUtilization = [
    { district: 'North 24 Pgs', utilization: 88 },
    { district: 'South 24 Pgs', utilization: 92 },
    { district: 'Burdwan (East)', utilization: 94 },
    { district: 'Hooghly', utilization: 76 },
    { district: 'Nadia', utilization: 84 },
    { district: 'Murshidabad', utilization: 82 },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-2.5 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-2xl bg-white/10 border border-white/20">
            <img src="/logo.svg" alt="Kishan Seva" className="h-11 w-11 object-contain" />
          </div>
          <div>
            <span className="font-extrabold text-white text-base leading-tight block">Kishan Seva</span>
            <p className="text-[10px] text-purple-300 font-semibold">State Administration</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector variant="compact" />
          <Link to="/roles">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 text-xs h-8 px-2">
              Exit
            </Button>
          </Link>
        </div>
      </div>

      {/* Admin Desktop & Tablet Sidebar */}
      <aside className="w-56 lg:w-64 bg-slate-950 text-slate-300 flex-col hidden md:flex shrink-0 h-screen sticky top-0 border-r border-slate-800 shadow-xl">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3 text-white mb-2">
            <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-md">
              <img src="/logo.svg" alt="Kishan Seva" className="h-14 w-14 object-contain" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight leading-none block">Kishan Seva</span>
              <span className="text-[10px] text-purple-400 font-bold tracking-wider uppercase mt-1 block">State Admin Portal</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <button 
            onClick={() => setActiveTab('OVERVIEW')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'OVERVIEW' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40' 
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> State Command Overview
          </button>
          <button 
            onClick={() => setActiveTab('ANALYTICS')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'ANALYTICS' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40' 
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Analytics & Reports
          </button>
          <button 
            onClick={() => setActiveTab('CENTRES')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'CENTRES' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40' 
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" /> Procurement Mandis ({centres.length})
          </button>
          <button 
            onClick={() => setActiveTab('SLOTS')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'SLOTS' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40' 
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" /> Slot & Capacity Control
          </button>
          <button 
            onClick={() => setActiveTab('TRANSACTIONS')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'TRANSACTIONS' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40' 
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" /> Audit Transactions ({bookings.length})
          </button>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] text-slate-400 font-semibold">Language</span>
            <LanguageSelector variant="compact" />
          </div>
          <Button 
            onClick={() => store.resetStore()}
            variant="ghost" 
            className="w-full justify-start text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
            title="Reset all data"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2" /> Reset Data
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
            onClick={() => navigate('/roles')}
          >
            <LogOut className="w-4 h-4 mr-2" /> Switch Role
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-xs">
          <div className="relative w-64 lg:w-72 hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search mandis, tokens, farmers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 bg-slate-50 border-slate-200 rounded-full text-xs" 
            />
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <SupabaseStatusBadge />
            <Button 
              onClick={handleExportCSV}
              variant="outline" 
              size="sm" 
              className="rounded-full text-xs font-bold border-slate-300 text-slate-700 hover:border-purple-600 hover:text-purple-700 h-9 gap-1.5 px-3 sm:px-4"
            >
              <Download className="w-3.5 h-3.5" /> 
              <span className="hidden sm:inline">{exportMessage ? 'Audit CSV Downloaded! ✓' : 'Export Audit CSV'}</span>
              <span className="sm:hidden">CSV</span>
            </Button>
            
            <div className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-200 text-purple-800 font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto bg-slate-50/60 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Mobile Tab Switcher */}
            <div className="md:hidden flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-2xl mb-5 overflow-x-auto no-scrollbar">
              {[
                { key: 'OVERVIEW', label: 'Overview' },
                { key: 'ANALYTICS', label: 'Analytics' },
                { key: 'CENTRES', label: 'Mandis' },
                { key: 'SLOTS', label: 'Slots' },
                { key: 'TRANSACTIONS', label: 'Audits' },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as any)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                    activeTab === t.key ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Top Command Banner */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Apex State Command Console</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">State Agricultural Procurement Command</h2>
                <p className="text-xs text-slate-500 mt-0.5">Live real-time monitoring across 20+ procurement centres in West Bengal.</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-ping"></div> Live Monitoring Active
                </Badge>
              </div>
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
              <Card className="p-4 sm:p-5 border border-slate-200 shadow-xs bg-white rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Procured Today</span>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalProcuredQuintals.toLocaleString('en-IN')}</h3>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-500">Q</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs target
                </p>
              </Card>

              <Card className="p-4 sm:p-5 border border-slate-200 shadow-xs bg-white rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Mandis</span>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{stats.activeCentres}</h3>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-500">/ {centres.length} Mandis</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-purple-600 font-semibold mt-2 truncate">
                  ● Computerized Scales Active
                </p>
              </Card>

              <Card className="p-4 sm:p-5 border border-slate-200 shadow-xs bg-white rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicles In Yard</span>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{stats.inQueueCount}</h3>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-500">Tokens</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-blue-600 font-semibold mt-2 truncate">
                  ● Continuous Processing
                </p>
              </Card>

              <Card className="p-4 sm:p-5 border border-slate-200 shadow-xs bg-white rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total DBT Disbursed</span>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900">₹{stats.totalDisbursedCrores}</h3>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-500">Cr</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold mt-2 truncate">
                  ● Direct to Aadhaar Bank
                </p>
              </Card>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* District Target vs Actuals */}
                  <div className="lg:col-span-2">
                    <Card className="p-6 border border-slate-200 bg-white rounded-3xl shadow-xs">
                      <h3 className="font-extrabold text-slate-900 text-sm mb-4">District-Wise Procurement Fulfillment (2026 Target)</h3>
                      
                      <div className="space-y-4">
                        {[
                          { district: 'North 24 Parganas', target: '50,000 Q', actual: '42,500 Q', percent: 85, color: 'bg-emerald-600' },
                          { district: 'South 24 Parganas', target: '40,000 Q', actual: '36,800 Q', percent: 92, color: 'bg-emerald-600' },
                          { district: 'Burdwan (East)', target: '80,000 Q', actual: '74,400 Q', percent: 93, color: 'bg-emerald-600' },
                          { district: 'Hooghly', target: '35,000 Q', actual: '26,250 Q', percent: 75, color: 'bg-amber-500' },
                          { district: 'Nadia', target: '30,000 Q', actual: '25,500 Q', percent: 85, color: 'bg-emerald-600' },
                          { district: 'Murshidabad', target: '45,000 Q', actual: '37,000 Q', percent: 82, color: 'bg-emerald-600' },
                        ].map((item, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-800">{item.district}</span>
                              <span className="text-slate-500">{item.actual} / {item.target} ({item.percent}%)</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percent}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* Live Mandi Feed */}
                  <div>
                    <Card className="p-6 border border-slate-200 bg-white rounded-3xl shadow-xs">
                      <h3 className="font-extrabold text-slate-900 text-sm mb-3">Live Mandi Operations Feed</h3>
                      <div className="space-y-3 text-xs">
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                          <p className="font-bold text-emerald-900">Weighbridge Certified: KSP-1040</p>
                          <p className="text-[11px] text-emerald-700 mt-0.5">50.0 Quintals Paddy • DBT Payout ₹1,08,700 dispatched.</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                          <p className="font-bold text-blue-900">Moisture Lab Certified: KSP-1042</p>
                          <p className="text-[11px] text-blue-700 mt-0.5">Grade A (13.8% moisture) recorded by Inspector Das.</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <p className="font-bold text-slate-800">New Slot Booked: Habra Depot</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Scheduled for 11:00 AM tomorrow (Mustard harvest).</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ANALYTICS (Recharts) */}
            {activeTab === 'ANALYTICS' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart 1: Procurement by Crop */}
                  <Card className="p-6 border border-slate-200 bg-white rounded-3xl shadow-xs">
                    <h3 className="font-extrabold text-slate-900 text-sm mb-1">Procurement Volume by Crop (Quintals)</h3>
                    <p className="text-xs text-slate-500 mb-4">Cumulative Kharif/Rabi season distribution</p>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cropProcurementData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="crop" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="procured" fill="#047857" radius={[6, 6, 0, 0]} name="Procured (Q)" />
                          <Bar dataKey="target" fill="#e2e8f0" radius={[6, 6, 0, 0]} name="Target (Q)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Chart 2: Hourly Yard Queue Dynamics */}
                  <Card className="p-6 border border-slate-200 bg-white rounded-3xl shadow-xs">
                    <h3 className="font-extrabold text-slate-900 text-sm mb-1">Hourly Yard Arrivals vs Turnaround Speed</h3>
                    <p className="text-xs text-slate-500 mb-4">Real-time throughput analysis</p>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={hourlyQueueTrends}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Line type="monotone" dataKey="arrivals" stroke="#3b82f6" strokeWidth={2} name="Arrivals" />
                          <Line type="monotone" dataKey="processing" stroke="#10b981" strokeWidth={2} name="Processed" />
                          <Line type="monotone" dataKey="queue" stroke="#f59e0b" strokeWidth={2} name="Yard Queue" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB 3: PROCUREMENT MANDIS MANAGEMENT */}
            {activeTab === 'CENTRES' && (
              <Card className="border border-slate-200 bg-white rounded-3xl overflow-hidden shadow-xs">
                <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Designated Procurement Mandi Centres</h3>
                    <p className="text-xs text-slate-500">Configure daily throughput limits and operational statuses</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedDistrictFilter}
                      onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                      className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                    >
                      <option value="All">All Districts</option>
                      <option value="North 24 Parganas">North 24 Parganas</option>
                      <option value="South 24 Parganas">South 24 Parganas</option>
                      <option value="Burdwan (East)">Burdwan (East)</option>
                      <option value="Hooghly">Hooghly</option>
                      <option value="Nadia">Nadia</option>
                      <option value="Murshidabad">Murshidabad</option>
                    </select>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                  {filteredCentres.map((c) => (
                    <div key={c.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {c.centre_code}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                          <Badge className={`text-[10px] border-0 font-bold ${
                            c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {c.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">{c.address}, {c.district}</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Capacity: <strong>{c.daily_capacity_quintals} Q/day</strong> • Current Queue: <strong>{c.current_queue_length} Vehicles</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => SupabaseDataService.toggleCentreStatus(c.id)}
                          size="sm"
                          variant="outline"
                          className={`text-xs font-bold h-8 rounded-xl ${
                            c.status === 'ACTIVE' ? 'border-red-200 text-red-700 hover:bg-red-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          <Power className="w-3 h-3 mr-1" />
                          {c.status === 'ACTIVE' ? 'Set Maintenance' : 'Set Active'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* TAB 4: SLOT & CAPACITY CONTROL */}
            {activeTab === 'SLOTS' && (
              <Card className="border border-slate-200 bg-white rounded-3xl overflow-hidden shadow-xs">
                <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Delivery Slot Windows & Quota Allocation</h3>
                    <p className="text-xs text-slate-500">Prevent vehicle overbooking and enforce time caps</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-900 text-xs font-bold">
                    6 Standard Windows
                  </Badge>
                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { time: '09:00 AM - 10:00 AM', cap: 20, booked: 18, status: 'OPEN' },
                    { time: '10:00 AM - 11:00 AM', cap: 20, booked: 20, status: 'FULL' },
                    { time: '11:00 AM - 12:00 PM', cap: 20, booked: 14, status: 'OPEN' },
                    { time: '01:00 PM - 02:00 PM', cap: 20, booked: 12, status: 'OPEN' },
                    { time: '02:00 PM - 03:00 PM', cap: 20, booked: 8, status: 'OPEN' },
                    { time: '03:00 PM - 04:00 PM', cap: 20, booked: 5, status: 'OPEN' },
                  ].map((slot, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-xs text-slate-900">{slot.time}</span>
                        <Badge className={`text-[10px] ${slot.status === 'FULL' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {slot.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600 mb-2">
                        <span>Booked / Quota:</span>
                        <span className="font-bold">{slot.booked} / {slot.cap} Trucks</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${slot.booked >= slot.cap ? 'bg-red-500' : 'bg-emerald-600'}`}
                          style={{ width: `${(slot.booked / slot.cap) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* TAB 5: TRANSACTIONS & AUDIT LOG */}
            {activeTab === 'TRANSACTIONS' && (
              <Card className="border border-slate-200 bg-white rounded-3xl overflow-hidden shadow-xs">
                <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-900 text-sm">All Digital Procurement Transactions</h3>
                  <Button size="sm" onClick={handleExportCSV} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold h-8 gap-1">
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </Button>
                </div>
                <div className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <div key={b.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono font-bold text-slate-900">{b.token_number}</span>
                          <span className="font-bold text-slate-800">{b.farmer_name}</span>
                          <Badge className="bg-slate-100 text-slate-700 text-[10px]">{b.status}</Badge>
                        </div>
                        <p className="text-slate-500">
                          {b.crop_name} ({b.expected_quantity_q} Q) at {b.centre_name} • Vehicle: {b.vehicle_number}
                        </p>
                      </div>
                      <div className="text-right">
                        {b.weighment_data ? (
                          <span className="font-mono font-bold text-emerald-700 text-sm block">
                            ₹{b.weighment_data.net_payable.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-slate-400">Estimated: ₹{(b.expected_quantity_q * 2183).toLocaleString('en-IN')}</span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">{b.slot_date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
