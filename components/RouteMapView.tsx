import React from 'react';
import { WebView } from 'react-native-webview';
import { buildRouteHtml } from './routeMapHtml';

interface Props {
    coordinates: { latitude: number; longitude: number }[];
    oLat: number;
    oLon: number;
    dLat: number;
    dLon: number;
    height?: number;
}

// Versão CELULAR do mapa (Android/iOS): usa WebView com Leaflet.
export function RouteMapView({ coordinates, oLat, oLon, dLat, dLon, height = 200 }: Props) {
    return (
        <WebView
            style={{ height }}
            source={{ html: buildRouteHtml(coordinates, oLat, oLon, dLat, dLon) }}
            scrollEnabled={false}
            javaScriptEnabled
            originWhitelist={['*']}
        />
    );
}
