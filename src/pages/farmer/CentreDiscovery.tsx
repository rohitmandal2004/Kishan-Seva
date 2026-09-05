import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, MapPin, Clock, Users, ArrowRight, 
  Sparkles, Phone, ChevronLeft,
  CheckCircle2, ArrowLeftRight, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMockStore } from '@/services/useMockStore';
import { ProcurementCentre, CentreRecommendation } from '@/types';
import { evaluateCentreRecommendations } from '@/services/recommendationEngine';
import { SupabaseDataService } from '@/services/supabaseData.service';

// Fix Leaflet default marker icon issue in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom markers
const optimalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [1, -40],
  shadowSize: [41, 41]
});

const nearestIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [26, 42],
  iconAnchor: [13, 42],
  popupAnchor: [1, -36],
  shadowSize: [41, 41]
});

const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [24, 40],
  iconAnchor: [12, 40],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12, { animate: true });
  }, [center, map]);
  return null;
}

export default function CentreDiscovery() {
  const navigate = useNavigate();
  const store = useMockStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [cropFilter, setCropFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'MAP' | 'LIST'>('MAP');
  const [centresList, setCentresList] = useState<ProcurementCentre[]>(store.getCentres());
  const [showComparison, setShowComparison] = useState(false);

  const farmerLocation: [number, number] = [22.6168, 88.4369];

  useEffect(() => {
    SupabaseDataService.getCentres().then(data => {
      if (data && data.length > 0) {
        setCentresList(data);
      }
    });
  }, []);

  // Run Smart Multi-factor Recommendation Engine
  const evaluatedRecommendations: CentreRecommendation[] = evaluateCentreRecommendations(
    centresList,
    { latitude: farmerLocation[0], longitude: farmerLocation[1] },
    cropFilter === 'All' ? 'Paddy (Grade A)' : cropFilter
  );

  const filteredRecs = evaluatedRecommendations.filter((item) => {
    const matchesSearch = item.centre.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.centre.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.centre.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = cropFilter === 'All' || item.centre.accepted_crops.some(cr => cr.toLowerCase().includes(cropFilter.toLowerCase()));
    return matchesSearch && matchesCrop;
  });

  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);
  const selectedRec = (selectedRecId ? filteredRecs.find(r => r.centre.id === selectedRecId) : null) || filteredRecs[0] || null;
  const setSelectedRec = (rec: CentreRecommendation | null) => setSelectedRecId(rec ? rec.centre.id : null);

  const optimalMatch = evaluatedRecommendations.find(r => r.is_optimal) || evaluatedRecommendations[0];
  const nearestMatch = evaluatedRecommendations.find(r => r.is_nearest) || evaluatedRecommendations[0];

  return (
    <div className="flex flex-col h-[calc(100dvh-4.5rem)] md:h-screen w-full relative font-sans">
      {/* Top Header & Smart Action Bar */}
      <div className="bg-white px-4 sm:px-6 py-3 border-b border-slate-200 z-10 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/farmer/dashboard')} 
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 text-slate-600 transition-colors shrink-0 shadow-xs"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                Smart Centre Locator
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Multi-Factor AI Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Evaluates travel distance, live yard congestion, and queue wait times for optimal efficiency.
            </p>
          </div>
        </div>

        {/* Toolbar & Compare CTA */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {optimalMatch && nearestMatch && optimalMatch.centre.id !== nearestMatch.centre.id && (
            <Button
              onClick={() => setShowComparison(true)}
              variant="outline"
              size="sm"
              className="rounded-full text-[11px] sm:text-xs font-bold border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 h-8 sm:h-9 gap-1.5 shadow-xs shrink-0"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-700" />
              <span>Compare Mandis</span>
            </Button>
          )}

          <div className="relative flex-1 min-w-[140px] sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search mandi..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs w-full sm:w-44 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-medium overflow-x-auto no-scrollbar max-w-full">
            {['All', 'Paddy', 'Wheat', 'Mustard'].map(crop => (
              <button
                key={crop}
                onClick={() => setCropFilter(crop)}
                className={`px-2.5 py-1 rounded-full text-[11px] transition-all shrink-0 ${
                  cropFilter === crop ? 'bg-emerald-700 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>

          <div className="md:hidden flex rounded-full border border-slate-200 p-0.5 bg-slate-50 text-xs shrink-0 ml-auto">
            <button
              onClick={() => setViewMode('MAP')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${viewMode === 'MAP' ? 'bg-emerald-700 text-white' : 'text-slate-600'}`}
            >
              Map
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${viewMode === 'LIST' ? 'bg-emerald-700 text-white' : 'text-slate-600'}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Map View Area */}
        <div className={`flex-1 relative bg-slate-200 z-0 ${viewMode === 'LIST' ? 'hidden md:block' : 'block h-[45vh] md:h-auto'}`}>
          <MapContainer 
            center={farmerLocation} 
            zoom={11} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Farmer Farm Marker */}
            <Marker 
              position={farmerLocation} 
              icon={new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [26, 42],
                iconAnchor: [13, 42]
              })}
            >
              <Popup>
                <div className="p-1 text-center font-sans">
                  <p className="font-bold text-xs text-slate-900">Your Farm (Rohit Mandal)</p>
                  <p className="text-[10px] text-slate-500">Basirhat, North 24 Parganas</p>
                </div>
              </Popup>
            </Marker>

            {/* Procurement Centre Markers */}
            {filteredRecs.map((item) => {
              const icon = item.is_optimal ? optimalIcon : item.is_nearest ? nearestIcon : defaultIcon;
              return (
                <Marker 
                  key={item.centre.id}
                  position={[item.centre.latitude, item.centre.longitude]}
                  icon={icon}
                  eventHandlers={{
                    click: () => setSelectedRec(item),
                  }}
                >
                  <Popup>
                    <div className="font-sans p-1 text-left min-w-40">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${item.is_optimal ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-700'}`}>
                          {item.is_optimal ? '★ BEST MATCH' : `${item.journey_score}/100 SCORE`}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-slate-900 leading-tight">{item.centre.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{item.distance_km} km • ~{item.predicted_wait_mins} min wait</p>
                      <p className="text-[10px] font-bold text-emerald-700 mt-1">{item.current_queue} vehicles in queue</p>
                      <button 
                        onClick={() => navigate(`/farmer/book?centre=${item.centre.id}`)}
                        className="mt-2 w-full bg-emerald-700 text-white font-bold text-[10px] py-1 rounded cursor-pointer text-center"
                      >
                        Book Slot Here
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
            
            {selectedRec && (
              <MapUpdater center={[selectedRec.centre.latitude, selectedRec.centre.longitude]} />
            )}
          </MapContainer>
        </div>

        {/* Sidebar Recommended Centres List */}
        <div className={`w-full md:w-80 lg:w-[440px] bg-slate-50 border-l border-slate-200 flex flex-col ${viewMode === 'MAP' ? 'h-[55vh] md:h-auto' : 'h-full md:h-auto'} shrink-0 z-10`}>
          <div className="p-4 bg-white border-b border-slate-200 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-800 text-sm">Centres Ranked by Efficiency</span>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-bold">
                {filteredRecs.length} Found
              </Badge>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">2026 Model</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredRecs.map((item) => {
              const isSelected = selectedRec?.centre.id === item.centre.id;
              
              return (
                <Card 
                  key={item.centre.id} 
                  className={`p-0 overflow-hidden cursor-pointer transition-all border-2 rounded-2xl ${
                    isSelected ? 'border-emerald-600 shadow-md ring-1 ring-emerald-600/20' : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                  }`}
                  onClick={() => setSelectedRec(item)}
                >
                  {/* Top Recommendation Badge Banner */}
                  {item.is_optimal && (
                    <div className="bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider py-1.5 px-4 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Optimal Mandi (Fastest Turnaround)
                      </span>
                      <span className="bg-emerald-900/60 px-2 py-0.5 rounded text-amber-200 font-mono">
                        {item.journey_score}/100 SCORE
                      </span>
                    </div>
                  )}

                  {!item.is_optimal && item.is_nearest && (
                    <div className="bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider py-1.5 px-4 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-white" /> Nearest Centre (High Congestion)
                      </span>
                      <span className="bg-amber-800/60 px-2 py-0.5 rounded text-white font-mono">
                        {item.journey_score}/100 SCORE
                      </span>
                    </div>
                  )}

                  <div className="p-4 bg-white">
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <div>
                        <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {item.centre.centre_code}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-sm mt-1">{item.centre.name}</h3>
                      </div>
                      <span className="text-xs font-bold text-slate-700 shrink-0 bg-slate-100 px-2.5 py-1 rounded-full">
                        {item.distance_km} km
                      </span>
                    </div>
                    
                    <p className="text-[11px] text-slate-500 mb-3 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{item.centre.address}</span>
                    </p>

                    {/* Metric Pills */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className={`p-2 rounded-xl font-semibold flex items-center gap-2 ${
                        item.predicted_wait_mins <= 40 ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <div>
                          <p className="text-[9px] uppercase font-bold text-slate-400">Est. Wait</p>
                          <p className="text-xs font-bold">~{item.predicted_wait_mins} mins</p>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-50 text-slate-800 font-semibold flex items-center gap-2 border border-slate-100">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-[9px] uppercase font-bold text-slate-400">In Queue</p>
                          <p className="text-xs font-bold">{item.current_queue} Vehicles</p>
                        </div>
                      </div>
                    </div>

                    {/* Explainable Trade-off Note */}
                    <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-[11px] text-emerald-900 mb-3">
                      <p className="font-bold text-emerald-950 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Why Recommended?
                      </p>
                      <p className="text-[10px] text-emerald-800/90 mt-0.5">
                        {item.explanation.tradeoff || item.explanation.reasons[0]}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 flex gap-2">
                      <Button 
                        className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold h-9 shadow-xs gap-1.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/farmer/book?centre=${item.centre.id}`);
                        }}
                      >
                        Book Slot Here <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                      <a 
                        href={`tel:${item.centre.contact_number}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 flex items-center justify-center"
                        title="Call Mandi"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side-by-Side Nearest vs Optimal Comparison Modal */}
      {showComparison && optimalMatch && nearestMatch && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowComparison(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                Algorithmic Mandi Comparison
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                Nearest vs Optimal Mandi Trade-off
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Kishan Seva evaluates waiting time against travel distance so you spend less time idling in long queues.
              </p>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Nearest Card */}
              <div className="p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/40 text-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold">
                    Nearest Centre
                  </Badge>
                  <span className="font-mono text-xs font-extrabold text-amber-900">
                    {nearestMatch.journey_score}/100 Score
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 mb-1">{nearestMatch.centre.name}</h3>
                <p className="text-[11px] text-slate-500 mb-3">{nearestMatch.centre.address}</p>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-amber-200/60">
                    <span className="text-slate-500">Distance from Farm:</span>
                    <span className="font-bold text-slate-900">{nearestMatch.distance_km} km</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-200/60">
                    <span className="text-slate-500">Vehicles in Queue:</span>
                    <span className="font-bold text-red-600">{nearestMatch.current_queue} Vehicles</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-200/60">
                    <span className="text-slate-500">Predicted Wait Time:</span>
                    <span className="font-bold text-red-600">~{nearestMatch.predicted_wait_mins} mins (3 hrs)</span>
                  </div>
                  <div className="flex justify-between py-1 text-[11px] text-amber-900 font-semibold">
                    <span>Status:</span>
                    <span>High Congestion Risk</span>
                  </div>
                </div>
              </div>

              {/* Optimal Match Card */}
              <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/70 text-slate-800 relative overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                  <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                    ★ Recommended Best Match
                  </Badge>
                  <span className="font-mono text-xs font-black text-emerald-800">
                    {optimalMatch.journey_score}/100 Score
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 mb-1">{optimalMatch.centre.name}</h3>
                <p className="text-[11px] text-slate-500 mb-3">{optimalMatch.centre.address}</p>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-emerald-200">
                    <span className="text-slate-500">Distance from Farm:</span>
                    <span className="font-bold text-slate-900">{optimalMatch.distance_km} km</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-200">
                    <span className="text-slate-500">Vehicles in Queue:</span>
                    <span className="font-bold text-emerald-700">{optimalMatch.current_queue} Vehicles</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-200">
                    <span className="text-slate-500">Predicted Wait Time:</span>
                    <span className="font-bold text-emerald-700">~{optimalMatch.predicted_wait_mins} mins</span>
                  </div>
                  <div className="flex justify-between py-1 text-[11px] text-emerald-900 font-bold">
                    <span>Net Time Saved:</span>
                    <span className="text-emerald-700 font-extrabold">Save ~{nearestMatch.predicted_wait_mins - optimalMatch.predicted_wait_mins} mins</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Recommendation Summary Callout */}
            <div className="p-4 rounded-2xl bg-emerald-900 text-white flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-xs">
                <p className="font-bold text-emerald-300">Smart Recommendation Conclusion:</p>
                <p className="text-emerald-100 text-[11px] mt-0.5">
                  Travelling {parseFloat((optimalMatch.distance_km - nearestMatch.distance_km).toFixed(1))} km farther will save you approximately {Math.round((nearestMatch.predicted_wait_mins - optimalMatch.predicted_wait_mins) / 60)} hours in the queue yard.
                </p>
              </div>
              <Button
                onClick={() => {
                  setShowComparison(false);
                  navigate(`/farmer/book?centre=${optimalMatch.centre.id}`);
                }}
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 h-10 rounded-xl shrink-0"
              >
                Book Recommended Mandi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
