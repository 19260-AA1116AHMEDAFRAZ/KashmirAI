'use client';

import { useEffect, useRef, useState } from 'react';
import type { LayerGroup, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// OpenStreetMap map (drawn with Leaflet) for the Plan page: a pin for the starting city, a pin for each
// destination (in visiting order) and a dashed line along the route. Tiles come from OpenStreetMap's public tile server,
// which requires the attribution shown in the corner.

export type MapPin = { lat: number; lon: number; label: string };

const PAKISTAN: [number, number] = [30.4, 69.3];
const FROM_COLOR = '#15503C'; // deep green
const TO_COLOR = '#B8891A'; // gold

// Straight-line distance in km (haversine).
export function distanceKm(a: MapPin, b: MapPin): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export function TripMap({ from, stops, label }: { from: MapPin | null; stops: MapPin[]; label: string }) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const pins = useRef<LayerGroup | null>(null);
  const lib = useRef<typeof import('leaflet') | null>(null);
  const [ready, setReady] = useState(false);

  // Start the map once. Leaflet needs the browser, so it is loaded here and not on the server.
  useEffect(() => {
    let stopped = false;
    import('leaflet').then((mod) => {
      if (stopped || !box.current) return;
      const L = mod.default ?? mod;
      lib.current = L;
      const m = L.map(box.current, { scrollWheelZoom: false, worldCopyJump: true }).setView(PAKISTAN, 5); // wheel stays free for scrolling the page
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      }).addTo(m);
      pins.current = L.layerGroup().addTo(m);
      map.current = m;
      setReady(true);
    });
    return () => {
      stopped = true;
      map.current?.remove();
      map.current = null;
      pins.current = null;
      setReady(false);
    };
  }, []);

  // Redraw when the pins change. The pins are compared by value (as text), so other re-renders leave the map alone.
  const signature = JSON.stringify({ from, stops });
  useEffect(() => {
    const L = lib.current;
    const m = map.current;
    const group = pins.current;
    if (!ready || !L || !m || !group) return;
    const data = JSON.parse(signature) as { from: MapPin | null; stops: MapPin[] };
    group.clearLayers();
    const points: [number, number][] = [];
    const add = (pin: MapPin, color: string) => {
      L.circleMarker([pin.lat, pin.lon], { radius: 9, color: '#fff', weight: 3, fillColor: color, fillOpacity: 1 })
        .bindTooltip(pin.label, { permanent: true, direction: 'top', offset: [0, -8] })
        .addTo(group);
      points.push([pin.lat, pin.lon]);
    };
    if (data.from) add(data.from, FROM_COLOR);
    for (const stop of data.stops) add(stop, TO_COLOR);
    if (points.length > 1) L.polyline(points, { color: FROM_COLOR, weight: 3, opacity: 0.7, dashArray: '6 8' }).addTo(group);

    if (points.length > 1) m.fitBounds(L.latLngBounds(points).pad(0.25), { maxZoom: 9, animate: true });
    else if (points.length === 1) m.setView(points[0], 9, { animate: true });
    else m.setView(PAKISTAN, 5);
  }, [ready, signature]);

  // isolate: keeps Leaflet's own stacking order from covering the sticky header and drop-downs.
  return <div ref={box} role="region" aria-label={label} className="isolate h-72 overflow-hidden rounded-xl border border-line bg-mint sm:h-80" />;
}
