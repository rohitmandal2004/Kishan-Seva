import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, MapPin, Clock, Users, ArrowRight, 
  Sparkles, Phone, ChevronRight, ChevronLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMockStore } from '@/services/useMockStore';
import { ProcurementCentre } from '@/services/mockStore';

// Fix Leaflet default marker icon issue in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const bestIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [28, 44],
  iconAnchor: [14, 44],
  popupAnchor: [1, -36],
  shadowSize: [41, 41]
});

const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
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

import { SupabaseDataService } from '@/services/supabaseData.service';

export default function CentreDiscovery() {
  const navigate = useNavigate();
  const store = useMockStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [cropFilter, setCropFilter] = useState('All');
  const [selectedCentre, setSelectedCentre] = useState<ProcurementCentre | null>(null);
  const [viewMode, setViewMode] = useState<'MAP' | 'LIST'>('MAP');
  const [centresList, setCentresList] = useState<ProcurementCentre[]>(store.getCentres());

  const userLocation: [number, number] = [22.6168, 88.4369];

  useEffect(() => {
    SupabaseDataService.getCentres().then(data => {
      if (data && data.length > 0) {
        setCentresList(data);
      }
    });
  }, []);

  const filteredCentres = centresList.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = cropFilter === 'All' || c.accepted_crops.some(cr => cr.toLowerCase().includes(cropFilter.toLowerCase()));
    return matchesSearch && matchesCrop;
  });

  useEffect(() => {
    if (filteredCentres.length > 0 && !selectedCentre) {
      setSelectedCentre(filteredCentres[0]);
    }
  }, [filteredCentres, selectedCentre]);

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] md:h-screen w-full relative font-sans">
      {/* Top Header */}
      <div className="bg-white px-6 py-4 border-b border-slate-200 z-10 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/farmer/dashboard')} 
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 text-slate-600 transition-colors shrink-0 shadow-xs"
            title="Back to Farmer Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
              Procurement Centre Locator
            </h1>
            <p className="text-xs text-slate-500">
              Smart algorithmic routing based on travel distance and live queue wait times.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search centres, blocks..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs w-48 sm:w-56 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-medium">
            {['All', 'Paddy', 'Wheat', 'Mustard'].map(crop => (
              <button
                key={crop}
                onClick={() => setCropFilter(crop)}
                className={`px-2.5 py-1 rounded-full text-[11px] transition-all ${
                  cropFilter === crop ? 'bg-emerald-700 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>

          <div className="md:hidden flex rounded-full border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              onClick={() => setViewMode('MAP')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold ${viewMode === 'MAP' ? 'bg-emerald-700 text-white' : 'text-slate-600'}`}
            >
              Map
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold ${viewMode === 'LIST' ? 'bg-emerald-700 text-white' : 'text-slate-600'}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Map Area */}
        <div className={`flex-1 relative bg-slate-200 z-0 ${viewMode === 'LIST' ? 'hidden md:block' : 'block h-[45vh] md:h-auto'}`}>
          <MapContainer 
            center={userLocation} 
            zoom={11} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User Location Marker */}
            <Marker 
              position={userLocation} 
              icon={new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41]
              })}
            >
              <Popup>
                <div className="p-1 text-center font-sans">
                  <p className="font-bold text-xs text-slate-900">Your Farm Location</p>
                  <p className="text-[10px] text-slate-500">North 24 Parganas</p>
                </div>
              </Popup>
            </Marker>

            {/* Centre Markers */}
            {filteredCentres.map((centre, index) => (
              <Marker 
                key={centre.id}
                position={[centre.latitude, centre.longitude]}
                icon={index === 0 ? bestIcon : defaultIcon}
                eventHandlers={{
                  click: () => setSelectedCentre(centre),
                }}
              >
                <Popup>
                  <div className="font-sans p-1 text-left min-w-36">
                    <p className="font-bold text-xs text-slate-900 leading-tight">{centre.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{centre.distance_km} km away • {centre.est_wait_time_mins} min wait</p>
                    <div className="mt-2 pt-1 border-t border-slate-100 flex justify-between items-center text-[10px]">
                      <span className="text-emerald-700 font-bold">{centre.current_queue_length} in queue</span>
                      <button 
                        onClick={() => navigate(`/farmer/book?centre=${centre.id}`)}
                        className="text-emerald-700 font-bold underline cursor-pointer"
                      >
                        Book Slot
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {selectedCentre && (
              <MapUpdater center={[selectedCentre.latitude, selectedCentre.longitude]} />
            )}
          </MapContainer>
        </div>

        {/* Sidebar List */}
        <div className={`w-full md:w-[420px] lg:w-[460px] bg-slate-50 border-l border-slate-200 flex flex-col ${viewMode === 'MAP' ? 'h-[55vh] md:h-auto' : 'h-full md:h-auto'} shrink-0 z-10`}>
          <div className="p-4 bg-white border-b border-slate-200 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-800 text-sm">Centres in District</span>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-bold">
                {filteredCentres.length} Active
              </Badge>
            </div>
            <span className="text-[11px] text-slate-400">Sorted by Efficiency</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredCentres.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-sm font-semibold">No centres matching your filters.</p>
                <button onClick={() => { setSearchTerm(''); setCropFilter('All'); }} className="text-xs text-emerald-700 font-bold mt-2 hover:underline">
                  Reset filters
                </button>
              </div>
            ) : (
              filteredCentres.map((centre, index) => {
                const isBest = index === 0;
                const isSelected = selectedCentre?.id === centre.id;
                
                return (
                  <Card 
                    key={centre.id} 
                    className={`p-0 overflow-hidden cursor-pointer transition-all border-2 rounded-2xl ${
                      isSelected ? 'border-emerald-600 shadow-md ring-1 ring-emerald-600/20' : 'border-transparent hover:border-slate-300 shadow-xs'
                    }`}
                    onClick={() => setSelectedCentre(centre)}
                  >
                    {isBest && (
                      <div className="bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider py-1.5 px-4 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Optimal Mandi (Fastest Turnaround)
                        </span>
                        <span>SAVE ~1.5 HRS</span>
                      </div>
                    )}
                    <div className="p-4 bg-white">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {centre.centre_code}
                          </span>
                          <h3 className="font-extrabold text-slate-900 text-sm mt-1">{centre.name}</h3>
                        </div>
                        <span className="text-xs font-bold text-slate-700 shrink-0 bg-slate-100 px-2 py-0.5 rounded-full">
                          {centre.distance_km} km
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-slate-500 mb-3 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{centre.address}</span>
                      </p>

                      <div className="flex items-center gap-3 text-xs mb-3">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-md font-semibold ${
                          centre.est_wait_time_mins < 30 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>~{centre.est_wait_time_mins} min wait</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-600 font-medium">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>{centre.current_queue_length} waiting</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {centre.accepted_crops.map((cr, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded">
                            {cr}
                          </span>
                        ))}
                      </div>
                      
                      {isSelected && (
                        <div className="pt-3 border-t border-slate-100 mt-2 flex gap-2 animate-in fade-in zoom-in-95 duration-200">
                          <Button 
                            className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold h-9 shadow-xs gap-1.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/farmer/book?centre=${centre.id}`);
                            }}
                          >
                            Book Slot Here <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                          <a 
                            href={`tel:${centre.contact_number}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 flex items-center justify-center"
                            title="Call Centre"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
