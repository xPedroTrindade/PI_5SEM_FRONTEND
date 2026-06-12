// HTML do mapa usado pelo RouteMapView (WebView no celular, <iframe> no navegador).
// Se houver EXPO_PUBLIC_GOOGLE_MAPS_KEY -> usa o MAPA DO GOOGLE (Maps JavaScript API).
// Caso contrário -> usa Leaflet + tiles GRÁTIS do OpenStreetMap (fallback).

const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY;

type LatLng = { latitude: number; longitude: number };

export function buildRouteHtml(
    coordinates: LatLng[],
    oLat: number,
    oLon: number,
    dLat: number,
    dLon: number,
): string {
    return GOOGLE_KEY
        ? buildGoogleHtml(coordinates, oLat, oLon, dLat, dLon, GOOGLE_KEY)
        : buildOsmHtml(coordinates, oLat, oLon, dLat, dLon);
}

// ---- Mapa do Google (Maps JavaScript API) ----
function buildGoogleHtml(coords: LatLng[], oLat: number, oLon: number, dLat: number, dLon: number, key: string): string {
    const path = JSON.stringify(coords.map(c => ({ lat: c.latitude, lng: c.longitude })));
    return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>html,body,#map{height:100%;width:100%;margin:0;padding:0}</style>
  <script>
    function init() {
      var map = new google.maps.Map(document.getElementById('map'), { disableDefaultUI: true, clickableIcons: false });
      var path = ${path};
      var line = new google.maps.Polyline({ path: path, geodesic: true, strokeColor: '#1A237E', strokeOpacity: 0.9, strokeWeight: 5 });
      line.setMap(map);
      new google.maps.Marker({ position: { lat: ${oLat}, lng: ${oLon} }, map: map, label: 'A' });
      new google.maps.Marker({ position: { lat: ${dLat}, lng: ${dLon} }, map: map, label: 'B' });
      var b = new google.maps.LatLngBounds();
      if (path.length) { path.forEach(function (p) { b.extend(p); }); }
      else { b.extend({ lat: ${oLat}, lng: ${oLon} }); b.extend({ lat: ${dLat}, lng: ${dLon} }); }
      map.fitBounds(b, 24);
    }
  </script>
  <script async src="https://maps.googleapis.com/maps/api/js?key=${key}&callback=init"></script>
</head>
<body><div id="map"></div></body>
</html>`;
}

// ---- Fallback: Leaflet + OpenStreetMap (grátis) ----
function buildOsmHtml(coords: LatLng[], oLat: number, oLon: number, dLat: number, dLon: number): string {
    const polyline = JSON.stringify(coords.map(c => [c.latitude, c.longitude]));
    return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>*{margin:0;padding:0;box-sizing:border-box}html,body,#map{width:100%;height:100%}</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map',{zoomControl:false,attributionControl:false});
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
  L.circleMarker([${oLat},${oLon}],{radius:8,color:'#fff',weight:2,fillColor:'#1A237E',fillOpacity:1}).addTo(map);
  L.circleMarker([${dLat},${dLon}],{radius:8,color:'#fff',weight:2,fillColor:'#EF4444',fillOpacity:1}).addTo(map);
  var pl = L.polyline(${polyline},{color:'#1A237E',weight:5,opacity:0.85}).addTo(map);
  map.fitBounds(pl.getBounds(),{padding:[24,24]});
</script>
</body>
</html>`;
}
