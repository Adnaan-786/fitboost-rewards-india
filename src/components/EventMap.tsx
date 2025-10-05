import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Event {
  id: string;
  title: string;
  event_type: string;
  location_name: string;
  location_address: string;
  latitude: number;
  longitude: number;
  event_date: string;
}

interface EventMapProps {
  events: Event[];
  onEventClick?: (eventId: string) => void;
}

const getMarkerColor = (eventType: string) => {
  switch (eventType) {
    case 'Competition':
      return '#EF4444'; // Red
    case 'Workshop':
      return '#3B82F6'; // Blue
    case 'Meetup':
      return '#10B981'; // Green
    case 'Challenge':
      return '#F59E0B'; // Orange
    default:
      return '#6B7280'; // Gray
  }
};

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case 'Competition':
      return '🏆';
    case 'Workshop':
      return '📚';
    case 'Meetup':
      return '👥';
    case 'Challenge':
      return '💪';
    default:
      return '📍';
  }
};

const createCustomIcon = (eventType: string) => {
  const color = getMarkerColor(eventType);
  const icon = getEventIcon(eventType);
  
  return L.divIcon({
    className: 'custom-event-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 36px;
        height: 36px;
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
          font-size: 18px;
        ">${icon}</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

const EventMap = ({ events, onEventClick }: EventMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || events.length === 0) return;

    if (mapRef.current) {
      mapRef.current.remove();
    }

    const avgLat = events.reduce((sum, event) => sum + Number(event.latitude), 0) / events.length;
    const avgLng = events.reduce((sum, event) => sum + Number(event.longitude), 0) / events.length;

    const map = L.map(mapContainerRef.current).setView([avgLat, avgLng], 12);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    events.forEach((event) => {
      if (event.latitude && event.longitude) {
        const marker = L.marker([Number(event.latitude), Number(event.longitude)], {
          icon: createCustomIcon(event.event_type)
        }).addTo(map);

        const formattedDate = new Date(event.event_date).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });

        marker.bindPopup(`
          <div style="text-align: center; min-width: 180px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${event.title}</h3>
            <div style="display: inline-block; padding: 2px 8px; background-color: ${getMarkerColor(event.event_type)}; color: white; border-radius: 12px; font-size: 11px; margin-bottom: 8px;">
              ${event.event_type}
            </div>
            <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">📍 ${event.location_name}</p>
            <p style="margin: 4px 0; font-size: 12px; color: #6B7280;">${event.location_address}</p>
            <p style="margin: 8px 0 0 0; font-size: 13px; font-weight: 600;">📅 ${formattedDate}</p>
          </div>
        `);

        marker.on('click', () => {
          if (onEventClick) {
            onEventClick(event.id);
          }
        });
      }
    });

    if (events.length > 0) {
      const bounds = L.latLngBounds(
        events.filter(e => e.latitude && e.longitude).map(e => [Number(e.latitude), Number(e.longitude)])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [events, onEventClick]);

  return (
    <div className="relative">
      <div 
        ref={mapContainerRef} 
        className="w-full h-[450px] rounded-lg shadow-lg z-0"
      />
      
      <div className="absolute bottom-4 right-4 bg-card p-3 rounded-lg shadow-lg z-[1000] border">
        <h4 className="text-xs font-semibold mb-2">Event Types</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
            <span>Competition</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
            <span>Workshop</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
            <span>Meetup</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
            <span>Challenge</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventMap;
