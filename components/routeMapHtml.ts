// HTML do mapa (Leaflet + tiles GRÁTIS do OpenStreetMap) usado pelo RouteMapView.
// No celular vai dentro de um WebView; no navegador, dentro de um <iframe>.
export function buildRouteHtml(
    coordinates: { latitude: number; longitude: number }[],
    oLat: number,
    oLon: number,
    dLat: number,
    dLon: number,
): string {
    const polyline = JSON.stringify(coordinates.map(c => [c.latitude, c.longitude]));
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
