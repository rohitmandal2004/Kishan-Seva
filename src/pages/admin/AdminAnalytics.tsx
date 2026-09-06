import { Card } from '@/components/ui/card';
import { useMockStore } from '@/services/useMockStore';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Users, Sprout, Building2, Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function AdminAnalytics() {
  const store = useMockStore();
  const stats = store.getStats();
  const centres = store.getCentres();

  // Generate mock timeline data for the last 7 days
  const timelineData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    return {
      date: format(d, 'dd MMM'),
      procured: Math.floor(Math.random() * 500) + 100,
      target: 600,
    };
  });

  // Prepare Pie Chart data (Crop Distribution)
  const cropData = [
    { name: 'Paddy (Grade A)', value: 65, color: '#047857' },
    { name: 'Wheat', value: 25, color: '#ca8a04' },
    { name: 'Mustard', value: 10, color: '#b91c1c' },
  ];

  // Prepare Bar Chart data (Centre Loads)
  const centreLoads = centres.slice(0, 5).map(c => ({
    name: c.name.split(' ')[0], // Short name
    queue: c.current_queue_length,
    capacity: c.daily_capacity_quintals / 10, // Scaled for visual comparison
  }));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Analytics & Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Statewide procurement insights and financial disbursals.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 shadow-sm">
          <Calendar className="w-4 h-4 text-slate-400" />
          Last 7 Days
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-200 shadow-sm rounded-2xl flex items-center gap-4 bg-white">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Procured</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono">{stats.totalProcuredQuintals.toLocaleString()} Q</h3>
          </div>
        </Card>

        <Card className="p-5 border-slate-200 shadow-sm rounded-2xl flex items-center gap-4 bg-white">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">DBT Disbursed</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono">₹{stats.totalDisbursedCrores} Cr</h3>
          </div>
        </Card>

        <Card className="p-5 border-slate-200 shadow-sm rounded-2xl flex items-center gap-4 bg-white">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Farmers</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono">{stats.totalFarmers.toLocaleString()}</h3>
          </div>
        </Card>

        <Card className="p-5 border-slate-200 shadow-sm rounded-2xl flex items-center gap-4 bg-white">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Mandis</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono">{stats.activeCentres} / {centres.length}</h3>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Area Chart */}
        <Card className="lg:col-span-2 p-6 border-slate-200 shadow-sm rounded-2xl bg-white">
          <h3 className="font-bold text-slate-900 mb-6">Procurement Volume Trend (Quintals)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProcured" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#047857" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="procured" stroke="#047857" strokeWidth={3} fillOpacity={1} fill="url(#colorProcured)" />
                <Area type="monotone" dataKey="target" stroke="#cbd5e1" strokeDasharray="5 5" fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie Chart */}
        <Card className="p-6 border-slate-200 shadow-sm rounded-2xl bg-white flex flex-col">
          <h3 className="font-bold text-slate-900 mb-2">Crop Distribution</h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cropData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {cropData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {cropData.map(c => (
              <div key={c.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }}></div>
                  <span className="text-slate-600 font-medium">{c.name}</span>
                </div>
                <span className="font-bold text-slate-900">{c.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Bar Chart */}
        <Card className="lg:col-span-3 p-6 border-slate-200 shadow-sm rounded-2xl bg-white">
          <h3 className="font-bold text-slate-900 mb-6">Top Mandis Queue vs Capacity</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={centreLoads} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="queue" name="Active Queue" fill="#ca8a04" radius={[4, 4, 0, 0]} />
                <Bar dataKey="capacity" name="Scaled Capacity" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
