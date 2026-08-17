import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet-draw';

// Fix leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapPolygonDrawer = ({ coordinates, onChange, center = [51.505, -0.09], zoom = 13 }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawnItemsRef = useRef(new L.FeatureGroup());
  const drawControlRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    map.addLayer(drawnItemsRef.current);

    // Initialize draw control
    drawControlRef.current = new L.Control.Draw({
      edit: {
        featureGroup: drawnItemsRef.current,
        remove: true
      },
      draw: {
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#e1e100',
            message: '<strong>Oh snap!<strong> you can\'t draw that!'
          },
          shapeOptions: {
            color: 'var(--primary)',
            fillOpacity: 0.2
          }
        },
        polyline: false,
        circle: false,
        rectangle: false,
        marker: false,
        circlemarker: false
      }
    });

    map.addControl(drawControlRef.current);

    // Event listeners
    map.on(L.Draw.Event.CREATED, (e) => {
      // Clear existing layers if we only want 1 polygon per zone
      drawnItemsRef.current.clearLayers();
      const layer = e.layer;
      drawnItemsRef.current.addLayer(layer);
      
      const geojson = layer.toGeoJSON();
      onChange(geojson.geometry.coordinates[0]);
    });

    map.on(L.Draw.Event.EDITED, () => {
      const layers = drawnItemsRef.current.getLayers();
      if (layers.length > 0) {
        const geojson = layers[0].toGeoJSON();
        onChange(geojson.geometry.coordinates[0]);
      }
    });

    map.on(L.Draw.Event.DELETED, () => {
      onChange([]);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync incoming coordinates to map
  useEffect(() => {
    if (mapInstanceRef.current && drawnItemsRef.current && coordinates) {
      if (coordinates.length === 0) {
        drawnItemsRef.current.clearLayers();
      } else if (drawnItemsRef.current.getLayers().length === 0) {
        // Create polygon from coordinates if map is empty but we have data
        // Leaflet expects [lat, lng], geojson usually has [lng, lat]. 
        // Assuming coordinates are [lng, lat] from backend, we need to swap them for Leaflet
        const latLngs = coordinates.map(c => [c[1], c[0]]);
        const polygon = L.polygon(latLngs, { color: 'var(--primary)', fillOpacity: 0.2 });
        drawnItemsRef.current.addLayer(polygon);
        mapInstanceRef.current.fitBounds(polygon.getBounds());
      }
    }
  }, [coordinates]);

  return (
    <div style={{ width: '100%', height: '400px', borderRadius: '8px', zIndex: 0, position: 'relative' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
    </div>
  );
};

export default MapPolygonDrawer;
