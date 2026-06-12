import React, { useEffect, useRef } from 'react';

const KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY;
const g: any = globalThis as any;

function loadGoogleMaps(): Promise<any> {
    return new Promise((resolve, reject) => {
        if (g.google?.maps) {
            resolve(g.google.maps);
            return;
        }

        const existing = g.document?.getElementById('gmaps-js');
        if (existing) {
            existing.addEventListener('load', () => resolve(g.google.maps));
            existing.addEventListener('error', reject);
            return;
        }

        const script = g.document.createElement('script');
        script.id = 'gmaps-js';
        script.async = true;
        script.src = 'https://maps.googleapis.com/maps/api/js?key=' + KEY;
        script.onload = () => resolve(g.google.maps);
        script.onerror = reject;
        g.document.head.appendChild(script);
    });
}

interface Props {
    coordinates: { latitude: number; longitude: number }[];
    oLat: number;
    oLon: number;
    dLat: number;
    dLon: number;
    height?: number;
}

export function RouteMapView({ coordinates, oLat, oLon, dLat, dLon, height = 200 }: Props) {
    const ref = useRef<any>(null);

    useEffect(() => {
        if (!KEY) return;

        let cancelled = false;
        loadGoogleMaps()
            .then((maps) => {
                if (cancelled || !ref.current) return;

                const map = new maps.Map(ref.current, { disableDefaultUI: true, clickableIcons: false });
                const path = coordinates.map((c) => ({ lat: c.latitude, lng: c.longitude }));
                new maps.Polyline({ path, strokeColor: '#1A237E', strokeOpacity: 0.9, strokeWeight: 5 }).setMap(map);
                new maps.Marker({ position: { lat: oLat, lng: oLon }, map, label: 'A' });
                new maps.Marker({ position: { lat: dLat, lng: dLon }, map, label: 'B' });

                const bounds = new maps.LatLngBounds();
                if (path.length) {
                    path.forEach((p: any) => bounds.extend(p));
                } else {
                    bounds.extend({ lat: oLat, lng: oLon });
                    bounds.extend({ lat: dLat, lng: dLon });
                }
                map.fitBounds(bounds, 24);
            })
            .catch(() => {});

        return () => {
            cancelled = true;
        };
    }, [coordinates, oLat, oLon, dLat, dLon]);

    if (!KEY) {
        return React.createElement(
            'div',
            {
                style: {
                    width: '100%',
                    height,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#EEF1FF',
                    color: '#1A237E',
                    fontSize: 13,
                    textAlign: 'center',
                    padding: 12,
                },
            } as any,
            'Defina EXPO_PUBLIC_GOOGLE_MAPS_KEY no .env para exibir o mapa do Google.',
        );
    }

    return React.createElement('div', { ref, style: { width: '100%', height } } as any);
}
