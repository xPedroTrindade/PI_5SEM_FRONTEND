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

import api from '../config/api';

export interface GeoLocation {
    displayName: string;
    lat: number;
    lon: number;
}

export interface RouteResult {
    distanceKm: number;
    durationMin: number;
    tollBRL: number | null;   // pedágio estimado (Google); null = sem pedágio / rota grátis (OSRM)
    coordinates: { latitude: number; longitude: number }[];
}

// Autocomplete de endereços (Nominatim / OpenStreetMap)
export async function searchAddress(query: string): Promise<GeoLocation[]> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=br&q=${encodeURIComponent(query)}`;
    const resp = await fetch(url, {
        headers: {
            Accept: 'application/json',
            'Accept-Language': 'pt-BR',
            // No navegador este header e ignorado; no celular identifica o app (exigencia do Nominatim)
            'User-Agent': 'DriverPro/1.0 (projeto-integrador)',
        },
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
        tollBRL: null,
        // GeoJSON vem como [lon, lat]; convertendo para {latitude, longitude}
        coordinates: coords.map(([lon, lat]) => ({ latitude: lat, longitude: lon })),
    };
}

// Rotas ALTERNATIVAS para o usuário escolher.
// 1º tenta o GOOGLE (via backend /api/maps/routes, com PEDÁGIO);
// se falhar (sem chave/offline), cai no OSRM (grátis, sem pedágio).
export async function getRouteAlternatives(oLat: number, oLon: number, dLat: number, dLon: number): Promise<RouteResult[]> {
    try {
        const { data } = await api.post('/api/maps/routes', { oLat, oLon, dLat, dLon });
        if (Array.isArray(data) && data.length > 0) return data as RouteResult[];
    } catch {
        // segue para o fallback OSRM
    }

    const url = `https://router.project-osrm.org/route/v1/driving/${oLon},${oLat};${dLon},${dLat}?alternatives=3&overview=full&geometries=geojson`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Falha ao calcular as rotas.');
    const json = await resp.json();
    if (json.code !== 'Ok' || !Array.isArray(json.routes) || json.routes.length === 0) {
        throw new Error('Nenhuma rota encontrada.');
    }
    return json.routes.map((route: any) => {
        const coords: [number, number][] = route.geometry?.coordinates ?? [];
        return {
            distanceKm: route.distance / 1000,
            durationMin: Math.round(route.duration / 60),
            tollBRL: null,
            coordinates: coords.map(([lon, lat]) => ({ latitude: lat, longitude: lon })),
        };
    });
}
