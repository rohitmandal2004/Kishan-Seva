import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, Users, Truck, AlertTriangle, TrendingUp, 
  MapPin, Settings, Download, Search, CheckCircle2, 
  ArrowRight, ShieldCheck, Power, RefreshCw, BarChart3, LogOut
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { useMockStore } from '@/services/useMockStore';
import { LanguageSelector } from '@/components/ui/language-selector';
import { useLanguage } from '@/services/i18n';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const store = useMockStore();
  const centres = store.getCentres();
  const bookings = store.getBookings();
  const stats = store.getStats();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CENTRES' | 'TRANSACTIONS'>('OVERVIEW');
  const [searchTerm, setSearchTerm] = useState('');
  const [exportMessage, setExportMessage] = useState(false);

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

  const filteredCentres = centres.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Admin Desktop Sidebar */}
      <aside className="w-64 bg-slate-950 text-slate-300 flex-col hidden md:flex shrink-0 h-screen sticky top-0 border-r border-slate-800 shadow-xl">
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
            <TrendingUp className="w-4 h-4" /> State Overview
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
            <span className="text-[11px] text-slate-400 font-semibold">Language / ভাষা</span>
            <LanguageSelector variant="compact" />
          </div>
          <Button 
            onClick={() => store.resetToDemo()}
            variant="ghost" 
            className="w-full justify-start text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
            title="Reset to clean demo data state"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2" /> Reset Demo State
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 shadow-xs">
          <div className="relative w-72 hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search centres, farmers, tokens..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 bg-slate-50 border-slate-200 rounded-full text-xs" 
            />
          </div>
          
          <div className="flex items-center gap-3 ml-auto">
            <LanguageSelector variant="compact" />
            <Button 
              onClick={handleExportCSV}
              variant="outline" 
              size="sm" 
              className="rounded-full text-xs font-bold border-slate-300 text-slate-700 hover:border-purple-600 hover:text-purple-700 h-9 gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> 
              {exportMessage ? 'Audit CSV Downloaded! ✓' : 'Export Audit Report (CSV)'}
            </Button>
            
            <div className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-200 text-purple-800 font-extrabold text-xs flex items-center justify-center shadow-xs">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-auto bg-slate-50/60">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Apex State Monitoring Console</span>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">State Agricultural Procurement Command</h2>
                <p className="text-xs text-slate-500 mt-0.5">Live real-time monitoring across procurement centres in West Bengal.</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-ping"></div> Live Monitoring
                </Badge>
              </div>
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="p-5 border border-slate-200 shadow-xs bg-white rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Procured Today</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <h3 className="text-3xl font-black text-slate-900">{stats.totalProcuredQuintals.toLocaleString('en-IN')}</h3>
                  <span className="text-xs font-bold text-slate-500">Quintals</span>
                </div>
                <p className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs target
                </p>
              </Card>

              <Card className="p-5 border border-slate-200 shadow-xs bg-white rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Mandis</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <h3 className="text-3xl font-black text-slate-900">{stats.activeCentres}</h3>
                  <span className="text-xs font-bold text-slate-500">/ {centres.length} Mandis</span>
                </div>
                <p className="text-[11px] text-purple-600 font-semibold mt-2">
                  ● 100% Computerized Scales
                </p>
              </Card>

              <Card className="p-5 border border-slate-200 shadow-xs bg-white rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicles In Queue</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <h3 className="text-3xl font-black text-slate-900">{stats.inQueueCount}</h3>
                  <span className="text-xs font-bold text-slate-500">Active tokens</span>
                </div>
                <p className="text-[11px] text-blue-600 font-semibold mt-2">
                  ● Zero Stalling Reported
                </p>
              </Card>

              <Card className="p-5 border border-slate-200 shadow-xs bg-white rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DBT Disbursed</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <h3 className="text-3xl font-black text-slate-900">₹{stats.totalDisbursedCrores}</h3>
                  <span className="text-xs font-bold text-slate-500">Crores</span>
                </div>
                <p className="text-[11px] text-emerald-600 font-semibold mt-2">
                  ● Direct to Aadhaar A/c
                </p>
              </Card>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'OVERVIEW' && (
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

                {/* Grievance & Alerts Log */}
                <div>
                  <Card className="p-6 border border-slate-200 bg-white rounded-3xl shadow-xs">
                    <h3 className="font-extrabold text-slate-900 text-sm mb-3">Live Mandi Operations Feed</h3>
                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <p className="font-bold text-emerald-900">Weighbridge Certified: KSP-1040</p>
                        <p className="text-[11px] text-emerald-700 mt-0.5">45.0 Quintals Paddy • DBT Payout ₹97,785 dispatched.</p>
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
            )}

            {/* Tab 2: Procurement Mandis Management */}
            {activeTab === 'CENTRES' && (
              <Card className="border border-slate-200 bg-white rounded-3xl overflow-hidden shadow-xs">
                <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-900 text-sm">Designated Procurement Mandi Centres</h3>
                  <span className="text-xs text-slate-400">Click toggle button to change operational status</span>
                </div>
                <div className="divide-y divide-slate-100">
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
                          onClick={() => store.toggleCentreStatus(c.id)}
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

            {/* Tab 3: Transactions & Audit Log */}
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
