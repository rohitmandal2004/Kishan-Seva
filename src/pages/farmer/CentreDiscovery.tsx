import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Navigation, Clock, Users, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { MockCentreService } from '@/services/mockCentre.service';
import type { CentreWithStats } from '@/services/mockCentre.service';
import { useNavigate } from 'react-router-dom';

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
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
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

// Map Updater Component
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  return null;
}

export default function CentreDiscovery() {
  const navigate = useNavigate();
  const [centres, setCentres] = useState<CentreWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCentre, setSelectedCentre] = useState<CentreWithStats | null>(null);
  
  // Default to a location in North 24 Parganas, WB for demo
  const userLocation: [number, number] = [22.6168, 88.4369];

  useEffect(() => {
    const fetchCentres = async () => {
      setLoading(true);
      try {
        const data = await MockCentreService.getNearbyCentres(userLocation[0], userLocation[1]);
        setCentres(data);
        if (data.length > 0) {
          setSelectedCentre(data[0]); // Auto-select the best recommended
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCentres();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen w-full relative">
      {/* Top Header */}
      <div className="bg-white px-4 md:px-8 py-4 border-b z-10 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900">Smart Centre Discovery</h1>
        <p className="text-sm text-slate-500">Find the most efficient procurement centre based on distance and live queue wait time.</p>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Map Area */}
        <div className="flex-1 relative bg-slate-200 z-0 h-[40vh] md:h-auto">
          <MapContainer 
            center={userLocation} 
            zoom={12} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User Location Marker */}
            <Marker position={userLocation} icon={new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41]
              })}>
              <Popup>Your Location</Popup>
            </Marker>

            {/* Centre Markers */}
            {centres.map((centre, index) => (
              <Marker 
                key={centre.id}
                position={[centre.latitude, centre.longitude]}
                icon={index === 0 ? bestIcon : defaultIcon}
                eventHandlers={{
                  click: () => setSelectedCentre(centre),
                }}
              >
                <Popup>
                  <div className="font-semibold">{centre.name}</div>
                  <div className="text-xs text-slate-500">{centre.distance_km} km away</div>
                </Popup>
              </Marker>
            ))}
            
            {selectedCentre && <MapUpdater center={[selectedCentre.latitude, selectedCentre.longitude]} />}
          </MapContainer>
        </div>

        {/* Sidebar List */}
        <div className="w-full md:w-[400px] lg:w-[450px] bg-slate-50 border-l flex flex-col h-[60vh] md:h-auto shrink-0 z-10">
          <div className="p-4 bg-white border-b shrink-0 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Nearby Centres</h2>
            <Badge variant="outline" className="bg-slate-50">{centres.length} Found</Badge>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p>Analyzing optimal routes & queues...</p>
              </div>
            ) : (
              centres.map((centre, index) => {
                const isBest = index === 0;
                const isSelected = selectedCentre?.id === centre.id;
                
                return (
                  <Card 
                    key={centre.id} 
                    className={`p-0 overflow-hidden cursor-pointer transition-all border-2 ${isSelected ? 'border-green-600 shadow-md' : 'border-transparent hover:border-slate-300'}`}
                    onClick={() => setSelectedCentre(centre)}
                  >
                    {isBest && (
                      <div className="bg-green-700 text-white text-[10px] font-bold uppercase tracking-wider py-1.5 px-4 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" /> Recommended (Highest Journey Efficiency)
                      </div>
                    )}
                    <div className="p-4 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-900 pr-4">{centre.name}</h3>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-semibold text-slate-500">{centre.distance_km} km</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm mb-4">
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${centre.est_wait_time_mins < 30 ? 'bg-green-50 text-green-700' : centre.est_wait_time_mins < 60 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                          <Clock className="w-3.5 h-3.5" />
                          <span className="font-semibold">~{centre.est_wait_time_mins} min wait</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Users className="w-3.5 h-3.5" />
                          <span>{centre.current_queue_length} in queue</span>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="pt-3 border-t mt-3 animate-in fade-in zoom-in-95 duration-200">
                          <Button 
                            className="w-full bg-green-700 hover:bg-green-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/farmer/book?centre=${centre.id}`);
                            }}
                          >
                            Book Slot Here <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
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
