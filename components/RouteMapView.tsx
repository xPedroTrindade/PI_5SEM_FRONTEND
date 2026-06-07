import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { GeoLocation, RouteResult, getRoute } from '../utils/geo';

interface Props {
    origin: GeoLocation;
    destination: GeoLocation;
    onRouteCalculated?: (result: RouteResult) => void;
}

function buildHtml(
    oLat: number, oLon: number,
    dLat: number, dLon: number,
    coords: { latitude: number; longitude: number }[],
) {
    const polyline = JSON.stringify(coords.map(c => [c.latitude, c.longitude]));
    return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body,#map{width:100%;height:100%}
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map',{zoomControl:false,attributionControl:false});
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
  L.circleMarker([${oLat},${oLon}],{radius:9,color:'#fff',weight:2,fillColor:'#1A237E',fillOpacity:1}).addTo(map);
  L.circleMarker([${dLat},${dLon}],{radius:9,color:'#fff',weight:2,fillColor:'#EF4444',fillOpacity:1}).addTo(map);
  var pl = L.polyline(${polyline},{color:'#1A237E',weight:5,opacity:0.85}).addTo(map);
  map.fitBounds(pl.getBounds(),{padding:[24,24]});
</script>
</body>
</html>`;
}

export function RouteMapView({ origin, destination, onRouteCalculated }: Props) {
    const [route, setRoute] = useState<RouteResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        setRoute(null);
        setError(false);
        setLoading(true);
        getRoute(origin.lat, origin.lon, destination.lat, destination.lon)
            .then(result => {
                setRoute(result);
                onRouteCalculated?.(result);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [origin.lat, origin.lon, destination.lat, destination.lon]);

    return (
        <View className="rounded-2xl overflow-hidden border border-surface-border mb-4">

            {loading && (
                <View style={{ height: 260 }} className="items-center justify-center bg-gray-50">
                    <ActivityIndicator size="large" color="#1A237E" />
                    <Text className="text-surface-muted text-sm mt-2">Calculando rota...</Text>
                </View>
            )}

            {!loading && error && (
                <View style={{ height: 260 }} className="items-center justify-center bg-gray-50">
                    <Text className="text-status-danger text-sm">Não foi possível calcular a rota.</Text>
                </View>
            )}

            {!loading && route && (
                <WebView
                    style={{ height: 200 }}
                    source={{ html: buildHtml(origin.lat, origin.lon, destination.lat, destination.lon, route.coordinates) }}
                    scrollEnabled={false}
                    javaScriptEnabled
                    originWhitelist={['*']}
                />
            )}

            {!loading && route && (
                <View className="flex-row justify-around items-center p-3 bg-background-paper">
                    <View className="items-center">
                        <Text className="text-surface-muted text-xs uppercase font-bold tracking-wider">Distância</Text>
                        <Text className="text-primary font-extrabold text-lg">{route.distanceKm.toFixed(1)} km</Text>
                    </View>
                    <View className="w-px h-8 bg-surface-border" />
                    <View className="items-center">
                        <Text className="text-surface-muted text-xs uppercase font-bold tracking-wider">Tempo Est.</Text>
                        <Text className="text-primary font-extrabold text-lg">{route.durationMin} min</Text>
                    </View>
                </View>
            )}
        </View>
    );
}
