import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapPin } from 'lucide-react';
import React from 'react';

// Fix the default Leaflet icon issue by overriding getIconUrl to return nothing
// and merging options with local imports or just overriding with SVG
delete (L.Icon.Default.prototype as any)._getIconUrl;

const createSvgIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-leaflet-icon',
    html: renderToStaticMarkup(
      React.createElement(
        'div',
        { style: { color, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' } },
        React.createElement(MapPin, { size: 36, fill: color, color: 'white', strokeWidth: 1.5 })
      )
    ),
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

export const defaultMapIcon = createSvgIcon('#3b82f6'); // Blue
export const greenMapIcon = createSvgIcon('#10b981'); // Emerald
export const orangeMapIcon = createSvgIcon('#f59e0b'); // Amber
export const purpleMapIcon = createSvgIcon('#8b5cf6'); // Purple
