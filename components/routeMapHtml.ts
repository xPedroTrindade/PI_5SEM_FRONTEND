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
        : buildMissingKeyHtml();
}

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

function buildMissingKeyHtml(): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    html,body{height:100%;width:100%;margin:0;padding:0}
    body{display:flex;align-items:center;justify-content:center;background:#EEF1FF;color:#1A237E;font:600 13px system-ui;text-align:center;padding:12px;box-sizing:border-box}
  </style>
</head>
<body>Defina EXPO_PUBLIC_GOOGLE_MAPS_KEY no .env para exibir o mapa do Google.</body>
</html>`;
}
