import React from 'react';
import { buildRouteHtml } from './routeMapHtml';

interface Props {
    coordinates: { latitude: number; longitude: number }[];
    oLat: number;
    oLon: number;
    dLat: number;
    dLon: number;
    height?: number;
}

// Versão WEB do mapa: usa um <iframe> com Leaflet (o WebView do RN não roda no navegador).
export function RouteMapView({ coordinates, oLat, oLon, dLat, dLon, height = 200 }: Props) {
    const html = buildRouteHtml(coordinates, oLat, oLon, dLat, dLon);
    return React.createElement('iframe', {
        srcDoc: html,
        title: 'Mapa da rota',
        style: { width: '100%', height, border: 'none', display: 'block' },
    } as any);
}
