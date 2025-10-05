import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Gym {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  price_range: string;
}

interface GymMapProps {
  gyms: Gym[];
  onGymClick?: (gymId: string) => void;
}

const getMarkerColor = (rating: number) => {
  if (rating >= 4.5) return '#10B981'; // Green - Excellent
  if (rating >= 4.0) return '#3B82F6'; // Blue - Very Good
  if (rating >= 3.5) return '#F59E0B'; // Orange - Good
  if (rating >= 3.0) return '#EF4444'; // Red - Fair
  return '#6B7280'; // Gray - Poor
};

const createCustomIcon = (rating: number) => {
  const color = getMarkerColor(rating);
  
  return L.divIcon({
    className: 'custom-gym-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">📍</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const GymMap = ({ gyms, onGymClick }: GymMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || gyms.length === 0) return;

    // Clear existing map if any
    if (mapRef.current) {
      mapRef.current.remove();
    }

    // Calculate center point from all gyms
    const avgLat = gyms.reduce((sum, gym) => sum + Number(gym.latitude), 0) / gyms.length;
    const avgLng = gyms.reduce((sum, gym) => sum + Number(gym.longitude), 0) / gyms.length;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([avgLat, avgLng], 13);
    mapRef.current = map;

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Add markers for each gym
    gyms.forEach((gym) => {
      if (gym.latitude && gym.longitude) {
        const marker = L.marker([Number(gym.latitude), Number(gym.longitude)], {
          icon: createCustomIcon(gym.rating)
        }).addTo(map);

        // Add popup with gym info
        marker.bindPopup(`
          <div style="text-align: center; min-width: 150px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${gym.name}</h3>
            <div style="display: flex; align-items: center; justify-content: center; gap: 4px; margin-bottom: 4px;">
              <span style="color: #F59E0B;">⭐</span>
              <span style="font-weight: 600;">${gym.rating}</span>
            </div>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #6B7280;">${gym.address}</p>
            <p style="margin: 0; font-size: 12px; font-weight: 500;">${gym.price_range}</p>
          </div>
        `);

        // Handle marker click
        marker.on('click', () => {
          if (onGymClick) {
            onGymClick(gym.id);
          }
        });
      }
    });

    // Fit map to show all markers
    if (gyms.length > 0) {
      const bounds = L.latLngBounds(
        gyms.filter(g => g.latitude && g.longitude).map(g => [Number(g.latitude), Number(g.longitude)])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [gyms, onGymClick]);

  return (
    <div className="relative">
      <div 
        ref={mapContainerRef} 
        className="w-full h-[500px] rounded-lg shadow-lg z-0"
        style={{ minHeight: '500px' }}
      />
      
      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-card p-4 rounded-lg shadow-lg z-[1000] border">
        <h4 className="text-sm font-semibold mb-2">Rating Quality</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
            <span>Excellent (4.5+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
            <span>Very Good (4.0+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
            <span>Good (3.5+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
            <span>Fair (3.0+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#6B7280' }}></div>
            <span>Poor (&lt;3.0)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymMap;
