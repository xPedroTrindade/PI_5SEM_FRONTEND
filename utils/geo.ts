// =============================================================================
// utils/geo.ts — Geocodificação e rotas via OpenStreetMap (grátis, sem chave)
// -----------------------------------------------------------------------------
//   - searchAddress: autocomplete de endereços (Nominatim)
//   - getRoute:      distância, tempo e traçado da rota de carro (OSRM)
//
// >>> PARA TROCAR POR OUTRA API DEPOIS (ex.: Google Places + Distance Matrix):
//     reescreva as funções abaixo mantendo as MESMAS assinaturas e tipos.
//     Os componentes AddressAutocomplete e RouteMapView continuam funcionando. <<<
// =============================================================================

export interface GeoLocation {
    displayName: string;
    lat: number;
    lon: number;
}

export interface RouteResult {
    distanceKm: number;
    durationMin: number;
    coordinates: { latitude: number; longitude: number }[];
}

// Autocomplete de endereços (Nominatim / OpenStreetMap)
export async function searchAddress(query: string): Promise<GeoLocation[]> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=br&q=${encodeURIComponent(query)}`;
    const resp = await fetch(url, {
        headers: { Accept: 'application/json', 'Accept-Language': 'pt-BR' },
    });
    if (!resp.ok) return [];
    const json = await resp.json();
    if (!Array.isArray(json)) return [];
    return json.map((item: any) => ({
        displayName: String(item.display_name),
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
    }));
}

// Rota de carro entre dois pontos (OSRM) — distância, tempo e traçado
export async function getRoute(oLat: number, oLon: number, dLat: number, dLon: number): Promise<RouteResult> {
    const url = `https://router.project-osrm.org/route/v1/driving/${oLon},${oLat};${dLon},${dLat}?overview=full&geometries=geojson`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Falha ao calcular a rota.');
    const json = await resp.json();
    if (json.code !== 'Ok' || !Array.isArray(json.routes) || json.routes.length === 0) {
        throw new Error('Rota não encontrada.');
    }
    const route = json.routes[0];
    const coords: [number, number][] = route.geometry?.coordinates ?? [];
    return {
        distanceKm: route.distance / 1000,
        durationMin: Math.round(route.duration / 60),
        // GeoJSON vem como [lon, lat]; convertendo para {latitude, longitude}
        coordinates: coords.map(([lon, lat]) => ({ latitude: lat, longitude: lon })),
    };
}
