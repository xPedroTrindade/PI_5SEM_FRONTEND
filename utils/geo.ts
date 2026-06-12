import api from '../config/api';

export interface GeoLocation {
    displayName: string;
    lat: number;
    lon: number;
}

export interface RouteResult {
    distanceKm: number;
    durationMin: number;
    tollBRL: number | null;
    coordinates: { latitude: number; longitude: number }[];
}

export interface Prediction {
    id: string;
    label: string;
    lat?: number;
    lon?: number;
}

export async function searchAddress(query: string): Promise<Prediction[]> {
    const { data } = await api.get('/api/maps/autocomplete', { params: { q: query } });
    if (!Array.isArray(data)) return [];
    return data.map((p: any) => ({ id: String(p.placeId), label: String(p.description) }));
}

export async function resolvePlace(p: Prediction): Promise<GeoLocation> {
    if (p.lat != null && p.lon != null) {
        return { displayName: p.label, lat: p.lat, lon: p.lon };
    }

    const { data } = await api.get(`/api/maps/place/${encodeURIComponent(p.id)}`);
    return {
        displayName: String(data.displayName ?? p.label),
        lat: Number(data.lat),
        lon: Number(data.lon),
    };
}

export async function getRoute(oLat: number, oLon: number, dLat: number, dLon: number): Promise<RouteResult> {
    const routes = await getRouteAlternatives(oLat, oLon, dLat, dLon);
    if (routes.length === 0) throw new Error('Rota nao encontrada.');
    return routes[0];
}

export async function getRouteAlternatives(oLat: number, oLon: number, dLat: number, dLon: number): Promise<RouteResult[]> {
    const { data } = await api.post('/api/maps/routes', { oLat, oLon, dLat, dLon });
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Nenhuma rota encontrada.');
    }
    return data as RouteResult[];
}
